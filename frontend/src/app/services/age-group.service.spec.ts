import { TestBed } from '@angular/core/testing';

import { AgeGroupService } from './age-group.service';

describe('AgeGroupService', () => {
  let service: AgeGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgeGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
