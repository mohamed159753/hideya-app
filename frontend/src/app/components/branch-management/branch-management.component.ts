import { Component } from '@angular/core';
import { BranchService } from '../../services/branch.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './branch-management.component.html',
  styleUrl: './branch-management.component.css'
})
export class BranchManagementComponent {

  branches: any[] = [];
  newBranchName = "";

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getBranches().subscribe(data => {
      this.branches = data;
    });
  }

  addBranch() {
    if (!this.newBranchName.trim()) return;

    this.branchService.addBranch(this.newBranchName).subscribe(() => {
      this.newBranchName = "";
      this.loadBranches();
    });
  }

  deleteBranch(id: string) {
    this.branchService.deleteBranch(id).subscribe(() => {
      this.loadBranches();
    });
  }

}
