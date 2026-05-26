import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenuMultijugador } from './menu-multijugador';

describe('Menu Multijugador', () => {
  let component: MenuMultijugador;
  let fixture: ComponentFixture<MenuMultijugador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuMultijugador],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuMultijugador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
