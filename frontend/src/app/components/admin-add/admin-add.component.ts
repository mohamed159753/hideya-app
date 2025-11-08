import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminAddService } from '../../services/admin-add.service';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../services/competition.service';
import { CategoryService } from '../../services/category.service';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-admin-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-add.component.html',
  styleUrl: './admin-add.component.css'
})
export class AdminAddComponent {

  competitors: any[] = [];
  competitorForm: FormGroup;
  editMode = false;
  currentCompetitorId: string | null = null;

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
      classLevel: ['', Validators.required],
      branch: ['', Validators.required],
      surahFrom: ['', Validators.required],
      surahTo: ['', Validators.required],
      categoryIds: [[]]  // Array of category IDs
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
    
    // Format the data to match the Mongoose schema
    const competitor: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      age: formValue.age,
      classLevel: formValue.classLevel,
      branch: formValue.branch,
      surahRange: {
        from: formValue.surahFrom,
        to: formValue.surahTo
      },
      
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
    
    // Flatten the nested structure for the form
    this.competitorForm.patchValue({
      firstName: competitor.firstName,
      lastName: competitor.lastName,
      age: competitor.age,
      classLevel: competitor.classLevel,
      branch: competitor.branch,
      surahFrom: competitor.surahRange?.from || '',
      surahTo: competitor.surahRange?.to || '',
      competitionId: competitor.competitionId,
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
}