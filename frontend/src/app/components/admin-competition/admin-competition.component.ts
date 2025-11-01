import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompetitionService } from '../../services/competition.service';
import { CategoryService } from '../../services/category.service';

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
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-competition.component.html',
  styleUrl: './admin-competition.component.css'
})
export class AdminCompetitionComponent implements OnInit {
  competitions: Competition[] = [];
  categories: any[] = [];
  competitionForm!: FormGroup;
  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private categoryService: CategoryService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCompetitions();
    this.loadCategories();
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
}
