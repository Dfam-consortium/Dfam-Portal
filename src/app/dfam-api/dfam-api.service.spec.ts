import { TestBed } from '@angular/core/testing';

import { DfamAPIService } from './dfam-rest.service';

describe('DfamAPIService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DfamAPIService = TestBed.get(DfamAPIService);
    expect(service).toBeTruthy();
  });
});
