import { TestBed } from '@angular/core/testing';

import { CompetetionCategoryService } from './competetion-category.service';

describe('CompetetionCategoryService', () => {
  let service: CompetetionCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompetetionCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
