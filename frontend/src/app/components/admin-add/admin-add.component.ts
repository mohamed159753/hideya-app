import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminAddService } from '../../services/admin-add.service';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../services/competition.service';
import { CategoryService } from '../../services/category.service';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-admin-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './admin-add.component.html',
  styleUrl: './admin-add.component.css'
})
export class AdminAddComponent {

  competitors: any[] = [];
  competitorForm: FormGroup;
  editMode = false;
  currentCompetitorId: string | null = null;

  filters = {
  query: '',       // matches firstName, lastName
  age: '',         // exact age or min/max later
  gender: '',      // "ذكر" or "أنثى"
  branch: ''       // branch _id
};

  filteredCompetitors: any[] = []; // display only filtered items

  // For dropdowns
  categories: any[] = [];
  branches: any[] = [];
  surahs: string[] = [
    'الفاتحة',
    'البقرة',
    'آل عمران',
    'النساء',
    'المائدة',
    'الأنعام',
    'الأعراف',
    'الأنفال',
    'التوبة',
    'يونس',
    'هود',
    'يوسف',
    'الرعد',
    'إبراهيم',
    'الحجر',
    'النحل',
    'الإسراء',
    'الكهف',
    'مريم',
    'طه',
    'الأنبياء',
    'الحج',
    'المؤمنون',
    'النور',
    'الفرقان',
    'الشعراء',
    'النمل',
    'القصص',
    'العنكبوت',
    'الروم',
    'لقمان',
    'السجدة',
    'الأحزاب',
    'سبأ',
    'فاطر',
    'يس',
    'الصافات',
    'ص',
    'الزمر',
    'غافر',
    'فصلت',
    'الشورى',
    'الزخرف',
    'الدخان',
    'الجاثية',
    'الأحقاف',
    'محمد',
    'الفتح',
    'الحجرات',
    'ق',
    'الذاريات',
    'الطور',
    'النجم',
    'القمر',
    'الرحمن',
    'الواقعة',
    'الحديد',
    'المجادلة',
    'الحشر',
    'الممتحنة',
    'الصف',
    'الجمعة',
    'المنافقون',
    'التغابن',
    'الطلاق',
    'التحريم',
    'الملك',
    'القلم',
    'الحاقة',
    'المعارج',
    'نوح',
    'الجن',
    'المزمل',
    'المدثر',
    'القيامة',
    'الإنسان',
    'المرسلات',
    'النبأ',
    'النازعات',
    'عبس',
    'التكوير',
    'الانفطار',
    'المطففين',
    'الانشقاق',
    'البروج',
    'الطارق',
    'الأعلى',
    'الغاشية',
    'الفجر',
    'البلد',
    'الشمس',
    'الليل',
    'الضحى',
    'الشرح',
    'التين',
    'العلق',
    'القدر',
    'البينة',
    'الزلزلة',
    'العاديات',
    'القارعة',
    'التكاثر',
    'العصر',
    'الهمزة',
    'الفيل',
    'قريش',
    'الماعون',
    'الكوثر',
    'الكافرون',
    'النصر',
    'المسد',
    'الإخلاص',
    'الفلق',
    'الناس'
  ];

  constructor(
    private competitorService: AdminAddService,
    private categoryService: CategoryService,
    private branchService: BranchService,
    private fb: FormBuilder
  ) {
    this.competitorForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(5)]],
      gender: ['', Validators.required],
      branch: ['', Validators.required],
      surahFrom: ['', Validators.required],
      surahTo: ['', Validators.required],
      categoryIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadCompetitors();
    this.loadCategories();
    this.loadBranches();
  }

  loadCompetitors() {
    this.competitorService.getAll().subscribe(data => {
      this.competitors = data;
      this.applyFilters();
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data;
    });
  }

  loadBranches() {
    this.branchService.getBranches().subscribe(data => {
      this.branches = data;
    });
  }

  submit() {
    if (this.competitorForm.invalid) return;

    const formValue = this.competitorForm.value;
    
    const competitor: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      age: formValue.age,
      gender: formValue.gender,
      branch: formValue.branch,
      surahRange: {
        from: formValue.surahFrom,
        to: formValue.surahTo
      }
    };

    if (this.editMode && this.currentCompetitorId !== null) {
      this.competitorService.update(this.currentCompetitorId, competitor).subscribe(() => {
        this.resetForm();
        this.loadCompetitors();
      });
    } else {
      this.competitorService.create(competitor).subscribe(() => {
        this.resetForm();
        this.loadCompetitors();
      });
    }
  }

  edit(competitor: any) {
    this.editMode = true;
    this.currentCompetitorId = competitor._id;
    
    this.competitorForm.patchValue({
      firstName: competitor.firstName,
      lastName: competitor.lastName,
      age: competitor.age,
      gender: competitor.gender,
      branch: competitor.branch,
      surahFrom: competitor.surahRange?.from || '',
      surahTo: competitor.surahRange?.to || '',
      categoryIds: competitor.categoryIds || []
    });
  }

  delete(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا المتسابق؟')) {
      this.competitorService.delete(id).subscribe(() => {
        this.loadCompetitors();
      });
    }
  }

  resetForm() {
    this.competitorForm.reset();
    this.editMode = false;
    this.currentCompetitorId = null;
  }

  // ✅ Helper method to get branch name
  getBranchName(branchData: any): string {
    if (!branchData) return '-';
    // If it's already populated (object with name)
    if (typeof branchData === 'object' && branchData.name) {
      return branchData.name;
    }
    // If it's just an ID, try to find it in branches array
    if (typeof branchData === 'string') {
      const branch = this.branches.find(b => b._id === branchData);
      return branch ? branch.name : branchData;
    }
    return '-';
  }


  applyFilters() {
  const { query, age, gender, branch } = this.filters;
  const lowerQuery = (query || '').toLowerCase().trim();

  this.filteredCompetitors = this.competitors.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();

    const matchesQuery = !lowerQuery || fullName.includes(lowerQuery);
    const matchesAge = !age || c.age === Number(age);
    const matchesGender = !gender || c.gender === gender;

    // ✅ handle branch as string or object
    let competitorBranchId = '';
    if (c.branch) {
      competitorBranchId = typeof c.branch === 'string' ? c.branch : c.branch._id;
    }
    const matchesBranch = !branch || competitorBranchId === branch;

    return matchesQuery && matchesAge && matchesGender && matchesBranch;
  });
}

resetFilters() {
  this.filters = { query: '', age: '', gender: '', branch: '' };
  this.applyFilters();
  }


  printTable() {
  // Clone only the table card to avoid printing filters or form
  const tableCard = document.querySelector('.card.table-card')?.cloneNode(true) as HTMLElement;
  if (!tableCard) return;

  // Remove the "الإجراءات" column (last column)
  tableCard.querySelectorAll('th:last-child, td:last-child').forEach(el => el.remove());

  // Extract cleaned HTML
  const printContent = tableCard.innerHTML;

  const printWindow = window.open('', '', 'width=900,height=650');
  printWindow?.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>طباعة - المتسابقين</title>
        <style>
          body {
            font-family: 'Tahoma', sans-serif;
            direction: rtl;
            margin: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #aaa;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f3f3f3;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h2>قائمة المتسابقين</h2>
        ${printContent}
      </body>
    </html>
  `);
  printWindow?.document.close();
  printWindow?.print();
}

}