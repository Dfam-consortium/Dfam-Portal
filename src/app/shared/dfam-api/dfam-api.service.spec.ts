import { TestBed } from '@angular/core/testing';

import { DfamAPIService } from './dfam-api.service';

describe('DfamAPIService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DfamAPIService = TestBed.inject(DfamAPIService);
    expect(service).toBeTruthy();
  });
});
