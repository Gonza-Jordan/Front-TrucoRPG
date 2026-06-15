import { TestBed } from '@angular/core/testing';

import { OverlayConfig } from './overlay-config';

describe('OverlayConfig', () => {
  let service: OverlayConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
