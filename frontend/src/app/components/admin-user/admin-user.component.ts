import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // ✅ for ngModel
import { UserService, IUser } from '../../services/user.service';

@Component({
  selector: 'app-admin-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // ✅ added FormsModule
  templateUrl: './admin-user.component.html',
  styleUrl: './admin-user.component.css'
})
export class AdminUserComponent {
  users: IUser[] = [];
  filteredUsers: IUser[] = []; // ✅ new
  userForm: FormGroup;
  editId: string | null = null;

  // ✅ filters object
 filters = {
  query: '',
  role: '',
  canBePresident: '' 
};
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
      next: (data) => {
        this.users = data;
        this.applyFilters(); // ✅ apply filters automatically
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  // ✅ Filter logic
  applyFilters() {
  const { query, role, canBePresident } = this.filters;
  const lowerQuery = (query || '').toLowerCase().trim();

  this.filteredUsers = this.users.filter(u => {
    const firstName = (u.firstName || '').toLowerCase();
    const lastName = (u.lastName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const userRole = (u.role || '').toLowerCase();

    const matchesQuery =
      !lowerQuery ||
      firstName.includes(lowerQuery) ||
      lastName.includes(lowerQuery) ||
      email.includes(lowerQuery);

    const matchesRole = !role || userRole === role.toLowerCase();

    // ✅ New: handle "رشح رئيسًا" filter
    const matchesCanBePresident =
      canBePresident === ''
        ? true
        : String(u.canBePresident) === canBePresident;

    return matchesQuery && matchesRole && matchesCanBePresident;
  });
}


printTable() {
  // Clone the table section to modify it without touching the real DOM
  const tableCard = document.querySelector('.table-card')?.cloneNode(true) as HTMLElement;
  if (!tableCard) return;

  // ✅ Remove the "الإجراءات" (Actions) column (last column)
  tableCard.querySelectorAll('th:last-child, td:last-child').forEach(el => el.remove());

  // ✅ Remove the filters section
  tableCard.querySelector('.filters')?.remove();


  // Extract the cleaned HTML
  const printContent = tableCard.innerHTML;

  const printWindow = window.open('', '', 'width=900,height=650');
  printWindow?.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>طباعة - أعضاء اللجنة</title>
        <style>
          body {
            font-family: 'Tahoma', sans-serif;
            direction: rtl;
            margin: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #aaa;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f3f3f3;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h2>قائمة أعضاء اللجنة</h2>
        ${printContent}
      </body>
    </html>
  `);
  printWindow?.document.close();
  printWindow?.print();
}
  resetFilters() {
    this.filters = { query: '', role: '', canBePresident: '' };
    this.applyFilters();
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
      (payload as any).password = 'Hideya000111@';
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
