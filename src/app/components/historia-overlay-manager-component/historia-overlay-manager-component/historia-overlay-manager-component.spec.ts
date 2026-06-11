import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriaOverlayManagerComponent } from './historia-overlay-manager-component';

describe('HistoriaOverlayManagerComponent', () => {
  let component: HistoriaOverlayManagerComponent;
  let fixture: ComponentFixture<HistoriaOverlayManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriaOverlayManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriaOverlayManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
