import { TestBed } from '@angular/core/testing';

import { CasaOverlayConfig } from './casa-overlay-config';

describe('CasaOverlayConfig', () => {
  let service: CasaOverlayConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CasaOverlayConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
