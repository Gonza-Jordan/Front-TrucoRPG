import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogrosOverlay } from './logros-overlay';

describe('LogrosOverlay', () => {
  let component: LogrosOverlay;
  let fixture: ComponentFixture<LogrosOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogrosOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogrosOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
