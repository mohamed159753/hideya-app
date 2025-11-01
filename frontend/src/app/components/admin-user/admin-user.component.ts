import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, IUser } from '../../services/user.service';


@Component({
  selector: 'app-admin-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-user.component.html',
  styleUrl: './admin-user.component.css'
})
export class AdminUserComponent {

  users: IUser[] = [];
  userForm: FormGroup;
  editId: string | null = null;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['jury', Validators.required],
      canBePresident: [false],
      expertiseLevel: [1]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error loading users', err)
    });
  }

  submit() {
    if (this.userForm.invalid) return;
    const payload = this.userForm.value as IUser;
    if (this.editId) {
      this.userService.update(this.editId, payload).subscribe(() => {
        this.editId = null;
        this.userForm.reset({ role: 'jury', canBePresident: false, expertiseLevel: 1 });
        this.loadUsers();
      });
    } else {
      // default password for new jury members - backend should handle hashing
      (payload as any).password = 'password123';
      this.userService.create(payload).subscribe(() => {
        this.userForm.reset({ role: 'jury', canBePresident: false, expertiseLevel: 1 });
        this.loadUsers();
      });
    }
  }

  edit(user: IUser) {
    this.editId = user._id ?? null;
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      canBePresident: !!user.canBePresident,
      expertiseLevel: user.expertiseLevel ?? 1
    });
  }

  cancelEdit() {
    this.editId = null;
    this.userForm.reset({ role: 'jury', canBePresident: false, expertiseLevel: 1 });
  }

  delete(id?: string) {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف المستخدم؟')) return;
    this.userService.delete(id).subscribe(() => this.loadUsers());
  }

}
