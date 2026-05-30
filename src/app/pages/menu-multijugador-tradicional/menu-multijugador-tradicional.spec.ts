import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenuMultijugadorTradicional } from './menu-multijugador-tradicional';

describe('Menu Multijugador Tradicional', () => {
  let component: MenuMultijugadorTradicional;
  let fixture: ComponentFixture<MenuMultijugadorTradicional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuMultijugadorTradicional],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuMultijugadorTradicional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
