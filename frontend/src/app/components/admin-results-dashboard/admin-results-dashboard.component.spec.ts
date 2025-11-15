import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminResultsDashboardComponent } from './admin-results-dashboard.component';

describe('AdminResultsDashboardComponent', () => {
  let component: AdminResultsDashboardComponent;
  let fixture: ComponentFixture<AdminResultsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminResultsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminResultsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
