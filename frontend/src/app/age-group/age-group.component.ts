import { Component } from '@angular/core';
import { AgeGroupService } from '../services/age-group.service';
import { CommonModule } from '@angular/common';
import { from } from 'rxjs'; 
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-age-group',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './age-group.component.html',
  styleUrl: './age-group.component.css'
})
export class AgeGroupComponent {


  ageGroups: any[] = [];
    newGroupAge = "";
    from : any;
    to : any;

    constructor(private ageGroupService: AgeGroupService) {}
  
    ngOnInit(): void {
      this.loadAgeGroups();
    }
  
    loadAgeGroups() {
      this.ageGroupService.getAgeGroups().subscribe(data => {
        this.ageGroups = data;
      });
    }
  
    addAgeGroup() {
      if (!this.newGroupAge.trim()) return;

      console.log("this is the from age ",this.from)
      console.log("this is the to age ",this.to)
      console.log(this.from > this.to);
      this.ageGroupService.addAgeGroup(this.newGroupAge,Number(this.from),Number(this.to)).subscribe(() => {
        this.newGroupAge = "";
        this.loadAgeGroups();
      });
    }
  
    deleteAgeGroup(id: string) {
      this.ageGroupService.deleteAgeGroup(id).subscribe(() => {
        this.loadAgeGroups();
      });
    }
  

}
