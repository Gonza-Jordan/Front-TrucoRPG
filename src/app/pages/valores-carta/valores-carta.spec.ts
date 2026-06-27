import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValoresCarta } from './valores-carta';

describe('ValoresCarta', () => {
  let component: ValoresCarta;
  let fixture: ComponentFixture<ValoresCarta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValoresCarta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValoresCarta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
