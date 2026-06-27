import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiendaOverlay } from './tienda-overlay';

describe('TiendaOverlay', () => {
  let component: TiendaOverlay;
  let fixture: ComponentFixture<TiendaOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiendaOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiendaOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
