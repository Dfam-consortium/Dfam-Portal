import { TestBed } from '@angular/core/testing';

import { DfamBackendAPIService } from './dfam-backend-api.service';

describe('DfamBackendAPIService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DfamBackendAPIService = TestBed.inject(DfamBackendAPIService);
    expect(service).toBeTruthy();
  });
});
