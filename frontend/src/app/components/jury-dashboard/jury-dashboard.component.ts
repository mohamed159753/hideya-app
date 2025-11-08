import { Component } from '@angular/core';
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

@Component({
  selector: 'app-jury-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jury-dashboard.component.html',
  styleUrl: './jury-dashboard.component.css',
})
export class JuryDashboardComponent {
  assignments: any[] = [];
  currentUser: any = null;

  // modal / marking state
  participants: any[] = [];
  selectedAssignment: any = null;
  selectedParticipation: any = null;
  isPresidentForSelected: boolean = false;
  markModalOpen = false;
  markForm!: FormGroup;
  loadingMark = false;
  defaultQuestionCount = 3;

  constructor(
    private auth: AuthService,
    private juryService: JuryAssignmentService,
    private participationService: ParticipationService,
    private markService: MarkService,
    private fb: FormBuilder,
    private notify: NotificationService
  ) {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.currentUser = user;
      this.loadAssignments(user.id);
    }
    this.initMarkForm();
  }

  loadAssignments(userId: string) {
    this.juryService
      .getByUser(userId)
      .subscribe((a) => (this.assignments = a || []));
  }

  openAssignment(a: any) {
    this.selectedAssignment = a;
    const compId = a.competitionId?._id || a.competitionId;
    const catId = a.categoryId?._id || a.categoryId;
    this.participants = [];
    if (!compId) return;
    this.participationService.getByCompetition(compId).subscribe((list) => {
      this.participants = (list || []).filter(
        (p: any) => (p.categoryId?._id || p.categoryId) == catId
      );
    });
  }
  closeAssignment() {
    this.selectedAssignment = null;
    this.participants = [];
  }

  openMarkModal(participation: any) {
    this.selectedParticipation = participation;
    this.markModalOpen = true;
    this.loadingMark = true;

    // determine if current user is president for the selected assignment
    this.isPresidentForSelected = !!(
      (this.selectedAssignment?.juryMembers || []).find((m: any) => {
        const uid = m.userId?._id || m.userId;
        return (
          uid === this.currentUser.id || uid === this.currentUser._id
        ) && m.role === 'president';
      })
    );

    // try to load existing mark for this jury + participation
    const juryId = this.currentUser.id || this.currentUser._id;
    this.markService
      .getByJuryAndParticipation(juryId, participation._id)
      .subscribe(
        (res: any) => {
          if (res) {
            // load existing
            this.markForm.patchValue({
              juryId: res.juryId,
              participationId: res.participationId,
              performanceLevel: res.performanceLevel || 'متوسط',
              confirmed: !!res.confirmed,
            });
            if (Array.isArray(res.questions)) this.setQuestionsFromData(res.questions);
            else this.setQuestionsFromData(null);
          } else {
            // new mark
            this.markForm.patchValue({
              juryId: juryId,
              participationId: participation._id,
              performanceLevel: 'متوسط',
              confirmed: false,
            });
            this.setQuestionsFromData(null);
          }
          this.loadingMark = false;
        },
        (_err) => {
          // on error, initialize empty form
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
          if (Array.isArray(res.questions))
            this.setQuestionsFromData(res.questions);
          this.notify.success('تم حفظ العلامة بنجاح');
        }
      },
      (err) => {
        console.error(err);
        this.loadingMark = false;
        // error notifications are already shown by the service, but in case show fallback
        if (!err?.error?.message) this.notify.error('حدث خطأ أثناء حفظ العلامة');
      }
    );
  }

  confirmMark() {
    if (!this.markForm) return;
    this.markForm.patchValue({ confirmed: true });
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

    // listen to questions changes and trigger recalculations (Angular will update getters)
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
      // flat controls for easier binding in template (we map these values when displaying)
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
      for (let i = 0; i < this.defaultQuestionCount; i++)
        arr.push(this.makeQuestionGroup(i));
    }
  }

  // compute deductions based on form values (client-side preview)
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
    // rounding to 2 decimals for display
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

  get maxTotal() {
    return 100;
  }

  get progressPercent() {
    return Math.round((this.currentTotal / this.maxTotal) * 100);
  }

  get isConfirmed() {
    return this.markForm?.get('confirmed')?.value === true;
  }

  // increase/decrease for memorization mistakes in question i
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

  // per-question computations (used in template)
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

  // tajweed score per question (max per question = depends on your rules; we compute relative)
  tajMaxPerQuestion() {
    // since tajweed total is 25 overall, if defaultQuestionCount questions then per-question max = 25 / defaultQuestionCount
    return Math.round((25 / Math.max(1, this.questions.length)) * 100) / 100;
  }

  perQuestionTajScore(qIndex: number) {
    // return the score left in tajweed for that question after deduction (not strictly necessary but useful)
    const max = this.tajMaxPerQuestion();
    const ded = this.perQuestionTajDeduction(qIndex);
    const score = Math.max(0, Math.round((max - ded) * 100) / 100);
    return score;
  }

  perQuestionRowTotal(qIndex: number) {
    // aggregate mem and taj per question into a small row total (for display only)
    const memMaxPerQ =
      Math.round((70 / Math.max(1, this.questions.length)) * 100) / 100;
    const memDed = this.perQuestionMemDeduction(qIndex);
    const memScore = Math.max(0, Math.round((memMaxPerQ - memDed) * 100) / 100);
    const tajScore = this.perQuestionTajScore(qIndex);
    // performance is global, not per-question, so we omit it here
    return Math.round((memScore + tajScore) * 100) / 100;
  }

  // helper to compute totals for footer counters
  totalCounters(group: 'memorization' | 'tajweed', field: string) {
    let tot = 0;
    for (let i = 0; i < this.questions.length; i++) {
      const ctrl = this.questions.at(i).get([group, field]);
      if (ctrl) tot += ctrl.value || 0;
    }
    return tot;
  }
}
