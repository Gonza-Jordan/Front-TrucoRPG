import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulperiaManager } from './pulperia-manager';

describe('PulperiaManager', () => {
  let component: PulperiaManager;
  let fixture: ComponentFixture<PulperiaManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PulperiaManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PulperiaManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
