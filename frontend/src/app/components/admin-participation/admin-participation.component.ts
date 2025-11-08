import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../services/competition.service';
import { AdminAddService } from '../../services/admin-add.service';
import { ParticipationService } from '../../services/participation.service';
import { AgeGroupService } from '../../services/age-group.service';

interface SubCategoryOption {
  value: string; // e.g., 'male', 'female', 'children_<ageGroupId>'
  label: string; // e.g., 'ذكور', 'إناث', 'أطفال 6-12'
  categoryId: string;
}

@Component({
  selector: 'app-admin-participation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-participation.component.html',
  styleUrls: ['./admin-participation.component.css'],
})
export class AdminParticipationComponent implements OnInit {
  participationForm!: FormGroup;
  competitions: any[] = [];
  categories: any[] = [];
  competitors: any[] = [];
  participations: any[] = [];
  allAgeGroups: any[] = [];

  // Subcategories based on selected competition
  subCategoryOptions: SubCategoryOption[] = [];

  // Modal state
  modalOpen = false;
  selectedCompetitors: string[] = [];

  // Gender config rebuilt from competition
  genderConfig: Record<string, {
    male: boolean;
    female: boolean;
    children: { active: boolean; ageGroups: string[] };
  }> = {};

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private competitorService: AdminAddService,
    private participationService: ParticipationService,
    private ageGroupService: AgeGroupService
  ) {}

  ngOnInit(): void {
    this.participationForm = this.fb.group({
      competitionId: ['', Validators.required],
      categoryId: ['', Validators.required],
      subCategory: ['', Validators.required], // NEW
      competitorIds: [[], Validators.required],
    });

    this.loadCompetitions();
    this.loadCompetitors();
    this.loadParticipations();
    this.loadAgeGroups();
  }

  loadCompetitions() {
    this.competitionService.getAll().subscribe({
      next: (data) => {
        this.competitions = data || [];
      },
      error: (error) => {
        console.error('Error loading competitions:', error);
        this.competitions = [];
      },
    });
  }

  loadCompetitors() {
    this.competitorService.getAll().subscribe({
      next: (data) => {
        this.competitors = data || [];
      },
      error: (error) => {
        console.error('Error loading competitors:', error);
        this.competitors = [];
      },
    });
  }

  loadParticipations() {
    this.participationService.getAll().subscribe({
      next: (data) => {
        this.participations = data || [];
      },
      error: (error) => {
        console.error('Error loading participations:', error);
        this.participations = [];
      },
    });
  }

  loadAgeGroups() {
    this.ageGroupService.getAgeGroups().subscribe({
      next: (data) => {
        this.allAgeGroups = data || [];
      },
      error: (error) => {
        console.error('Error loading age groups:', error);
        this.allAgeGroups = [];
      },
    });
  }

  onCompetitionChange() {
    const competitionId = this.participationForm.get('competitionId')?.value;
    if (competitionId) {
      const selectedCompetition = this.competitions.find(
        (c) => c._id === competitionId
      );
      
      this.categories = selectedCompetition?.categoryIds || [];
      this.rebuildGenderConfig(selectedCompetition);
      
      this.participationForm.get('categoryId')?.setValue('');
      this.participationForm.get('subCategory')?.setValue('');
      this.subCategoryOptions = [];
    } else {
      this.categories = [];
      this.subCategoryOptions = [];
      this.genderConfig = {};
    }
  }

  onCategoryChange() {
    const categoryId = this.participationForm.get('categoryId')?.value;
    this.participationForm.get('subCategory')?.setValue('');
    
    if (categoryId) {
      this.generateSubCategoriesForCategory(categoryId);
    } else {
      this.subCategoryOptions = [];
    }
  }

  /**
   * Rebuild genderConfig from competition's genderGroups
   */
  rebuildGenderConfig(comp: any) {
    this.genderConfig = {};
    
    if (!comp || !comp.genderGroups || comp.genderGroups.length === 0) {
      return;
    }

    // Initialize for all categories
    for (const catId of comp.categoryIds) {
      const id = typeof catId === 'string' ? catId : catId._id;
      this.genderConfig[id] = {
        male: false,
        female: false,
        children: { active: false, ageGroups: [] }
      };
    }

    // Populate from genderGroups
    for (const group of comp.genderGroups) {
      const catId = typeof group.categoryId === 'string' ? group.categoryId : group.categoryId._id;
      
      if (!this.genderConfig[catId]) {
        this.genderConfig[catId] = {
          male: false,
          female: false,
          children: { active: false, ageGroups: [] }
        };
      }

      if (group.gender === 'male') {
        this.genderConfig[catId].male = true;
      } else if (group.gender === 'female') {
        this.genderConfig[catId].female = true;
      } else if (group.gender === 'children') {
        this.genderConfig[catId].children.active = true;
        this.genderConfig[catId].children.ageGroups = (group.ageGroupIds || []).map((ag: any) => 
          typeof ag === 'string' ? ag : ag._id
        );
      }
    }
  }

  /**
   * Generate subcategory options for a specific category
   */
  generateSubCategoriesForCategory(categoryId: string) {
    this.subCategoryOptions = [];
    
    const cfg = this.genderConfig[categoryId];
    if (!cfg) return;

    const catName = this.getCategoryNameById(categoryId);

    if (cfg.male) {
      this.subCategoryOptions.push({
        value: 'male',
        label: `${catName} - ذكور`,
        categoryId
      });
    }

    if (cfg.female) {
      this.subCategoryOptions.push({
        value: 'female',
        label: `${catName} - إناث`,
        categoryId
      });
    }

    if (cfg.children.active) {
      for (const ageId of cfg.children.ageGroups) {
        const ageName = this.allAgeGroups.find(a => a._id === ageId)?.name || ageId;
        this.subCategoryOptions.push({
          value: `children_${ageId}`,
          label: `${catName} - أطفال ${ageName}`,
          categoryId
        });
      }
    }
  }

  // Modal handlers
  openModal() {
    const subCategory = this.participationForm.get('subCategory')?.value;
    if (!subCategory) {
      alert('الرجاء اختيار الفئة الفرعية أولاً');
      return;
    }

    this.modalOpen = true;
    this.selectedCompetitors = [
      ...(this.participationForm.get('competitorIds')?.value || []),
    ];
  }

  closeModal() {
    this.modalOpen = false;
  }

  toggleCompetitor(id: string) {
    if (!id) return;

    const idx = this.selectedCompetitors.indexOf(id);
    if (idx > -1) {
      this.selectedCompetitors.splice(idx, 1);
    } else {
      this.selectedCompetitors.push(id);
    }
  }

  confirmSelection() {
    this.participationForm
      .get('competitorIds')
      ?.setValue(this.selectedCompetitors);
    this.closeModal();
  }

  /**
   * Filter competitors based on selected subcategory
   * Note: Competitor model uses Arabic gender values: "ذكر" and "أنثى"
   */
  getFilteredCompetitors(): any[] {
    const subCategory = this.participationForm.get('subCategory')?.value;
    if (!subCategory) return this.competitors;

    return this.competitors.filter(comp => {
      // Filter by gender for male/female subcategories
      if (subCategory === 'male') {
        return comp.gender === 'ذكر';
      }
      if (subCategory === 'female') {
        return comp.gender === 'أنثى';
      }
      
      // Filter by age group for children subcategories
      if (subCategory.startsWith('children_')) {
        const ageGroupId = subCategory.replace('children_', '');
        const ageGroup = this.allAgeGroups.find(ag => ag._id === ageGroupId);
        
        if (ageGroup && ageGroup.from !== undefined && ageGroup.to !== undefined) {
          return comp.age >= ageGroup.from && comp.age <= ageGroup.to;
        }
      }
      
      return false;
    });
  }

  onSubmit() {
    if (this.participationForm.valid) {
      const { competitionId, categoryId, subCategory, competitorIds } =
        this.participationForm.value;

      this.participationService
        .registerMultiple(competitionId, categoryId, subCategory, competitorIds)
        .subscribe({
          next: () => {
            alert('تم تسجيل المشاركين بنجاح ✅');
            this.participationForm.reset();
            this.selectedCompetitors = [];
            this.categories = [];
            this.subCategoryOptions = [];
            this.loadParticipations();
          },
          error: (error) => {
            console.error('Error registering participants:', error);
            alert('حدث خطأ أثناء التسجيل');
          },
        });
    }
  }

  onDelete(id: string) {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف هذه المشاركة؟')) return;

    this.participationService.delete(id).subscribe({
      next: () => {
        alert('تم الحذف بنجاح');
        this.loadParticipations();
      },
      error: (error) => {
        console.error('Error deleting participation:', error);
        alert('حدث خطأ أثناء الحذف');
      },
    });
  }

  // Helper methods
  getCategoryNameById(id: string | any): string {
    if (typeof id === 'object' && id !== null) {
      return id.name || id._id || 'Unknown';
    }
    const cat = this.categories.find(c => c._id === id);
    return cat ? cat.name : id;
  }

  getBranchName(branchData: any): string {
    if (!branchData) return '-';
    // If it's already populated (object with name)
    if (typeof branchData === 'object' && branchData.name) {
      return branchData.name;
    }
    // If it's just an ID, return the ID (can't look up without branches array)
    return branchData;
  }

  formatSubCategory(subCategory: string | undefined): string {
    if (!subCategory) return 'غير محدد'; // Handle undefined/null
    if (subCategory === 'male') return 'ذكور';
    if (subCategory === 'female') return 'إناث';
    if (subCategory.startsWith('children_')) {
      const ageGroupId = subCategory.replace('children_', '');
      const ageGroup = this.allAgeGroups.find(a => a._id === ageGroupId);
      return ageGroup ? `أطفال ${ageGroup.name}` : 'أطفال';
    }
    return subCategory;
  }
}