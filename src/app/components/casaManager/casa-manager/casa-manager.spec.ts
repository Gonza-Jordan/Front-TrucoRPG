import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasaManager } from './casa-manager';

describe('CasaManager', () => {
  let component: CasaManager;
  let fixture: ComponentFixture<CasaManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasaManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasaManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
