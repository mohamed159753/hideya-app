import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminResultsService } from '../../services/admin-results.service';
import { CompetitionService } from '../../services/competition.service';
import { CategoryService } from '../../services/category.service';
import { AgeGroupService } from '../../services/age-group.service';
import { NotificationService } from '../../services/notification.service';

interface ResultSummary {
  _id: string;
  competitionId: any;
  categoryId: any;
  subCategory: string;
  generatedBy: any;
  createdAt: Date;
  entriesCount: number;
  note?: string;
}

@Component({
  selector: 'app-admin-results-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-results-dashboard.component.html',
  styleUrls: ['./admin-results-dashboard.component.css']
})
export class AdminResultsDashboardComponent implements OnInit {
  // Filters
  competitions: any[] = [];
  categories: any[] = [];
  allAgeGroups: any[] = [];
  selectedCompetitionId: string = '';
  selectedCategoryId: string = '';
  selectedSubCategory: string = '';
  
  // Results
  results: ResultSummary[] = [];
  filteredResults: ResultSummary[] = [];
  loading: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(
    private adminResultsService: AdminResultsService,
    private competitionService: CompetitionService,
    private categoryService: CategoryService,
    private ageGroupService: AgeGroupService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCompetitions();
    this.loadCategories();
    this.loadAgeGroups();
    this.loadAllResults();
  }

  loadCompetitions() {
    this.competitionService.getAll().subscribe({
      next: (competitions) => {
        this.competitions = competitions || [];
      },
      error: (error) => {
        console.error('Error loading competitions:', error);
        this.notify.error('حدث خطأ في تحميل المسابقات');
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.notify.error('حدث خطأ في تحميل الفئات');
      }
    });
  }

  loadAgeGroups() {
    this.ageGroupService.getAgeGroups().subscribe({
      next: (ageGroups) => {
        this.allAgeGroups = ageGroups || [];
      },
      error: (error) => {
        console.error('Error loading age groups:', error);
        this.notify.error('حدث خطأ في تحميل الفئات العمرية');
      }
    });
  }

  loadAllResults() {
    this.loading = true;
    this.adminResultsService.getAllResults().subscribe({
      next: (results) => {
        this.results = results || [];
        // Log to debug
        console.log('Loaded results:', this.results);
        console.log('Sample result subCategory:', this.results[0]?.subCategory);
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading results:', error);
        this.notify.error('حدث خطأ في تحميل النتائج');
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.results];

    if (this.selectedCompetitionId) {
      filtered = filtered.filter(r => {
        const compId = r.competitionId?._id || r.competitionId;
        return compId === this.selectedCompetitionId;
      });
    }

    if (this.selectedCategoryId) {
      filtered = filtered.filter(r => {
        const catId = r.categoryId?._id || r.categoryId;
        return catId === this.selectedCategoryId;
      });
    }

    if (this.selectedSubCategory) {
      filtered = filtered.filter(r => r.subCategory === this.selectedSubCategory);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.filteredResults = filtered;
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    this.currentPage = 1;
  }

  get paginatedResults() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredResults.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  viewResultDetails(result: ResultSummary) {
    this.router.navigate(['/admin/results', result._id]);
  }

  getCompetitionName(result: ResultSummary): string {
    return result.competitionId?.title || 'غير محدد';
  }

  getCategoryName(result: ResultSummary): string {
    return result.categoryId?.name || 'غير محدد';
  }

  // Method to get formatted subcategory name
  getSubCategoryDisplay(result: ResultSummary): string {
    if (!result.subCategory) return '-';
    
    // Format common subcategory values for better display
    const subCat = result.subCategory;
    
    if (subCat === 'male') return 'ذكور';
    if (subCat === 'female') return 'إناث';
    if (subCat.startsWith('children_')) {
      const ageGroupId = subCat.replace('children_', '');
      const ageGroup = this.allAgeGroups.find(a => a._id === ageGroupId);
      return ageGroup ? `أطفال ${ageGroup.name}` : 'أطفال';
    }
    
    // Return as-is if no mapping found
    return result.subCategory;
  }

  getGeneratedByName(result: ResultSummary): string {
    if (!result.generatedBy) return 'غير معروف';
    const firstName = result.generatedBy.firstName || '';
    const lastName = result.generatedBy.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'غير معروف';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  resetFilters() {
    this.selectedCompetitionId = '';
    this.selectedCategoryId = '';
    this.selectedSubCategory = '';
    this.applyFilters();
  }

  exportAllResults() {
    this.notify.info('جاري تصدير النتائج...');
    this.adminResultsService.exportResults(
      this.selectedCompetitionId,
      this.selectedCategoryId,
      this.selectedSubCategory
    ).subscribe({
      next: (blob: Blob | MediaSource) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `results_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notify.success('تم تصدير النتائج بنجاح');
      },
      error: (error: any) => {
        console.error('Error exporting results:', error);
        this.notify.error('حدث خطأ في تصدير النتائج');
      }
    });
  }

  deleteResult(result: ResultSummary, event: Event) {
    event.stopPropagation();
    
    if (!confirm('هل أنت متأكد من حذف هذه النتيجة؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    this.adminResultsService.deleteResult(result._id).subscribe({
      next: () => {
        this.notify.success('تم حذف النتيجة بنجاح');
        this.loadAllResults();
      },
      error: (error: any) => {
        console.error('Error deleting result:', error);
        this.notify.error('حدث خطأ في حذف النتيجة');
      }
    });
  }

  getUniqueSubCategories(): string[] {
    const subCats = new Set<string>();
    this.results.forEach(r => {
      if (r.subCategory) {
        subCats.add(r.subCategory);
      }
    });
    return Array.from(subCats).sort();
  }

  // Method to get display name for subcategory in dropdown
  getSubCategoryDisplayName(subCat: string): string {
    if (subCat === 'male') return 'ذكور';
    if (subCat === 'female') return 'إناث';
    if (subCat.startsWith('children_')) {
      const ageGroupId = subCat.replace('children_', '');
      const ageGroup = this.allAgeGroups.find(a => a._id === ageGroupId);
      return ageGroup ? `أطفال ${ageGroup.name}` : 'أطفال';
    }
    
    return subCat;
  }
}