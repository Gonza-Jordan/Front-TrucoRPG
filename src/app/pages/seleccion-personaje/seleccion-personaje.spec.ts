import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionPersonaje } from './seleccion-personaje';

describe('SeleccionPersonaje', () => {
  let component: SeleccionPersonaje;
  let fixture: ComponentFixture<SeleccionPersonaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionPersonaje]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionPersonaje);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
