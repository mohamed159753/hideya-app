import { TestBed } from '@angular/core/testing';

import { AdminResultsService } from './admin-results.service';

describe('AdminResultsServiceService', () => {
  let service: AdminResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
