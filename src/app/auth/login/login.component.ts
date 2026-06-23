import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Card } from '../../components/card/card';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';

function emailValido(control: AbstractControl): ValidationErrors | null {
  const v: string = (control.value ?? '').trim();
  if (!v) return null; // el required se encarga del vacío
  const ok = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v);
  return ok ? null : { email: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Card, PageWrapper],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  cargando = false;
  errorServidor = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, emailValido]],
      password: ['', Validators.required]
    });

    this.form.valueChanges.subscribe(() => {
      if (this.errorServidor) this.errorServidor = '';
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid || this.cargando) return;

    this.cargando = true;
    this.errorServidor = '';

    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorServidor = err.error?.error ?? 'Email o contraseña incorrectos.';
        this.cargando = false;
      }
    });
  }
}
