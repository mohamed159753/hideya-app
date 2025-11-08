import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompetitionService } from '../../services/competition.service';
import { CategoryService } from '../../services/category.service';
import { AgeGroupService } from '../../services/age-group.service';
import { FormsModule } from '@angular/forms';

interface Competition {
  _id?: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  categoryIds: string[];
  genderGroups?: any[];
}

@Component({
  selector: 'app-admin-competition',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-competition.component.html',
  styleUrl: './admin-competition.component.css'
})
export class AdminCompetitionComponent implements OnInit {
  competitions: Competition[] = [];
  categories: any[] = [];
  allAgeGroups: any[] = [];

  genderConfig: Record<string, {
    male: boolean;
    female: boolean;
    children: { active: boolean; ageGroups: string[] };
  }> = {};

  competitionForm!: FormGroup;
  editingId: string | null = null;
  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private categoryService: CategoryService,
    private ageGroupService: AgeGroupService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCompetitions();
    this.loadCategories();
    this.loadAgeGroups();
  }

  initializeForm(): void {
    this.competitionForm = this.fb.group({
      title: ['', Validators.required],
      type: ['local', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      categoryIds: [[], Validators.required]
    });
  }

  // 🔹 Loaders
  loadCompetitions() {
    this.competitionService.getAll().subscribe({
      next: (data) => (this.competitions = data),
      error: (err) => console.error('❌ Error loading competitions:', err)
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('❌ Error loading categories:', err)
    });
  }

  loadAgeGroups() {
    this.ageGroupService.getAgeGroups().subscribe({
      next: (data) => (this.allAgeGroups = data),
      error: (err) => console.error('❌ Error loading age groups:', err)
    });
  }

  // 🔹 Wizard navigation
  goNext() {
  if (this.currentStep === 1) {
    const { title, type, startDate, endDate } = this.competitionForm.value;
    if (!title || !type || !startDate || !endDate) {
      alert('يرجى إكمال بيانات المسابقة قبل المتابعة');
      return;
    }
  }

  if (this.currentStep === 2 && !this.hasValidGenderConfig()) {
    alert('الرجاء إعداد الفئات والجنس على الأقل لفئة واحدة');
    return;
  }

  this.currentStep++;
}

  goBack() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // 🔹 Category & Gender configuration
  onCategoryChange(event: any) {
    const categoryId = event.target.value;
    const checked = event.target.checked;
    const current = this.competitionForm.value.categoryIds as string[];

    if (checked) {
      this.competitionForm.patchValue({ categoryIds: [...current, categoryId] });
      this.genderConfig[categoryId] = this.genderConfig[categoryId] || {
        male: false,
        female: false,
        children: { active: false, ageGroups: [] }
      };
    } else {
      this.competitionForm.patchValue({
        categoryIds: current.filter(id => id !== categoryId)
      });
      delete this.genderConfig[categoryId];
    }
  }

  toggleGender(catId: string, gender: 'male' | 'female' | 'children', event: any) {
    if (!this.genderConfig[catId]) {
      this.genderConfig[catId] = { male: false, female: false, children: { active: false, ageGroups: [] } };
    }
    if (gender === 'children') {
      this.genderConfig[catId].children.active = event.target.checked;
    } else {
      this.genderConfig[catId][gender] = event.target.checked;
    }
  }

  updateChildrenAgeGroups(catId: string, event: any) {
    const selected = Array.from(event.target.selectedOptions).map((o: any) => o.value);
    this.genderConfig[catId].children.ageGroups = selected;
  }

  hasValidGenderConfig(): boolean {
    return Object.values(this.genderConfig).some(cfg =>
      cfg.male || cfg.female || cfg.children.active
    );
  }

  buildGenderGroups() {
    const output: any[] = [];
    for (const [catId, cfgRaw] of Object.entries(this.genderConfig)) {
      const cfg = cfgRaw as {
        male: boolean;
        female: boolean;
        children: { active: boolean; ageGroups: string[] };
      };
      if (cfg.male) output.push({ categoryId: catId, gender: 'male' });
      if (cfg.female) output.push({ categoryId: catId, gender: 'female' });
      if (cfg.children.active) {
        output.push({
          categoryId: catId,
          gender: 'children',
          ageGroupIds: cfg.children.ageGroups || []
        });
      }
    }
    return output;
  }

  // 🔹 Submit
  onSubmit() {
    const competition: Competition = {
      ...this.competitionForm.value,
      genderGroups: this.buildGenderGroups()
    };

    this.competitionService.add(competition).subscribe({
      next: () => {
        alert('تم إنشاء المسابقة بنجاح ✅');
        this.loadCompetitions();
        this.resetWizard();
      },
      error: (err) => console.error('❌ Error adding competition:', err)
    });
  }

  // 🔹 Utility
  resetWizard() {
    this.competitionForm.reset({ type: 'local' });
    this.genderConfig = {};
    this.currentStep = 1;
  }

  formatDate(date: string) {
    return new Date(date).toLocaleString('ar-TN');
  }

  getCategoryNames(comp: any) {
    if (!comp) return '';
    const ids = comp.categoryIds || [];
    return ids.map((c: any) => (c.name || c)).join(', ');
  }

  getCategoryNameById(id: string): string {
    const cat = this.categories.find(c => c._id === id);
    return cat ? cat.name : '';
  }
}
