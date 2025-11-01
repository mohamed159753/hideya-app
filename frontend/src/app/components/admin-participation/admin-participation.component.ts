import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../services/competition.service';
import { AdminAddService } from '../../services/admin-add.service';
import { ParticipationService } from '../../services/participation.service';

@Component({
  selector: 'app-admin-participation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-participation.component.html',
  styleUrls: ['./admin-participation.component.css']
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
      competitorIds: [[], Validators.required]
    });

    this.loadCompetitions();
    this.loadCompetitors();
    this.loadParticipations();
  }

  loadCompetitions() {
    this.competitionService.getAll().subscribe(data => {
      this.competitions = data;
    });
  }

  loadCompetitors() {
    this.competitorService.getAll().subscribe(data => {
      this.competitors = data;
    });
  }

  loadParticipations() {
    this.participationService.getAll().subscribe(data => {
      this.participations = data;
    });
  }

  onCompetitionChange() {
    const competitionId = this.participationForm.get('competitionId')?.value;
    if (competitionId) {
      const selectedCompetition = this.competitions.find(c => c._id === competitionId);
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
    this.selectedCompetitors = [...this.participationForm.get('competitorIds')?.value || []];
  }

  closeModal() {
    this.modalOpen = false;
  }

  toggleCompetitor(id: string) {
    const idx = this.selectedCompetitors.indexOf(id);
    if (idx > -1) {
      this.selectedCompetitors.splice(idx, 1);
    } else {
      this.selectedCompetitors.push(id);
    }
  }

  confirmSelection() {
    this.participationForm.get('competitorIds')?.setValue(this.selectedCompetitors);
    this.closeModal();
  }

  onSubmit() {
    if (this.participationForm.valid) {
      const { competitionId, categoryId, competitorIds } = this.participationForm.value;

      this.participationService.registerMultiple(competitionId, categoryId, competitorIds)
        .subscribe(() => {
          this.participationForm.reset();
          this.selectedCompetitors = [];
          this.categories = [];
          this.loadParticipations();
        });
    }
  }

  onDelete(id: string) {
    this.participationService.delete(id).subscribe(() => this.loadParticipations());
  }
}
