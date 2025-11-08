import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuryResultsComponent } from './jury-results.component';

describe('JuryResultsComponent', () => {
  let component: JuryResultsComponent;
  let fixture: ComponentFixture<JuryResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuryResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuryResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
