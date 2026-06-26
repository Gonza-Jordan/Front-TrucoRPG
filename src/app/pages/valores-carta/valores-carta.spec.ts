import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValoresCarta } from './valores-carta';
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ValoresCarta', () => {
  let component: ValoresCarta;
  let fixture: ComponentFixture<ValoresCarta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValoresCarta],
      providers: [provideHttpClient(), provideHttpClientTesting()]
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
