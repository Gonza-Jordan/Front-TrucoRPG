import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidaSolo } from './partida-solo';

describe('PartidaSolo', () => {
  let component: PartidaSolo;
  let fixture: ComponentFixture<PartidaSolo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartidaSolo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartidaSolo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
