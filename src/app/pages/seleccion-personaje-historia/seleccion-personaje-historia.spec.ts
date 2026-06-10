import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionPersonajeHistoria } from './seleccion-personaje-historia';

describe('SeleccionPersonajeHistoria', () => {
  let component: SeleccionPersonajeHistoria;
  let fixture: ComponentFixture<SeleccionPersonajeHistoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionPersonajeHistoria]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionPersonajeHistoria);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
