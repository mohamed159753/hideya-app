import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminResultDetailComponent } from './admin-result-detail.component';

describe('AdminResultDetailComponent', () => {
  let component: AdminResultDetailComponent;
  let fixture: ComponentFixture<AdminResultDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminResultDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminResultDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
