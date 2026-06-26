import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiendaOverlayComponent } from './tienda-overlay';

describe('TiendaOverlay', () => {
  let component: TiendaOverlayComponent;
  let fixture: ComponentFixture<TiendaOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiendaOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiendaOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
