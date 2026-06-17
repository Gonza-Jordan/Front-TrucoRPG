import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioOverlay } from './inventario-overlay';

describe('InventarioOverlay', () => {
  let component: InventarioOverlay;
  let fixture: ComponentFixture<InventarioOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
