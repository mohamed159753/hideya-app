import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { JuryAssignmentService } from '../../services/jury-assignment.service';


@Component({
  selector: 'app-jury-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jury-dashboard.component.html',
  styleUrl: './jury-dashboard.component.css'
})
export class JuryDashboardComponent {

  assignments: any[] = [];

  constructor(private auth: AuthService, private juryService: JuryAssignmentService) {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.loadAssignments(user.id);
    }
  }

  loadAssignments(userId: string) {
    this.juryService.getByUser(userId).subscribe(a => this.assignments = a);
  }

}
