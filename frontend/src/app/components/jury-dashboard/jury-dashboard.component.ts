import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { JuryAssignmentService } from '../../services/jury-assignment.service';
import { ParticipationService } from '../../services/participation.service';
import { MarkService } from '../../services/mark.service';
import { NotificationService } from '../../services/notification.service';
import { ResultsService } from '../../services/results.service';
import { Router } from '@angular/router';
import { CompetitionCategoryService } from '../../services/competetion-category.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-jury-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jury-dashboard.component.html',
  styleUrls: ['./jury-dashboard.component.css'],
})
export class JuryDashboardComponent implements OnInit {
  assignments: any[] = [];
  currentUser: any = null;

  // modal / marking state
  participants: any[] = [];
  subcategoryBlocks: { cc: any; participants: any[] }[] = [];
  selectedAssignment: any = null;
  selectedParticipation: any = null;
  isPresidentForSelected: boolean = false;
  markModalOpen = false;
  markForm!: FormGroup;
  loadingMark = false;
  defaultQuestionCount = 3;
  participations = [];

  canShowResults: boolean = false;
  resultsMessage: string = '';
  isPresident: boolean = false;

  // Track marked participants
  markedParticipants: Set<string> = new Set();

  constructor(
    private auth: AuthService,
    private juryService: JuryAssignmentService,
    private participationService: ParticipationService,
    private markService: MarkService,
    private fb: FormBuilder,
    private notify: NotificationService,
    private resultsService: ResultsService,
    private router: Router,
    private ccService: CompetitionCategoryService
  ) {}

  ngOnInit() {
    console.log('Jury Dashboard Component Loaded');
    const user = this.auth.getCurrentUser();
    if (user) {
      this.currentUser = user;
      this.loadAssignments(user.id);
      this.checkUserRole();
    }
    this.initMarkForm();
  }

  checkUserRole() {
    this.isPresident = this.assignments.some((assignment) =>
      assignment.juryMembers?.some((member: any) => {
        const uid = member.userId?._id || member.userId;
        return (
          (uid === this.currentUser.id || uid === this.currentUser._id) &&
          member.role === 'president'
        );
      })
    );
  }

  // Check if results can be shown
  checkAndShowResults() {
    if (!this.selectedAssignment) {
      this.resultsMessage = 'يرجى اختيار مهمة أولاً';
      return;
    }

    const compId =
      this.selectedAssignment.competitionId?._id ||
      this.selectedAssignment.competitionId;

    // Derive categoryId from competitionCategoryId when assignments target subcategories
    const cc = this.selectedAssignment.competitionCategoryId;
    const catId =
      cc?.categoryId?._id ||
      cc?.categoryId ||
      this.selectedAssignment.categoryId?._id ||
      this.selectedAssignment.categoryId;

    const requestedBy = this.currentUser?.id || this.currentUser?._id;
    this.resultsService.check(compId, catId, requestedBy).subscribe({
      next: (response: any) => {
        if (response.allowed) {
          this.resultsService
            .saveFinalResults({
              competitionId: compId,
              categoryId: catId,
              requestedBy,
            })
            .subscribe(
              (saved: any) => {
                if (saved && saved._id) {
                  this.router.navigate(['/results', saved._id]);
                } else {
                  this.resultsMessage = 'فشل حفظ النتائج النهائية';
                }
              },
              (err) => {
                console.error('Error saving final results:', err);
              }
            );
        } else {
          this.resultsMessage =
            this.translateReason(response.reason) ||
            'لا يمكن عرض النتائج حالياً';
        }
      },
      error: (error) => {
        this.resultsMessage = 'حدث خطأ في التحقق من النتائج';
        console.error('Error checking results:', error);
      },
    });
  }

  loadAssignments(userId: string) {
    this.juryService.getByUser(userId).subscribe((a) => {
      this.assignments = a || [];
      console.log('Assignments loaded:', this.assignments);
    });
  }

  openAssignment(assignment: any) {
    this.selectedAssignment = assignment;
    this.subcategoryBlocks = [];
    this.participants = []; // Reset participants

    const compId = assignment.competitionId?._id || assignment.competitionId;
    const catId = assignment.categoryId?._id || assignment.categoryId;

    console.log('Selected Assignment:', assignment);
    console.log('Assignment IDs:', { compId, catId });

    if (!compId || !catId) {
      console.error('Missing required IDs:', { compId, catId });
      this.notify.error('بيانات المهمة غير مكتملة');
      return;
    }

    // Get subCategoryId if it exists, otherwise use competitionCategoryId
    const subCategoryId =
      assignment.subCategory?._id ||
      assignment.subCategory ||
      assignment.competitionCategoryId?._id ||
      assignment.competitionCategoryId;

    console.log('Loading participations for:', {
      compId,
      catId,
      subCategoryId,
    });

    // First get all participations for this competition category
    this.participationService
      .getByCategory(compId, catId, subCategoryId)
      .subscribe({
        next: (allParticipations) => {
          console.log('All participations loaded:', allParticipations);

          if (!allParticipations || allParticipations.length === 0) {
            console.log('No participations found for this assignment');
            this.participants = [];
            this.subcategoryBlocks = [];
            return;
          }

          // Simply assign all participations directly
          this.participants = allParticipations;

          // If you have a competitionCategoryId on the assignment, create a single block
          if (assignment.competitionCategoryId) {
            this.subcategoryBlocks = [
              {
                cc: assignment.competitionCategoryId,
                participants: allParticipations,
              },
            ];
          } else {
            // Otherwise just show all participants without subcategory grouping
            this.subcategoryBlocks = [
              {
                cc: {
                  categoryId: assignment.categoryId,
                  ageGroupId: null,
                  gender: null,
                },
                participants: allParticipations,
              },
            ];
          }

          console.log('Subcategory blocks created:', this.subcategoryBlocks);
          console.log('Total participants:', this.participants.length);

          // Load marks for participants
          this.loadMarksForParticipants();
          this.updateResultsAvailability();
        },
        error: (err) => {
          console.error('Error loading participations:', err);
          this.notify.error('حدث خطأ في تحميل المشاركين');
          this.participants = [];
          this.subcategoryBlocks = [];
        },
      });
  }

  private groupParticipationsByCategory(
    competitionCategories: any[],
    allParticipations: any[]
  ) {
    if (competitionCategories.length === 0) {
      console.log('No competition categories to display');
      this.finalizeParticipants();
      return;
    }

    // Group participations by their competition category ID
    this.subcategoryBlocks = competitionCategories.map((cc: any) => {
      const ccId = cc._id || cc;

      // Filter participations that belong to this competition category
      const participants = allParticipations.filter((p: any) => {
        const pCcId = p.competitionCategoryId?._id || p.competitionCategoryId;
        return pCcId === ccId;
      });

      console.log(
        `Competition category ${ccId} has ${participants.length} participants`
      );

      return {
        cc: cc,
        participants: participants,
      };
    });

    console.log('All subcategory blocks grouped:', this.subcategoryBlocks);
    this.finalizeParticipants();
  }

  private finalizeParticipants() {
    // Flatten all participants for marking purposes
    this.participants = this.subcategoryBlocks.flatMap((b) => b.participants);

    console.log('Final subcategory blocks:', this.subcategoryBlocks);
    console.log('Total participants:', this.participants.length);

    this.loadMarksForParticipants();
    this.updateResultsAvailability();
  }

  updateResultsAvailability() {
    if (!this.selectedAssignment) return;

    const compId =
      this.selectedAssignment.competitionId?._id ||
      this.selectedAssignment.competitionId;

    const cc = this.selectedAssignment.competitionCategoryId;
    const catId =
      cc?.categoryId?._id ||
      cc?.categoryId ||
      this.selectedAssignment.categoryId?._id ||
      this.selectedAssignment.categoryId;

    const requestedBy = this.currentUser?.id || this.currentUser?._id;
    this.resultsService.check(compId, catId, requestedBy).subscribe({
      next: (response: any) => {
        this.canShowResults = !!response.allowed;
        this.resultsMessage = this.translateReason(response.reason) || '';
      },
      error: (error) => {
        console.error('Error updating results availability:', error);
        this.resultsMessage = 'حدث خطأ في التحقق من النتائج';
      },
    });
  }

  loadMarksForParticipants() {
    const juryId = this.currentUser.id || this.currentUser._id;
    this.markedParticipants.clear();

    if (this.participants.length === 0) return;

    let loadedCount = 0;
    const totalParticipants = this.participants.length;

    this.participants.forEach((participant) => {
      this.markService
        .getByJuryAndParticipation(juryId, participant._id)
        .subscribe({
          next: (mark: any) => {
            if (mark) {
              this.markedParticipants.add(participant._id);
            }
            loadedCount++;

            if (loadedCount === totalParticipants) {
              console.log('Finished loading marks for all participants');
            }
          },
          error: (err) => {
            console.error(
              'Error loading mark for participant:',
              participant._id,
              err
            );
            loadedCount++;
          },
        });
    });
  }

  // Helper method to get initials for avatar
  getInitials(participant: any): string {
    const firstName = participant.competitorId?.firstName || '';
    const lastName = participant.competitorId?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  // Helper method to check if participant is marked
  isMarked(participant: any): boolean {
    return this.markedParticipants.has(participant._id);
  }

  openMarkModal(participation: any) {
    this.selectedParticipation = participation;
    this.markModalOpen = true;
    this.loadingMark = true;

    // Determine if current user is president for the selected assignment
    this.isPresidentForSelected = !!(
      this.selectedAssignment?.juryMembers || []
    ).find((m: any) => {
      const uid = m.userId?._id || m.userId;
      return (
        (uid === this.currentUser.id || uid === this.currentUser._id) &&
        m.role === 'president'
      );
    });

    // Try to load existing mark for this jury + participation
    const juryId = this.currentUser.id || this.currentUser._id;
    this.markService
      .getByJuryAndParticipation(juryId, participation._id)
      .subscribe(
        (res: any) => {
          if (res) {
            // Load existing mark
            this.markForm.patchValue({
              juryId: res.juryId,
              participationId: res.participationId,
              performanceLevel: res.performanceLevel || 'متوسط',
              confirmed: !!res.confirmed,
            });
            // enable/disable performance control based on confirmed
            if (this.markForm.get('confirmed')?.value) {
              this.markForm.get('performanceLevel')?.disable();
            } else {
              this.markForm.get('performanceLevel')?.enable();
            }
            if (Array.isArray(res.questions)) {
              this.setQuestionsFromData(res.questions);
            } else {
              this.setQuestionsFromData(null);
            }
            this.markedParticipants.add(participation._id);
          } else {
            // New mark
            this.markForm.patchValue({
              juryId: juryId,
              participationId: participation._id,
              performanceLevel: 'متوسط',
              confirmed: false,
            });
            // ensure performance control is enabled for a new mark
            this.markForm.get('performanceLevel')?.enable();
            this.setQuestionsFromData(null);
          }
          this.loadingMark = false;
        },
        (_err) => {
          // On error, initialize empty form
          this.markForm.patchValue({
            juryId: juryId,
            participationId: participation._id,
            performanceLevel: 'متوسط',
            confirmed: false,
          });
          this.setQuestionsFromData(null);
          this.loadingMark = false;
        }
      );
  }

  closeMarkModal() {
    this.markModalOpen = false;
    this.selectedParticipation = null;
  }

  submitMark() {
    if (!this.markForm.valid) {
      this.markForm.markAllAsTouched();
      this.notify.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    this.loadingMark = true;
    const payload = this.buildPayloadFromForm();

    this.markService.upsert(payload).subscribe(
      (res) => {
        this.loadingMark = false;
        if (res) {
          this.markForm.patchValue({
            confirmed: !!res.confirmed,
            performanceLevel:
              res.performanceLevel || this.markForm.value.performanceLevel,
          });
          // update performance control disabled state based on confirmed
          if (this.markForm.get('confirmed')?.value) {
            this.markForm.get('performanceLevel')?.disable();
          } else {
            this.markForm.get('performanceLevel')?.enable();
          }
          if (Array.isArray(res.questions)) {
            this.setQuestionsFromData(res.questions);
          }
          this.markedParticipants.add(this.selectedParticipation._id);
          this.notify.success('تم حفظ العلامة بنجاح');
        }
      },
      (err) => {
        console.error(err);
        this.loadingMark = false;
        if (!err?.error?.message) {
          this.notify.error('حدث خطأ أثناء حفظ العلامة');
        }
      }
    );
  }

  confirmMark() {
    if (!this.markForm) return;
    this.markForm.patchValue({ confirmed: true });
    // disable performance control when confirmed
    this.markForm.get('performanceLevel')?.disable();
    this.submitMark();
  }

  // --- Form helpers ---
  initMarkForm() {
    this.markForm = this.fb.group({
      juryId: [null, Validators.required],
      participationId: [null, Validators.required],
      questions: this.fb.array([]),
      performanceLevel: ['متوسط', Validators.required],
      confirmed: [false],
    });

    // Listen to questions changes
    this.markForm.get('questions')?.valueChanges.subscribe(() => {});
  }

  buildPayloadFromForm() {
    const v = this.markForm.value;
    return {
      juryId: v.juryId,
      participationId: v.participationId,
      questions: v.questions || [],
      performanceLevel: v.performanceLevel,
      confirmed: !!v.confirmed,
    };
  }

  // Questions helpers
  get questions() {
    return this.markForm.get('questions') as FormArray;
  }

  private makeQuestionGroup(index: number, data?: any) {
    return this.fb.group({
      questionNumber: [data?.questionNumber ?? index + 1, Validators.required],
      memorization: this.fb.group({
        tanbih: [data?.memorization?.tanbih ?? 0, [Validators.min(0)]],
        fath: [data?.memorization?.fath ?? 0, [Validators.min(0)]],
        taradud: [data?.memorization?.taradud ?? 0, [Validators.min(0)]],
      }),
      tajweed: this.fb.group({
        ghunna: [data?.tajweed?.ghunna ?? 0, [Validators.min(0)]],
        mad: [data?.tajweed?.mad ?? 0, [Validators.min(0)]],
        makharij: [data?.tajweed?.makharij ?? 0, [Validators.min(0)]],
        sifat: [data?.tajweed?.sifat ?? 0, [Validators.min(0)]],
        usul: [data?.tajweed?.usul ?? 0, [Validators.min(0)]],
        other: [data?.tajweed?.other ?? 0, [Validators.min(0)]],
      }),
    });
  }

  setQuestionsFromData(data: any[] | null) {
    const arr = this.questions;
    while (arr.length) arr.removeAt(0);
    if (data && data.length) {
      data.forEach((d, i) => arr.push(this.makeQuestionGroup(i, d)));
    } else {
      for (let i = 0; i < this.defaultQuestionCount; i++) {
        arr.push(this.makeQuestionGroup(i));
      }
    }
  }

  // All other computation methods remain the same
  computeDeductions() {
    const D = { tanbih: 0.5, fath: 1.5, taradud: 0.25, tajUnit: 0.25 };
    let memD = 0;
    let tajD = 0;
    const qs = this.markForm.value.questions || [];
    for (const q of qs) {
      const m = q.memorization || {};
      memD += (m.tanbih || 0) * D.tanbih;
      memD += (m.fath || 0) * D.fath;
      memD += (m.taradud || 0) * D.taradud;

      const t = q.tajweed || {};
      tajD += (t.ghunna || 0) * D.tajUnit;
      tajD += (t.mad || 0) * D.tajUnit;
      tajD += (t.makharij || 0) * D.tajUnit;
      tajD += (t.sifat || 0) * D.tajUnit;
      tajD += (t.usul || 0) * D.tajUnit;
      tajD += (t.other || 0) * D.tajUnit;
    }
    return {
      memDeductions: Math.round(memD * 100) / 100,
      tajDeductions: Math.round(tajD * 100) / 100,
    };
  }

  get memorizationTotalPreview() {
    const MEM_MAX = 70;
    return Math.max(
      0,
      Math.round((MEM_MAX - this.computeDeductions().memDeductions) * 100) / 100
    );
  }

  get tajweedTotalPreview() {
    const TAJ_MAX = 25;
    return Math.max(
      0,
      Math.round((TAJ_MAX - this.computeDeductions().tajDeductions) * 100) / 100
    );
  }

  get performanceScorePreview() {
    const lvl = this.markForm.get('performanceLevel')?.value;
    const map: any = {
      متوسط: 3,
      average: 3,
      حسن: 4,
      good: 4,
      ممتاز: 5,
      excellent: 5,
    };
    return map[lvl] ?? 3;
  }

  get currentTotal() {
    return (
      Math.round(
        (this.memorizationTotalPreview +
          this.tajweedTotalPreview +
          this.performanceScorePreview) *
          100
      ) / 100
    );
  }

  get isConfirmed() {
    return this.markForm?.get('confirmed')?.value === true;
  }

  increaseMistake(qIndex: number, field: string) {
    const ctrl = this.questions.at(qIndex).get(['memorization', field]);
    if (!ctrl) return;
    ctrl.setValue((ctrl.value || 0) + 1);
  }

  decreaseMistake(qIndex: number, field: string) {
    const ctrl = this.questions.at(qIndex).get(['memorization', field]);
    if (!ctrl) return;
    const next = (ctrl.value || 0) - 1;
    ctrl.setValue(next < 0 ? 0 : next);
  }

  increaseTaj(qIndex: number, field: string) {
    const ctrl = this.questions.at(qIndex).get(['tajweed', field]);
    if (!ctrl) return;
    ctrl.setValue((ctrl.value || 0) + 1);
  }

  decreaseTaj(qIndex: number, field: string) {
    const ctrl = this.questions.at(qIndex).get(['tajweed', field]);
    if (!ctrl) return;
    const next = (ctrl.value || 0) - 1;
    ctrl.setValue(next < 0 ? 0 : next);
  }

  perQuestionMemDeduction(qIndex: number) {
    const D = { tanbih: 0.5, fath: 1.5, taradud: 0.25 };
    const q = this.questions.at(qIndex).value;
    const m = q?.memorization || {};
    const val =
      (m.tanbih || 0) * D.tanbih +
      (m.fath || 0) * D.fath +
      (m.taradud || 0) * D.taradud;
    return Math.round(val * 100) / 100;
  }

  perQuestionTajDeduction(qIndex: number) {
    const TJ = 0.25;
    const q = this.questions.at(qIndex).value;
    const t = q?.tajweed || {};
    const sum =
      ((t.ghunna || 0) +
        (t.mad || 0) +
        (t.makharij || 0) +
        (t.sifat || 0) +
        (t.usul || 0) +
        (t.other || 0)) *
      TJ;
    return Math.round(sum * 100) / 100;
  }

  tajMaxPerQuestion() {
    return Math.round((25 / Math.max(1, this.questions.length)) * 100) / 100;
  }

  perQuestionTajScore(qIndex: number) {
    const max = this.tajMaxPerQuestion();
    const ded = this.perQuestionTajDeduction(qIndex);
    const score = Math.max(0, Math.round((max - ded) * 100) / 100);
    return score;
  }

  perQuestionRowTotal(qIndex: number) {
    const memMaxPerQ =
      Math.round((70 / Math.max(1, this.questions.length)) * 100) / 100;
    const memDed = this.perQuestionMemDeduction(qIndex);
    const memScore = Math.max(0, Math.round((memMaxPerQ - memDed) * 100) / 100);
    const tajScore = this.perQuestionTajScore(qIndex);
    return Math.round((memScore + tajScore) * 100) / 100;
  }

  totalCounters(group: 'memorization' | 'tajweed', field: string) {
    let tot = 0;
    for (let i = 0; i < this.questions.length; i++) {
      const ctrl = this.questions.at(i).get([group, field]);
      if (ctrl) tot += ctrl.value || 0;
    }
    return tot;
  }

  // Hover methods for interactive elements
  onTaskCardHover(event: any, isHovering: boolean) {
    const element = event.currentTarget;
    if (isHovering) {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.12)';
      element.style.borderColor = '#2d8c4a';
    } else {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
      // Keep border color if it's the active assignment
      if (!this.selectedAssignment || element !== this.selectedAssignment) {
        element.style.borderColor = '#e0e0e0';
      }
    }
  }

  onCompetitorCardHover(event: any, isHovering: boolean) {
    const element = event.currentTarget;
    if (isHovering) {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.12)';
      element.style.borderColor = '#2d8c4a';
    } else {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = 'none';
      element.style.borderColor = '#e0e0e0';
    }
  }

  onMarkButtonHover(event: any, isHovering: boolean) {
    const element = event.currentTarget;
    element.style.background = isHovering ? '#1b5e20' : '#2d8c4a';
  }

  onCloseButtonHover(event: any, isHovering: boolean) {
    const element = event.currentTarget;
    element.style.background = isHovering ? 'rgba(255, 255, 255, 0.2)' : 'none';
  }

  onSummaryCardHover(element: any, isHovering: boolean) {
    element.style.transform = isHovering ? 'translateY(-2px)' : 'translateY(0)';
  }

  // Open results flow: check permission, generate result and navigate to results view
  openResults(assignment: any) {
    const compId = assignment.competitionId?._id || assignment.competitionId;
    const catId = assignment.categoryId?._id || assignment.categoryId;
    if (!compId || !catId) {
      this.notify.error('معرّف المسابقة أو الفئة مفقود');
      return;
    }
    const requestedBy = this.currentUser?.id || this.currentUser?._id;
    this.resultsService.check(compId, catId, requestedBy).subscribe(
      (res: any) => {
        if (!res?.allowed) {
          this.notify.error(
            this.translateReason(res?.reason) || 'غير مسموح بعرض النتائج الآن'
          );
          return;
        }
        this.notify.info('جارٍ تجهيز النتائج...');
        this.resultsService
          .saveFinalResults({
            competitionId: compId,
            categoryId: catId,
            requestedBy,
          })
          .subscribe(
            (result: any) => {
              if (result && result._id) {
                this.router.navigate(['/results', result._id]);
              } else {
                this.notify.error('فشل إنشاء النتائج');
              }
            },
            (err: any) => {
              // errors already notified by service
              console.error(err);
            }
          );
      },
      (err) => {
        console.error(err);
      }
    );
  }

  // Translate backend reason codes/messages (English) into Arabic for UI
  translateReason(reason?: string) {
    if (!reason) return '';
    const r = String(reason).toLowerCase();
    if (r.includes('president') || r.includes('override'))
      return 'مسموح بتجاوز الرئيس';
    if (
      r.includes('not all') ||
      r.includes('not all marks') ||
      r.includes('not all marks submitted') ||
      r.includes('not all')
    )
      return 'لم يتم وضع علامات لجميع الحكام';
    if (
      r.includes('all jury') ||
      r.includes('all jury members') ||
      r.includes('all jury members submitted marks') ||
      r.includes('all')
    )
      return 'جميع الحكام قد وضعوا علامات';
    if (r.includes('no jury')) return 'لا توجد لجان محكّمة مخصصة لهذه الفئة';
    if (r.includes('invalid')) return 'معرّف المسابقة أو الفئة غير صالح';
    // fallback: return original reason if likely already Arabic, else return it unchanged
    return reason;
  }
  // Add this method to your component class
  backToTasks() {
    this.selectedAssignment = null;
    this.subcategoryBlocks = [];
    this.participants = [];
    this.resultsMessage = '';
    this.canShowResults = false;
  }

  // Add this hover handler method
  onBackButtonHover(event: any, isHovering: boolean) {
    const element = event.currentTarget;
    element.style.background = isHovering ? '#555' : '#666';
  }
}
