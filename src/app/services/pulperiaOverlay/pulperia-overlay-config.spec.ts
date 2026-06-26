import { TestBed } from '@angular/core/testing';

import { PulperiaOverlayConfig } from './pulperia-overlay-config';

describe('PulperiaOverlayConfig', () => {
  let service: PulperiaOverlayConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PulperiaOverlayConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
