import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../services/competition.service';
import { AdminAddService } from '../../services/admin-add.service';
import { ParticipationService } from '../../services/participation.service';

@Component({
  selector: 'app-admin-participation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-participation.component.html',
  styleUrls: ['./admin-participation.component.css'],
})
export class AdminParticipationComponent implements OnInit {
  participationForm!: FormGroup;
  competitions: any[] = [];
  categories: any[] = [];
  competitors: any[] = [];
  participations: any[] = [];

  // Modal state
  modalOpen = false;
  selectedCompetitors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private competitorService: AdminAddService,
    private participationService: ParticipationService
  ) {}

  ngOnInit(): void {
    this.participationForm = this.fb.group({
      competitionId: ['', Validators.required],
      categoryId: ['', Validators.required],
      competitorIds: [[], Validators.required],
    });

    this.loadCompetitions();
    this.loadCompetitors();
    this.loadParticipations();
  }

  loadCompetitions() {
    this.competitionService.getAll().subscribe({
      next: (data) => {
        this.competitions = data || [];
      },
      error: (error) => {
        console.error('Error loading competitions:', error);
        this.competitions = [];
      },
    });
  }

  loadCompetitors() {
    this.competitorService.getAll().subscribe({
      next: (data) => {
        this.competitors = data || [];
      },
      error: (error) => {
        console.error('Error loading competitors:', error);
        this.competitors = [];
      },
    });
  }

  loadParticipations() {
    this.participationService.getAll().subscribe({
      next: (data) => {
        this.participations = data || [];
      },
      error: (error) => {
        console.error('Error loading participations:', error);
        this.participations = [];
      },
    });
  }

  onCompetitionChange() {
    const competitionId = this.participationForm.get('competitionId')?.value;
    if (competitionId) {
      const selectedCompetition = this.competitions.find(
        (c) => c._id === competitionId
      );
      this.categories = selectedCompetition?.categoryIds || [];
      console.log('Selected Competition Categories:', this.categories);
      this.participationForm.get('categoryId')?.setValue('');
    } else {
      this.categories = [];
    }
  }

  // Modal handlers
  openModal() {
    this.modalOpen = true;
    this.selectedCompetitors = [
      ...(this.participationForm.get('competitorIds')?.value || []),
    ];
  }

  closeModal() {
    this.modalOpen = false;
  }

  toggleCompetitor(id: string) {
    if (!id) return;

    const idx = this.selectedCompetitors.indexOf(id);
    if (idx > -1) {
      this.selectedCompetitors.splice(idx, 1);
    } else {
      this.selectedCompetitors.push(id);
    }
  }

  confirmSelection() {
    this.participationForm
      .get('competitorIds')
      ?.setValue(this.selectedCompetitors);
    this.closeModal();
  }

  onSubmit() {
    if (this.participationForm.valid) {
      const { competitionId, categoryId, competitorIds } =
        this.participationForm.value;

      this.participationService
        .registerMultiple(competitionId, categoryId, competitorIds)
        .subscribe({
          next: () => {
            this.participationForm.reset();
            this.selectedCompetitors = [];
            this.categories = [];
            this.loadParticipations();
          },
          error: (error) => {
            console.error('Error registering participants:', error);
          },
        });
    }
  }

  onDelete(id: string) {
    if (!id) return;

    this.participationService.delete(id).subscribe({
      next: () => this.loadParticipations(),
      error: (error) => {
        console.error('Error deleting participation:', error);
      },
    });
  }
}
