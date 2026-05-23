import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

function passwordsIguales(control: AbstractControl) {
  const password = control.get('password');
  const confirmar = control.get('confirmarPassword');
  if (password && confirmar && password.value !== confirmar.value) {
    confirmar.setErrors({ noCoinciden: true });
  } else {
    confirmar?.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  form: FormGroup;
  cargando = false;
  errorServidor = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    }, { validators: passwordsIguales });
  }

  get userName() { return this.form.get('userName')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get confirmarPassword() { return this.form.get('confirmarPassword')!; }

  onSubmit(): void {
    if (this.form.invalid || this.cargando) return;

    this.cargando = true;
    this.errorServidor = '';

    const { userName, email, password } = this.form.value;

    this.authService.registrar({ userName, email, password }).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.token);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorServidor = err.error?.error ?? 'Error al registrarse. Intentá de nuevo.';
        this.cargando = false;
      }
    });
  }
}
