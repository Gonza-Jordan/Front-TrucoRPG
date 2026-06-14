import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Camara } from './camara';

describe('Camara', () => {
  let component: Camara;
  let fixture: ComponentFixture<Camara>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Camara],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Camara);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
