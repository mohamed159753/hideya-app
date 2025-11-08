import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ResultsService } from '../../services/results.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-jury-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jury-results.component.html',
  styleUrls: ['./jury-results.component.css'],
})
export class JuryResultsComponent implements OnInit {
  assignment: any = null;
  participants: any[] = [];
  results: any[] = [];
  loading: boolean = true;
  exportLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private resultsService: ResultsService,
    private http: HttpClient,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as any;

    if (state && state.assignment && state.participants) {
      this.assignment = state.assignment;
      this.participants = state.participants;
      this.loadResults();
    } else {
      this.router.navigate(['/jury-dashboard']);
    }
  }

  loadResults() {
    this.loading = true;
    const compId =
      this.assignment.competitionId?._id || this.assignment.competitionId;
    const catId = this.assignment.categoryId?._id || this.assignment.categoryId;

    this.resultsService.getFinalResults(compId, catId).subscribe({
      next: (res: any) => {
        // res.entries contains the list of entries computed on server
        this.results = res?.entries || [];
        this.loading = false;

        // Save results to database for traceability (server already computes entries; this will persist them)
        this.saveResultsToDatabase();
      },
      error: (error: any) => {
        console.error('Error loading results:', error);
        this.loading = false;
        this.notify.error('حدث خطأ في تحميل النتائج');
      },
    });
  }

  saveResultsToDatabase() {
    const payload = {
      competitionId:
        this.assignment.competitionId?._id || this.assignment.competitionId,
      categoryId: this.assignment.categoryId?._id || this.assignment.categoryId,
      requestedBy: undefined,
      note: `Saved from UI by ${this.assignment._id}`,
    };

    this.resultsService.saveFinalResults(payload).subscribe({
      next: (response: any) => {
        console.log('Results saved to database:', response);
      },
      error: (error: any) => {
        console.error('Error saving results:', error);
      },
    });
  }

  exportToExcel() {
    this.exportLoading = true;

    const exportData = {
      competition: this.assignment.competitionId?.title || 'مسابقة',
      category: this.assignment.categoryId?.name || 'فئة',
      date: new Date().toLocaleDateString('ar-EG'),
      results: this.results.map((result, index) => ({
        الترتيب: index + 1,
        الاسم:
          result.competitorId?.firstName + ' ' + result.competitorId?.lastName,
        'المتوسط النهائي': result.finalScore,
        'حاصل الحفظ': result.memorizationScore,
        'حاصل التجويد': result.tajweedScore,
        'تقييم الأداء': result.performanceScore,
        'عدد أعضاء اللجنة': result.juryCount,
        الحالة: result.status,
      })),
    };

    // Simple CSV export (you can enhance this with a proper Excel library)
    this.downloadCSV(exportData);
    this.exportLoading = false;
  }

  downloadCSV(data: any) {
    const headers = [
      'الترتيب',
      'الاسم',
      'المتوسط النهائي',
      'حاصل الحفظ',
      'حاصل التجويد',
      'تقييم الأداء',
      'عدد أعضاء اللجنة',
      'الحالة',
    ];
    const csvContent = [
      headers.join(','),
      ...data.results.map((row: any) =>
        headers.map((header) => `"${row[header]}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `نتائج_${data.competition}_${data.category}_${data.date}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  goBack() {
    this.router.navigate(['/jury-dashboard']);
  }

  getMedalColor(position: number): string {
    switch (position) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#e8f5e9';
    }
  }
  calculateAverage(): number {
    if (this.results.length === 0) return 0;
    const sum = this.results.reduce(
      (acc, result) => acc + result.finalScore,
      0
    );
    return sum / this.results.length;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
