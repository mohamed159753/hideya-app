import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminResultsService } from '../../services/admin-results.service';
import { AgeGroupService } from '../../services/age-group.service';
import { ParticipationService } from '../../services/participation.service';
import { NotificationService } from '../../services/notification.service';
import { BranchService } from '../../services/branch.service';

interface Column {
  key: string;
  label: string;
  printable: boolean;
}

@Component({
  selector: 'app-admin-result-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-result-detail.component.html',
  styleUrls: ['./admin-result-detail.component.css'],
})
export class AdminResultDetailComponent implements OnInit {
  result: any = null;
  loading: boolean = true;
  allAgeGroups: any[] = [];
  participationMap: Map<string, any> = new Map();
  branches: any[] = [];

  // Columns with print toggle
  columns: Column[] = [
    { key: 'rank', label: 'ع/خ', printable: true },
    { key: 'name', label: 'الاسم و اللقب', printable: true },
    { key: 'gender', label: 'الصنف', printable: true },
    { key: 'branch', label: 'الفرع', printable: true },
    { key: 'surahRange', label: 'مقدار الحفظ', printable: true },
    { key: 'juryMarks', label: 'علامات الحكام', printable: true },
    { key: 'avg', label: 'المعدل', printable: true },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminResultsService: AdminResultsService,
    private ageGroupService: AgeGroupService,
    private participationService: ParticipationService,
    private notify: NotificationService,
    private branchService: BranchService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notify.error('معرف النتيجة غير موجود');
      this.router.navigate(['/admin/results']);
      return;
    }

    this.branchService.getBranches().subscribe((res) => (this.branches = res));
    this.loadAgeGroups();
    this.loadResultDetails(id);
  }

  loadAgeGroups() {
    this.ageGroupService.getAgeGroups().subscribe({
      next: (ageGroups) => (this.allAgeGroups = ageGroups || []),
      error: (error) => console.error('Error loading age groups:', error),
    });
  }

  loadResultDetails(id: string) {
    this.loading = true;
    this.adminResultsService.getResultById(id).subscribe({
      next: (result) => {
        this.result = result;
        if (Array.isArray(this.result.entries)) {
          this.result.entries.sort(
            (a: any, b: any) => (b.avg?.total || 0) - (a.avg?.total || 0)
          );
        }
        this.loadParticipationDetails();
      },
      error: (error) => {
        console.error('Error loading result details:', error);
        this.notify.error('حدث خطأ في تحميل تفاصيل النتيجة');
        this.loading = false;
      },
    });
  }
  getColumnValue(entry: any, key: string): string {
    switch (key) {
      case 'rank':
        return (this.result.entries.indexOf(entry) + 1).toString();
      case 'name':
        return `${entry.competitorSnapshot?.firstName || ''} ${
          entry.competitorSnapshot?.lastName || ''
        }`;
      case 'gender':
        return this.getGenderDisplay(entry);
      case 'branch':
        return this.getBranchName(entry);
      case 'surahRange':
        return this.getSurahRange(entry);
      case 'avg':
        return entry.avg?.total?.toFixed(2) || '-';
      case 'juryMarks':
        return this.getJuryMarksReversed(entry).join(' | ');
      default:
        return '-';
    }
  }
  selectAllColumns() {
    this.columns.forEach((col) => (col.printable = true));
  }
  deselectAllColumns() {
    this.columns.forEach((col) => (col.printable = false));
  }

  loadParticipationDetails() {
    if (!this.result?.entries) {
      this.loading = false;
      return;
    }

    const participationIds = this.result.entries
      .map((e: any) => e.participationId)
      .filter((id: any) => id);
    if (!participationIds.length) {
      this.loading = false;
      return;
    }

    this.participationService.getAll().subscribe({
      next: (participations) => {
        participations.forEach((p: any) => this.participationMap.set(p._id, p));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading participations:', error);
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/results-dashboard']);
  }

  getRowBackground(index: number): string {
    return index % 2 === 0 ? '#ffffff' : '#FFFACD';
  }

  getSubCategoryDisplay(): string {
    if (!this.result?.subCategory) return 'غير محدد';
    const subCat = this.result.subCategory;
    if (subCat === 'male') return 'ذكور';
    if (subCat === 'female') return 'إناث';
    if (subCat.startsWith('children_')) {
      const ageGroupId = subCat.replace('children_', '');
      const ageGroup = this.allAgeGroups.find((a) => a._id === ageGroupId);
      return ageGroup ? `أطفال ${ageGroup.name}` : 'أطفال';
    }
    return subCat;
  }

  getGenderDisplay(entry: any): string {
    const participation = this.participationMap.get(entry.participationId);
    const competitor = participation?.competitorId;
    return competitor?.gender || 'غير محدد';
  }

  getBranchName(entry: any): string {
    const participation = this.participationMap.get(entry.participationId);
    const branchId = participation?.competitorId?.branch;
    const branch = this.branches.find((b) => b._id === branchId);
    return branch ? branch.name : 'غير معروف';
  }

  getSurahRange(entry: any): string {
    const participation = this.participationMap.get(entry.participationId);
    const competitor = participation?.competitorId;
    if (competitor?.surahRange)
      return `من ${competitor.surahRange.from} إلى ${competitor.surahRange.to}`;
    return '-';
  }

  getMaxJuryMarks(): number {
    if (!this.result?.entries?.length) return 0;
    return Math.max(
      ...this.result.entries.map((e: any) => e.marks?.length || 0)
    );
  }

  getMaxJuryMarksArray(): number[] {
    return Array.from({ length: this.getMaxJuryMarks() }, (_, i) => i);
  }

  getJuryMarksReversed(entry: any): string[] {
    const maxMarks = this.getMaxJuryMarks();
    const realMarks = Array.isArray(entry.marks) ? entry.marks : [];
    const reversed = [...realMarks].reverse();
    const output: string[] = [];
    for (let i = 0; i < maxMarks; i++) {
      const mark = reversed[i];
      output.push(
        mark && typeof mark.total === 'number' ? mark.total.toFixed(2) : 'غائب'
      );
    }
    return output;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  printResults() {
    window.print();
  }

  exportToExcel() {
    if (!this.result) return;
    this.notify.info('جاري تصدير النتائج...');
    this.adminResultsService
      .exportSingleResult(this.result._id, 'excel')
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `result_${
            this.result._id
          }_${new Date().getTime()}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.notify.success('تم التصدير بنجاح');
        },
        error: (error) => {
          console.error('Export error:', error);
          this.notify.error('حدث خطأ في التصدير');
        },
      });
  }

  // Toggle column visibility
  toggleColumn(key: string) {
    const col = this.columns.find((c) => c.key === key);
    if (col) col.printable = !col.printable;
  }
}
