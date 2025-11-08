import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultsService } from '../../services/results.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="direction: rtl; padding: 16px; font-family: Arial, Helvetica, sans-serif;">
      <div style="background:#fff; border-radius:8px; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,0.08)">
        <h2 style="color:#1b5e20; margin:0 0 8px 0">النتائج - الترتيب حسب المتوسط</h2>
        <div *ngIf="result">
          <div style="margin-bottom:8px; color:#666">تولدت بواسطة: {{ result.generatedBy?.firstName }} {{ result.generatedBy?.lastName }} — {{ result.createdAt | date:'short' }}</div>
          <table style="width:100%; border-collapse:collapse; text-align:right">
            <thead>
              <tr style="background:#e8f5e9; color:#1b5e20">
                <th style="padding:8px; border:1px solid #ddd">الترتيب</th>
                <th style="padding:8px; border:1px solid #ddd">المشارك</th>
                <th style="padding:8px; border:1px solid #ddd">حاصل الحفظ</th>
                <th style="padding:8px; border:1px solid #ddd">حاصل التجويد</th>
                <th style="padding:8px; border:1px solid #ddd">الأداء</th>
                <th style="padding:8px; border:1px solid #ddd">المجموع المتوسط</th>
                <th style="padding:8px; border:1px solid #ddd">تفاصيل العلامات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of result.entries; let i = index" style="border-bottom:1px solid #f1f1f1">
                <td style="padding:8px; border:1px solid #ddd">{{ i + 1 }}</td>
                <td style="padding:8px; border:1px solid #ddd">{{ e.competitorSnapshot?.firstName }} {{ e.competitorSnapshot?.lastName }}</td>
                <td style="padding:8px; border:1px solid #ddd">{{ e.avg?.memorization | number:'1.2-2' }}</td>
                <td style="padding:8px; border:1px solid #ddd">{{ e.avg?.tajweed | number:'1.2-2' }}</td>
                <td style="padding:8px; border:1px solid #ddd">{{ e.avg?.performance | number:'1.2-2' }}</td>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold">{{ e.avg?.total | number:'1.2-2' }}</td>
                <td style="padding:8px; border:1px solid #ddd">
                  <div *ngFor="let m of e.marks" style="margin-bottom:6px; padding:6px; background:#fafafa; border-radius:4px">
                    <div>قاضي: {{ m.juryId }}</div>
                    <div>حفظ: {{ m.memorizationTotal }} — تجويد: {{ m.tajweedTotal }} — أداء: {{ m.performanceScore }} — المجموع: {{ m.total }}</div>
                    <div>مؤكدة: {{ m.confirmed ? 'نعم' : 'لا' }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="!result && !loading" style="color:#777">لا توجد نتيجة للعرض</div>
        <div *ngIf="loading" style="color:#777">جارٍ تحميل النتيجة...</div>
        <div style="margin-top:12px; text-align:left">
          <button (click)="back()" style="background:#e0e0e0;border:0;padding:8px 12px;border-radius:4px;cursor:pointer">رجوع</button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ResultsComponent implements OnInit {
  result: any = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private results: ResultsService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notify.error('معرّف النتيجة غير موجود');
      return;
    }
    this.loading = true;
    this.results.getById(id).subscribe(
      (res) => {
        this.result = res;
        // ensure entries sorted by avg.total desc
        if (Array.isArray(this.result.entries)) {
          this.result.entries.sort((a: any, b: any) => (b.avg?.total || 0) - (a.avg?.total || 0));
        }
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      }
    );
  }

  back() {
    this.router.navigate(['/jury-dashboard']);
  }
}
