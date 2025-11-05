import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompetitionService } from '../../services/competition.service';
import { CategoryService } from '../../services/category.service';
import { JuryAssignmentService, IJuryAssignment } from '../../services/jury-assignment.service';
import { UserService, IUser } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

interface Competition {
  _id?: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  categoryIds: string[];
}

@Component({
  selector: 'app-admin-competition',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './admin-competition.component.html',
  styleUrl: './admin-competition.component.css'
})
export class AdminCompetitionComponent implements OnInit {
  competitions: Competition[] = [];
  categories: any[] = [];
  competitionForm!: FormGroup;
  editingId: string | null = null;
  // modal / assignment
  showAssignmentsModal = false;
  selectedCompetition: any = null;
  assignments: IJuryAssignment[] = [];
  users: IUser[] = [];
  assignmentForm!: FormGroup;
  assignmentDraft: any = { classRoom: '', presidentId: '', memberIds: [] };
  editingAssignmentId: string | null = null;
  editingCategoryId: string | null = null;
  // Filters for users
  filterExpertiseMin: number | null = null;
  filterCanBePresident: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private categoryService: CategoryService
    , private juryAssignmentService: JuryAssignmentService
    , private userService: UserService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCompetitions();
    this.loadCategories();
  }

  initAssignmentForm() {
    this.assignmentForm = this.fb.group({
      classRoom: [''],
      presidentId: [''],
      memberIds: [[]]
    });
    this.assignmentDraft = { classRoom: '', presidentId: '', memberIds: [] };
  }

  initializeForm(): void {
    this.competitionForm = this.fb.group({
      title: ['', [Validators.required]],
      type: ['local', [Validators.required]],
      categoryIds: [[], [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    });
  }

  loadCompetitions(): void {
    this.competitionService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Competitions loaded:', data);
        this.competitions = data;
      },
      error: (err) => {
        console.error('❌ Error loading competitions:', err);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
      }
    });
  }

  openAssignments(competition: any) {
    this.selectedCompetition = competition;
    this.showAssignmentsModal = true;
    this.initAssignmentForm();
    // load users (jury only)
    this.userService.getAll().subscribe(users => {
      this.users = users.filter((u: IUser) => u.role === 'jury');
      // reset filters and draft
      this.filterExpertiseMin = null;
      this.filterCanBePresident = null;
      this.assignmentDraft = { classRoom: '', presidentId: '', memberIds: [] };
    });
    // load existing assignments for this competition
    this.juryAssignmentService.getByCompetition(competition._id).subscribe(a => {
      this.assignments = a;
    });
  }

  closeAssignments() {
    this.showAssignmentsModal = false;
    this.selectedCompetition = null;
    this.assignments = [];
    this.editingAssignmentId = null;
  }

  startEditAssignment(assignment?: IJuryAssignment | any) {
    // Accept undefined for new assignment or partial object
    if (!assignment) return this.openNewAssignmentForCategory(null);

    this.editingAssignmentId = (assignment._id as string) || null;
    this.editingCategoryId = (assignment as any).categoryId && ((assignment as any).categoryId._id || (assignment as any).categoryId) || null;
    const president = (assignment.juryMembers || []).find((m: any) => m.role === 'president');
    const members = (assignment.juryMembers || []).filter((m: any) => m.role === 'member').map((m: any) => ((m.userId && (m.userId._id || m.userId)) || m.userId));
    const presidentId = president ? ((president.userId && (president.userId._id || president.userId)) || president.userId) : '';
    this.assignmentForm.patchValue({ classRoom: assignment.classRoom || '', presidentId: presidentId || '', memberIds: members });
    this.assignmentDraft = { classRoom: assignment.classRoom || '', presidentId: presidentId || '', memberIds: members };
  }

  openNewAssignmentForCategory(cat: any) {
    // prepare draft for a new assignment for category 'cat'
    const catId = cat ? (cat._id || cat) : null;
    this.editingAssignmentId = null;
    this.editingCategoryId = catId;
    this.assignmentDraft = { classRoom: '', presidentId: '', memberIds: [] };
    this.assignmentForm.reset({ classRoom: '', presidentId: '', memberIds: [] });
  }

  // Return users filtered by current filter settings
  getFilteredUsers(): IUser[] {
    return this.users.filter(u => {
      if (this.filterCanBePresident !== null) {
        if (!!u.canBePresident !== !!this.filterCanBePresident) return false;
      }
      if (this.filterExpertiseMin !== null) {
        const lvl = typeof u.expertiseLevel === 'number' ? u.expertiseLevel : 0;
        if (lvl < this.filterExpertiseMin) return false;
      }
      return true;
    });
  }

  onPresidentChange(newId: string) {
    this.assignmentDraft.presidentId = newId;
    // remove from members if present
    if (!this.assignmentDraft.memberIds) this.assignmentDraft.memberIds = [];
    this.assignmentDraft.memberIds = this.assignmentDraft.memberIds.filter((id: string) => id !== newId);
  }

  onMemberIdsChange(newIds: string[]) {
    this.assignmentDraft.memberIds = newIds || [];
    // if president is among members, clear president
    if (this.assignmentDraft.presidentId && this.assignmentDraft.memberIds.includes(this.assignmentDraft.presidentId)) {
      this.assignmentDraft.presidentId = '';
    }
  }

  submitAssignment(categoryId: string) {
    if (!this.selectedCompetition) return;
    const val = this.assignmentDraft || this.assignmentForm.value;
    const juryMembers: any[] = [];
    if (val.presidentId) juryMembers.push({ userId: val.presidentId, role: 'president' });
    (val.memberIds || []).forEach((id: string) => juryMembers.push({ userId: id, role: 'member' }));

    // Basic validation: one president and at least 2 others
    const membersCount = juryMembers.filter(m => m.role === 'member').length;
    const presidents = juryMembers.filter(m => m.role === 'president').length;
    if (presidents !== 1 || membersCount < 2) {
      alert('الرجاء اختيار رئيس واحد وعدد 2 على الأقل من الأعضاء.');
      return;
    }

    const payload = {
      competitionId: this.selectedCompetition._id,
      categoryId,
      classRoom: val.classRoom,
      juryMembers
    };

    if (this.editingAssignmentId) {
      this.juryAssignmentService.update(this.editingAssignmentId, payload).subscribe(() => {
        this.juryAssignmentService.getByCompetition(this.selectedCompetition._id).subscribe(a => this.assignments = a);
        this.editingAssignmentId = null;
        this.initAssignmentForm();
        this.editingCategoryId = null;
      });
    } else {
      this.juryAssignmentService.create(payload).subscribe(() => {
        this.juryAssignmentService.getByCompetition(this.selectedCompetition._id).subscribe(a => this.assignments = a);
        this.initAssignmentForm();
        this.editingCategoryId = null;
      });
    }
  }

  deleteAssignment(id?: string) {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف التعيين؟')) return;
    this.juryAssignmentService.delete(id).subscribe(() => {
      if (this.selectedCompetition) this.juryAssignmentService.getByCompetition(this.selectedCompetition._id).subscribe(a => this.assignments = a);
    });
  }

  getAssignmentForCategory(catId: string): IJuryAssignment | undefined {
    return this.assignments.find(a => {
      const cid = (a as any).categoryId;
      const id = cid && (cid._id || cid);
      return id === catId;
    });
  }

  formatUserName(userOrId: any) {
    if (!userOrId) return '';
    if (typeof userOrId === 'string') return userOrId;
    return ((userOrId.firstName || '') + ' ' + (userOrId.lastName || '')).trim();
  }

  getCategoryNames(comp: any) {
    if (!comp) return '';
    const ids = comp.categoryIds || [];
    return ids.map((c: any) => (c && (c.name || c)) || '').filter((n: string) => !!n).join(', ');
  }

  onSubmit(): void {
    if (this.competitionForm.invalid) return;

    if (this.editingId) {
      this.updateCompetition();
    } else {
      this.addCompetition();
    }
  }

  addCompetition(): void {
    const newCompetition: Competition = {
      title: this.competitionForm.value.title,
      type: this.competitionForm.value.type,
      startDate: this.competitionForm.value.startDate,
      endDate: this.competitionForm.value.endDate,
      categoryIds: this.competitionForm.value.categoryIds
    };

    this.competitionService.add(newCompetition).subscribe({
      next: () => {
        this.loadCompetitions();
        this.competitionForm.reset({ type: 'local' });
      },
      error: (err) => {
        console.error('❌ Error adding competition:', err);
      }
    });
  }

  updateCompetition(): void {
    if (!this.editingId) return;

    const updatedCompetition: Competition = {
      title: this.competitionForm.value.title,
      type: this.competitionForm.value.type,
      startDate: this.competitionForm.value.startDate,
      endDate: this.competitionForm.value.endDate,
      categoryIds: this.competitionForm.value.categoryIds
    };

    this.competitionService.update(this.editingId, updatedCompetition).subscribe({
      next: () => {
        this.loadCompetitions();
        this.editingId = null;
        this.competitionForm.reset({ type: 'local' });
      },
      error: (err) => {
        console.error('❌ Error updating competition:', err);
      }
    });
  }

  onEdit(competition: Competition): void {
    const toLocalDateTime = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    };

    this.competitionForm.patchValue({
      title: competition.title,
      type: competition.type,
      startDate: toLocalDateTime(competition.startDate),
      endDate: toLocalDateTime(competition.endDate),
      categoryIds: competition.categoryIds || []
    });

    this.editingId = competition._id ?? null;
  }

  onDelete(id: string): void {
    this.competitionService.delete(id).subscribe({
      next: () => this.loadCompetitions(),
      error: (err) => console.error('❌ Error deleting competition:', err)
    });
  }

  onCancel(): void {
    this.competitionForm.reset({ type: 'local' });
    this.editingId = null;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('ar-TN');
  }

  onCategoryCheckboxChange(event: any) {
  const categoryId = event.target.value;
  const checked = event.target.checked;
  const current = this.competitionForm.value.categoryIds as string[];

  if (checked) {
    this.competitionForm.patchValue({
      categoryIds: [...current, categoryId]
    });
  } else {
    this.competitionForm.patchValue({
      categoryIds: current.filter(id => id !== categoryId)
    });
  }
}
}
