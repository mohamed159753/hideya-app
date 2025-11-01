import { TestBed } from '@angular/core/testing';

import { AdminAddService } from './admin-add.service';

describe('AdminAddService', () => {
  let service: AdminAddService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAddService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
