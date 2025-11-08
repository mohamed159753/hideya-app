import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompetitionService } from '../../services/competition.service';
import { CompetitionCategoryService, ICompetitionCategory } from '../../services/competetion-category.service';
import { AgeGroupService } from '../../services/age-group.service';
import { CategoryService } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-competition-category-config',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './competition-category-config.component.html',
  styleUrl: './competition-category-config.component.css'
})
export class CompetitionCategoryConfigComponent {


  competitionId: string = '';
  competition: any = null;
  baseCategories: any[] = []; // The Hizb levels
  ageGroups: any[] = [];
  competitionCategories: ICompetitionCategory[] = [];
  
  // For adding new competition categories
  newCompCategory: { [categoryId: string]: { ageGroupId: string; gender: string } } = {};
  
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionService,
    private compCategoryService: CompetitionCategoryService,
    private ageGroupService: AgeGroupService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.competitionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.competitionId) {
      this.loadCompetition();
      this.loadAgeGroups();
      this.loadCompetitionCategories();
    }
  }

  loadCompetition(): void {
    this.competitionService.getById(this.competitionId).subscribe({
      next: (data) => {
        this.competition = data;
        this.loadBaseCategories();
      },
      error: (err) => {
        console.error('Error loading competition:', err);
        this.errorMessage = 'حدث خطأ في تحميل بيانات المسابقة';
      }
    });
  }

  loadBaseCategories(): void {
    if (!this.competition || !this.competition.categoryIds) return;
    
    // Load full category details
    this.categoryService.getAll().subscribe({
      next: (allCategories) => {
        this.baseCategories = allCategories.filter(cat => 
          this.competition.categoryIds.some((id: any) => 
            (id._id || id) === cat._id
          )
        );
        
        // Initialize newCompCategory for each base category
        this.baseCategories.forEach(cat => {
          this.newCompCategory[cat._id] = { ageGroupId: '', gender: '' };
        });
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadAgeGroups(): void {
    this.ageGroupService.getAgeGroups().subscribe({
      next: (data) => {
        this.ageGroups = data;
      },
      error: (err) => {
        console.error('Error loading age groups:', err);
        this.errorMessage = 'حدث خطأ في تحميل الفئات العمرية';
      }
    });
  }

  loadCompetitionCategories(): void {
    this.compCategoryService.getByCompetition(this.competitionId).subscribe({
      next: (data) => {
        this.competitionCategories = data;
      },
      error: (err) => {
        console.error('Error loading competition categories:', err);
      }
    });
  }

  addCompetitionCategory(baseCategoryId: string): void {
    const draft = this.newCompCategory[baseCategoryId];
    
    if (!draft.ageGroupId || !draft.gender) {
      this.errorMessage = 'الرجاء اختيار الفئة العمرية والجنس';
      return;
    }

    const ageGroup = this.ageGroups.find(ag => ag._id === draft.ageGroupId);
    const baseCategory = this.baseCategories.find(bc => bc._id === baseCategoryId);
    
    // Generate label
    const genderLabel = draft.gender === 'male' ? 'ذكور' : 'إناث';
    const label = `${baseCategory?.name} - ${ageGroup?.name} - ${genderLabel}`;

    const newCompCategory: Partial<ICompetitionCategory> = {
      competitionId: this.competitionId,
      categoryId: baseCategoryId,
      ageGroupId: draft.ageGroupId,
      gender: draft.gender as 'male' | 'female',
      label: label
    };

    this.compCategoryService.create(newCompCategory).subscribe({
      next: () => {
        this.successMessage = 'تمت إضافة الفئة بنجاح';
        this.loadCompetitionCategories();
        // Reset form
        this.newCompCategory[baseCategoryId] = { ageGroupId: '', gender: '' };
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error creating competition category:', err);
        this.errorMessage = 'حدث خطأ في إضافة الفئة. قد تكون موجودة مسبقاً';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  deleteCompetitionCategory(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    this.compCategoryService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'تم حذف الفئة بنجاح';
        this.loadCompetitionCategories();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error deleting competition category:', err);
        this.errorMessage = 'حدث خطأ في حذف الفئة';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  getCompCategoriesForBase(baseCategoryId: string): ICompetitionCategory[] {
    return this.competitionCategories.filter(cc => {
      const catId = (cc.categoryId as any)?._id || cc.categoryId;
      return catId === baseCategoryId;
    });
  }

  getAgeGroupName(ageGroupId: string | any): string {
    const id = ageGroupId?._id || ageGroupId;
    const ag = this.ageGroups.find(a => a._id === id);
    if (!ag) return '';
    return ag.from && ag.to ? `${ag.name} (${ag.from}-${ag.to})` : ag.name;
  }

  generateLabel(cc: ICompetitionCategory): string {
    const category = this.baseCategories.find(bc => {
      const ccCatId = (cc.categoryId as any)?._id || cc.categoryId;
      return bc._id === ccCatId;
    });
    const ageGroup = this.ageGroups.find(ag => {
      const ccAgeId = (cc.ageGroupId as any)?._id || cc.ageGroupId;
      return ag._id === ccAgeId;
    });
    const genderLabel = cc.gender === 'male' ? 'ذكور' : 'إناث';
    
    return `${category?.name || ''} - ${ageGroup?.name || ''} - ${genderLabel}`;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleString('ar-TN');
  }

  goBack(): void {
    this.router.navigate(['/admin/competitions']);
  }

}
