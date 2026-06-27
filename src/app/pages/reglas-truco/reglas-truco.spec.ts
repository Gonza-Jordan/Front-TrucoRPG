import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglasTruco } from './reglas-truco';

describe('ReglasTruco', () => {
  let component: ReglasTruco;
  let fixture: ComponentFixture<ReglasTruco>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglasTruco]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglasTruco);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
