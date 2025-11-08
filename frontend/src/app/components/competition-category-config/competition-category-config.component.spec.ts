import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitionCategoryConfigComponent } from './competition-category-config.component';

describe('CompetitionCategoryConfigComponent', () => {
  let component: CompetitionCategoryConfigComponent;
  let fixture: ComponentFixture<CompetitionCategoryConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionCategoryConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetitionCategoryConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
