import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminResultsService } from '../../services/admin-results.service';
import { AgeGroupService } from '../../services/age-group.service';
import { ParticipationService } from '../../services/participation.service';
import { NotificationService } from '../../services/notification.service';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-admin-result-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="direction: rtl; padding: 20px; max-width: 1400px; margin: 0 auto; font-family: 'Traditional Arabic', 'Arial', sans-serif;">
      
      <!-- Actions -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px; print:hidden;">
        <button
          (click)="goBack()"
          style="
            background: #666666;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          "
          class="no-print"
        >
          ← العودة
        </button>

        <div style="display: flex; gap: 12px;" class="no-print">
          <button
            (click)="printResults()"
            style="
              background: #1976d2;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            🖨️ طباعة
          </button>
          <button
            (click)="exportToExcel()"
            style="
              background: #1b5e20;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            📊 تصدير Excel
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" style="text-align: center; padding: 60px;">
        <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
        <h3>جاري تحميل التفاصيل...</h3>
      </div>

      <!-- Results Table -->
      <div *ngIf="!loading && result" id="printableArea">
        <!-- Header with Competition Name -->
        <div style="
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          padding: 16px;
          text-align: center;
          border: 3px solid #000;
          margin-bottom: 2px;
        ">
          <h2 style="margin: 0; font-size: 20px; font-weight: bold;">
            {{ result?.competitionId?.title || 'المسابقة' }}
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 14px;">
            {{ result?.competitionId?.description || '' }}
          </p>
        </div>

        <!-- Sub Header -->
        <div style="
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          padding: 12px;
          text-align: center;
          border: 3px solid #000;
          border-top: none;
          margin-bottom: 2px;
        ">
          <h3 style="margin: 0; font-size: 18px; font-weight: bold;">النتائج النهائية</h3>
        </div>

        <!-- Category Info Row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; border: 3px solid #000; border-top: none;">
          <div style="
            background: linear-gradient(135deg, #FFD700, #FFA500);
            padding: 10px;
            text-align: center;
            border-left: 3px solid #000;
            font-weight: bold;
            font-size: 16px;
          ">
            {{ getSubCategoryDisplay() }}
          </div>
          <div style="
            background: linear-gradient(135deg, #FFD700, #FFA500);
            padding: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
          ">
            {{ result?.categoryId?.name || 'الفئة' }}
          </div>
        </div>

        <!-- Main Table -->
        <!-- Main Table -->
<!-- Main Table -->
<table style="
  width: 100%;
  border-collapse: collapse;
  border: 3px solid #000;
  border-top: none;
  margin-bottom: 20px;
">
  <thead>
    <!-- Header Row 1 -->
    <tr style="background: linear-gradient(135deg, #FFD700, #FFA500);">
      <th rowspan="2" style="
        border: 2px solid #000;
        padding: 12px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
        width: 50px;
      ">
        ع/خ
      </th>
      <th rowspan="2" style="
        border: 2px solid #000;
        padding: 12px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
        min-width: 150px;
      ">
        الاسم و اللقب
      </th>
      <th rowspan="2" style="
        border: 2px solid #000;
        padding: 12px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
      ">
        الصنف
      </th>
      <th rowspan="2" style="
        border: 2px solid #000;
        padding: 12px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
      ">
        الفرع
      </th>
      <th rowspan="2" style="
        border: 2px solid #000;
        padding: 12px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
      ">
        مقدار الحفظ
      </th>
      <!-- Dynamic Jury Columns -->
      <th *ngFor="let i of getMaxJuryMarksArray()" 
          style="border: 2px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 13px;">
        العدد {{ getMaxJuryMarks() - i }}
      </th>
      <th rowspan="2" style="
        border: 2px solid #000;
        padding: 12px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
      ">
        المعدل
      </th>
    </tr>
    <!-- Header Row 2 - Jury Members Details (Simplified) -->
    <tr style="background: linear-gradient(135deg, #FFD700, #FFA500);">
      <th *ngFor="let i of getMaxJuryMarksArray()" style="
        border: 2px solid #000;
        padding: 8px;
        text-align: center;
        font-weight: bold;
        font-size: 13px;
      ">
        العلامة
      </th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let entry of result.entries; let i = index"
        [style.background]="getRowBackground(i)">
      <!-- ع/خ (Rank) -->
      <td style="
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
      ">
        {{ i + 1 }}
      </td>
      
      <!-- الاسم واللقب -->
      <td style="
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        font-weight: 600;
        font-size: 14px;
      ">
        {{ entry.competitorSnapshot?.firstName }} {{ entry.competitorSnapshot?.lastName }}
      </td>
      
      <!-- الصنف -->
      <td style="
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        font-size: 13px;
      ">
        {{ getGenderDisplay(entry) }}
      </td>
      
      <!-- الفرع -->
      <td style="
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        font-size: 13px;
      ">
        {{ getBranchName(entry) }}
      </td>
      
      <!-- مقدار الحفظ -->
      <td style="
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        font-size: 13px;
      ">
        {{ getSurahRange(entry) }}
      </td>
      
      <!-- Jury Marks -->
      <td *ngFor="let mark of getJuryMarksReversed(entry)" style="
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        font-size: 13px;
      ">
        {{ mark }}
      </td>
      
      <!-- المعدل (Average) -->
      <td style="
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
      ">
        {{ entry.avg?.total | number:'1.2-2' }}
      </td>
    </tr>
  </tbody>
</table>

        <!-- Footer Info -->
        <div *ngIf="result.note" style="
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          margin-top: 20px;
          border-right: 4px solid #2d8c4a;
        ">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">ملاحظة:</div>
          <div style="font-size: 14px; font-weight: 600; color: #333;">{{ result.note }}</div>
        </div>

        <div style="
          margin-top: 20px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        ">
          <div>
            <div style="font-size: 12px; color: #666;">تم الإنشاء بواسطة</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">
              {{ result.generatedBy?.firstName }} {{ result.generatedBy?.lastName }}
            </div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666;">التاريخ</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">
              {{ formatDate(result.createdAt) }}
            </div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666;">عدد المشاركين</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">
              {{ result.entries?.length || 0 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      @media print {
        .no-print {
          display: none !important;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  `,
  styles: []
})
export class AdminResultDetailComponent implements OnInit {
  result: any = null;
  loading: boolean = true;
  allAgeGroups: any[] = [];
  participationMap: Map<string, any> = new Map();
  branches: any[] = [];


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

    this.branchService.getBranches().subscribe(res => {
    this.branches = res;
  });
    this.loadAgeGroups();
    this.loadResultDetails(id);
  }

  loadAgeGroups() {
    this.ageGroupService.getAgeGroups().subscribe({
      next: (ageGroups) => {
        this.allAgeGroups = ageGroups || [];
      },
      error: (error) => {
        console.error('Error loading age groups:', error);
      }
    });
  }

  

  loadResultDetails(id: string) {
    this.loading = true;
    this.adminResultsService.getResultById(id).subscribe({
      next: (result) => {
        this.result = result;
        // Ensure entries are sorted by avg.total desc
        if (Array.isArray(this.result.entries)) {
          this.result.entries.sort((a: any, b: any) => 
            (b.avg?.total || 0) - (a.avg?.total || 0)
          );
        }
        // Load participation details for each entry
        this.loadParticipationDetails();
      },
      error: (error) => {
        console.error('Error loading result details:', error);
        this.notify.error('حدث خطأ في تحميل تفاصيل النتيجة');
        this.loading = false;
      }
    });
  }

  loadParticipationDetails() {
    if (!this.result?.entries) {
      this.loading = false;
      return;
    }

    const participationIds = this.result.entries
      .map((e: any) => e.participationId)
      .filter((id: any) => id);

    if (participationIds.length === 0) {
      this.loading = false;
      return;
    }

    // Load all participations with competitor details
    this.participationService.getAll().subscribe({
      next: (participations) => {
        // Create a map for quick lookup
        participations.forEach((p: any) => {
          this.participationMap.set(p._id, p);
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading participations:', error);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/results']);
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
      const ageGroup = this.allAgeGroups.find(a => a._id === ageGroupId);
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

    const branch = this.branches.find(b => b._id === branchId);

    return branch ? branch.name : "غير معروف";
    
  }

  getSurahRange(entry: any): string {
    const participation = this.participationMap.get(entry.participationId);
    const competitor = participation?.competitorId;
    
    if (competitor?.surahRange) {
      return `من ${competitor.surahRange.from} إلى ${competitor.surahRange.to}`;
    }
    return '-';
  }

  getMaxJuryMarks(): number {
    if (!this.result?.entries || this.result.entries.length === 0) return 0;
    return Math.max(...this.result.entries.map((e: any) => e.marks?.length || 0));
  }

  // Returns an array to iterate in the template (Angular *ngFor requires an iterable)
  getMaxJuryMarksArray(): number[] {
  const n = this.getMaxJuryMarks();
  return Array.from({ length: n }, (_, i) => i);
}

 getJuryMarksReversed(entry: any): string[] {
  const maxMarks = this.getMaxJuryMarks();
  const realMarks = Array.isArray(entry.marks) ? entry.marks : [];
  const reversed = [...realMarks].reverse();
  
  const output: string[] = [];
  for (let i = 0; i < maxMarks; i++) {
    const mark = reversed[i];
    if (mark && typeof mark.total === 'number') {
      output.push(mark.total.toFixed(2));
    } else {
      output.push('غائب');
    }
  }
  return output;
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

  printResults() {
    window.print();
  }

  exportToExcel() {
    if (!this.result) return;
    
    this.notify.info('جاري تصدير النتائج...');
    this.adminResultsService.exportSingleResult(this.result._id, 'excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `result_${this.result._id}_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notify.success('تم التصدير بنجاح');
      },
      error: (error) => {
        console.error('Export error:', error);
        this.notify.error('حدث خطأ في التصدير');
      }
    });
  }
}