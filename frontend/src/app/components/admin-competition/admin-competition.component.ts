import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompetitionService } from '../../services/competition.service';
import { CategoryService } from '../../services/category.service';
import { AgeGroupService } from '../../services/age-group.service';
import { JuryAssignmentService } from '../../services/jury-assignment.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

// Interfaces
interface Competition {
  _id?: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  categoryIds: string[];
  genderGroups?: any[];
}

interface IJuryMember {
  userId: string;
  role: 'member' | 'president';
}

interface IJuryAssignment {
  _id?: string;
  competitionId: string;
  categoryId: string;
  subCategory?: string;
  classRoom?: string;
  juryMembers: IJuryMember[];
}

interface SubCategoryForm {
  catId: string;
  sub: string;
  label: string;
  classRoom?: string;
  presidentId?: string;
  juryMembers?: string[];
  minExpertise?: number;
}

@Component({
  selector: 'app-admin-competition',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-competition.component.html',
  styleUrls: ['./admin-competition.component.css']
})
export class AdminCompetitionComponent implements OnInit {
  competitions: Competition[] = [];
  categories: any[] = [];
  allAgeGroups: any[] = [];
  users: any[] = [];


  filteredCompetitions: Competition[] = [];
  filterTitle: string = '';
  filterType: string = '';

  genderConfig: Record<string, {
    male: boolean;
    female: boolean;
    children: { active: boolean; ageGroups: string[] };
  }> = {};

  competitionForm!: FormGroup;
  editingId: string | null = null;
  currentStep = 1;

  // Jury assignment modal
  showAssignmentsModal = false;
  selectedCompetition: Competition | null = null;
  assignments: IJuryAssignment[] = [];
  loadingAssignments = false;

  availableSubCategories: SubCategoryForm[] = [];
  
  // New assignment form
  newAssignment: {
    categoryId?: string;
    subCategory?: string;
    classRoom?: string;
    juryMembers: { userId: string }[];
    presidentId?: string;
  } = { juryMembers: [] };

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private categoryService: CategoryService,
    private ageGroupService: AgeGroupService,
    private juryAssignmentService: JuryAssignmentService,
    private userService: UserService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCompetitions();
    this.loadCategories();
    this.loadAgeGroups();
    this.loadUsers();
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

  // ===== Loaders =====
  loadCompetitions() {
    this.competitionService.getAll().subscribe({
      next: (data) => {
        this.competitions = data,
        this.applyFilters();
    },
      error: (err) => console.error('❌ Error loading competitions:', err)
    });
  }

  applyFilters() {
  this.filteredCompetitions = this.competitions.filter(c => {
    const matchesTitle = c.title.toLowerCase().includes(this.filterTitle.toLowerCase());
    const matchesType = !this.filterType || c.type === this.filterType;
    return matchesTitle && matchesType;
  });
}

clearFilters() {
  this.filterTitle = '';
  this.filterType = '';
  this.applyFilters();
}

editCompetition(comp: Competition) {
  // Fill the wizard form with competition data
  this.competitionForm.patchValue({
    title: comp.title,
    type: comp.type,
    startDate: comp.startDate,
    endDate: comp.endDate,
    categoryIds: comp.categoryIds
  });
  this.genderConfig = {}; 
  if (comp.genderGroups) {
    this.rebuildGenderConfig(comp);
  }
  this.currentStep = 1; // Go back to step 1
}

deleteCompetition(id: string) {
  if (!confirm('هل أنت متأكد من حذف هذه المسابقة؟')) return;
  this.competitionService.delete(id).subscribe({
    next: () => {
      this.competitions = this.competitions.filter(c => c._id !== id);
      this.applyFilters();
      alert('تم حذف المسابقة بنجاح');
    },
    error: (err) => alert('حدث خطأ أثناء حذف المسابقة')
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

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('❌ Error loading users:', err)
    });
  }

  // ===== Wizard =====
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

  // ===== Category Config =====
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

  // ===== Submit competition =====
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

  // ===== Jury Assignments =====
  openAssignments(comp: Competition) {
    this.selectedCompetition = comp;
    this.showAssignmentsModal = true;
    this.loadingAssignments = true;
    this.newAssignment = { juryMembers: [] };
    this.availableSubCategories = []; // Clear first

    // Rebuild genderConfig from the competition's genderGroups
    this.rebuildGenderConfig(comp);
    
    // Load assignments FIRST, then generate subcategories after
    this.loadAssignments();
  }

  /**
   * Rebuild the genderConfig object from a competition's genderGroups
   * This is critical because genderConfig is not persisted with the competition
   */
  rebuildGenderConfig(comp: Competition) {
    this.genderConfig = {};
    
    console.log('🔍 Rebuilding genderConfig for competition:', comp);
    console.log('📋 Competition data:', JSON.stringify(comp, null, 2));
    
    if (!comp.genderGroups || comp.genderGroups.length === 0) {
      console.warn('⚠️ No genderGroups found for competition:', comp.title);
      return;
    }

    // Initialize genderConfig for each category in the competition
    for (const catId of comp.categoryIds) {
      // Handle both string IDs and populated objects
      const id = typeof catId === 'string' ? catId : (catId as any)._id;
      this.genderConfig[id] = {
        male: false,
        female: false,
        children: { active: false, ageGroups: [] }
      };
    }

    // Populate from genderGroups
    for (const group of comp.genderGroups) {
      // Handle both string IDs and populated objects
      const catId = typeof group.categoryId === 'string' ? group.categoryId : (group.categoryId as any)._id;
      
      console.log(`Processing group - catId: ${catId}, gender: ${group.gender}`);
      
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
        // Handle both string IDs and populated objects for age groups
        this.genderConfig[catId].children.ageGroups = (group.ageGroupIds || []).map((ag: any) => 
          typeof ag === 'string' ? ag : ag._id
        );
      }
    }
    
    console.log('✅ Final genderConfig:', this.genderConfig);
  }

  generateSubCategories() {
    this.availableSubCategories = [];
    if (!this.selectedCompetition) return;

    console.log('🔧 Generating subcategories...');
    console.log('Selected competition categoryIds:', this.selectedCompetition.categoryIds);
    console.log('Current genderConfig:', this.genderConfig);

    const compCategories = this.selectedCompetition.categoryIds;
    for (const catIdRaw of compCategories) {
      // Handle both string IDs and populated objects
      const catId = typeof catIdRaw === 'string' ? catIdRaw : (catIdRaw as any)._id;
      
      const cfg = this.genderConfig[catId];
      if (!cfg) {
        console.warn(`⚠️ No genderConfig found for category: ${catId}`);
        continue;
      }

      console.log(`Processing category ${catId}:`, cfg);

      if (cfg.male) {
        const subCat = 'male';
        // Only add if no assignment exists for this subcategory
        if (!this.hasAssignment(catId, subCat)) {
          this.availableSubCategories.push({ 
            catId, 
            sub: subCat, 
            label: `${this.getCategoryNameById(catId)} - رجال`,
            minExpertise: 1
          });
        }
      }
      if (cfg.female) {
        const subCat = 'female';
        if (!this.hasAssignment(catId, subCat)) {
          this.availableSubCategories.push({ 
            catId, 
            sub: subCat, 
            label: `${this.getCategoryNameById(catId)} - نساء`,
            minExpertise: 1
          });
        }
      }
      if (cfg.children.active) {
        for (const ageId of cfg.children.ageGroups) {
          const subCat = `children_${ageId}`;
          if (!this.hasAssignment(catId, subCat)) {
            const ageName = this.allAgeGroups.find(a => a._id === ageId)?.name || ageId;
            this.availableSubCategories.push({
              catId,
              sub: subCat,
              label: `${this.getCategoryNameById(catId)} - أطفال ${ageName}`,
              minExpertise: 1
            });
          }
        }
      }
    }

    console.log('✅ Generated subcategories:', this.availableSubCategories);
  }

  closeAssignments() {
    this.showAssignmentsModal = false;
    this.selectedCompetition = null;
    this.assignments = [];
    this.availableSubCategories = [];
  }

  loadAssignments() {
    if (!this.selectedCompetition) return;
    this.loadingAssignments = true;
    this.juryAssignmentService.getByCompetition(this.selectedCompetition._id!).subscribe({
      next: (data) => {
        this.assignments = data;
        this.loadingAssignments = false;
        // NOW generate subcategories after assignments are loaded
        this.generateSubCategories();
      },
      error: (err) => {
        console.error('Error loading jury assignments:', err);
        this.loadingAssignments = false;
        // Still generate subcategories even if loading fails
        this.generateSubCategories();
      }
    });
  }

  /**
   * Check if an assignment already exists for a given category and subcategory
   */
  hasAssignment(categoryId: string, subCategory: string): boolean {
    return this.assignments.some(a => {
      const aCatId = typeof a.categoryId === 'string' ? a.categoryId : (a.categoryId as any)._id;
      return aCatId === categoryId && a.subCategory === subCategory;
    });
  }

  /**
   * Get users who can be presidents (canBePresident = true)
   * Sorted by expertise level (highest first)
   */
  getPresidentCandidates() {
    return this.users
      .filter(u => u.canBePresident === true)
      .sort((a, b) => (b.expertiseLevel || 0) - (a.expertiseLevel || 0));
  }

  /**
   * Get filtered jury members based on criteria
   */
  getFilteredJuryMembers(sc: SubCategoryForm) {
    let filtered = [...this.users];

    // Normalize minExpertise to a number (0 if undefined) so TS can safely use it
    const minExpertise = sc.minExpertise ?? 0;

    // Filter by minimum expertise if set
    if (minExpertise > 0) {
      filtered = filtered.filter(u => (u.expertiseLevel || 0) >= minExpertise);
    }

    // Sort by expertise level (highest first), then by name
    filtered.sort((a, b) => {
      const expDiff = (b.expertiseLevel || 0) - (a.expertiseLevel || 0);
      if (expDiff !== 0) return expDiff;
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

    return filtered;
  }

  deleteAssignment(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا التعيين؟')) return;

    this.juryAssignmentService.delete(id).subscribe({
      next: () => {
        this.assignments = this.assignments.filter((a) => a._id !== id);
        // Regenerate subcategories to show the deleted one again
        this.generateSubCategories();
        alert('تم حذف التعيين بنجاح');
      },
      error: (err) => {
        console.error(err);
        alert('حدث خطأ أثناء حذف التعيين');
      }
    });
  }

  addAssignmentForSubCategory(sc: SubCategoryForm) {
  if (!sc.classRoom || !sc.presidentId) {
    alert('يرجى تعبئة كل الحقول المطلوبة');
    return;
  }

  const president = this.users.find(u => u._id === sc.presidentId);
  if (!president || !president.canBePresident) {
    alert('⚠️ الشخص المختار لا يمكنه أن يكون رئيساً للجنة');
    return;
  }

  if (this.hasAssignment(sc.catId, sc.sub)) {
    alert('⚠️ يوجد تعيين مسبق لهذه الفئة الفرعية');
    return;
  }

  // ✅ Filter out president from jury members
  const memberIds = (sc.juryMembers || []).filter(id => id !== sc.presidentId);

  const payload: Partial<IJuryAssignment> = {
    competitionId: this.selectedCompetition!._id!,
    categoryId: sc.catId,
    subCategory: sc.sub,
    classRoom: sc.classRoom,
    juryMembers: [
      { userId: sc.presidentId, role: 'president' as const },
      ...memberIds.map(id => ({ userId: id, role: 'member' as const }))
    ]
  };

  this.juryAssignmentService.create(payload).subscribe({
    next: () => {
      alert(`تم إضافة التعيين لـ ${sc.label} ✅`);
      this.loadAssignments();
      this.generateSubCategories();
    },
    error: (err) => {
      console.error('❌ Error adding assignment:', err);
      alert('حدث خطأ أثناء إضافة التعيين');
    }
  });
}

  // ===== Helpers =====
  resetWizard() {
    this.competitionForm.reset({ type: 'local' });
    this.genderConfig = {};
    this.currentStep = 1;
  }

  formatDate(date: string) {
    return new Date(date).toLocaleString('ar-TN');
  }

  getCategoryNames(comp: Competition) {
    if (!comp) return '';
    const ids = comp.categoryIds || [];
    return ids.map((c: any) => (c.name || this.getCategoryNameById(c))).join(', ');
  }

  getCategoryNameById(id: string | any): string {
    // Handle both string IDs and populated objects
    if (typeof id === 'object' && id !== null) {
      return id.name || id._id || 'Unknown';
    }
    const cat = this.categories.find(c => c._id === id);
    return cat ? cat.name : id;
  }

  getUserNameById(id: string | any): string {
    // Handle both string IDs and populated objects
    if (typeof id === 'object' && id !== null) {
      return `${id.firstName || ''} ${id.lastName || ''}`.trim() || id._id || 'Unknown';
    }
    const user = this.users.find(u => u._id === id);
    return user ? `${user.firstName} ${user.lastName}` : id;
  }

  /**
   * Format subcategory for display
   */
  formatSubCategory(subCategory: string): string {
    if (subCategory === 'male') return 'رجال';
    if (subCategory === 'female') return 'نساء';
    if (subCategory.startsWith('children_')) {
      const ageGroupId = subCategory.replace('children_', '');
      const ageGroup = this.allAgeGroups.find(a => a._id === ageGroupId);
      return ageGroup ? `أطفال ${ageGroup.name}` : 'أطفال';
    }
    return subCategory;
  }


  printTable() {
  window.print();
}

onCheckboxClick(event: Event, categoryId: string): void {
  event.stopPropagation(); // Prevent accordion toggle
  const checkbox = event.target as HTMLInputElement;
  
  const currentIds = this.competitionForm.value.categoryIds || [];
  
  if (checkbox.checked) {
    // Add category
    if (!currentIds.includes(categoryId)) {
      this.competitionForm.patchValue({
        categoryIds: [...currentIds, categoryId]
      });
      // Initialize genderConfig for this category
      if (!this.genderConfig[categoryId]) {
        this.genderConfig[categoryId] = {
          male: false,
          female: false,
          children: { active: false, ageGroups: [] }
        };
      }
    }
  } else {
    // Remove category
    this.competitionForm.patchValue({
      categoryIds: currentIds.filter((id: string) => id !== categoryId)
    });
    // Remove gender config for this category
    delete this.genderConfig[categoryId];
  }
}

isCategorySelected(categoryId: string): boolean {
  const ids = this.competitionForm.value.categoryIds || [];
  return ids.includes(categoryId);
}
}