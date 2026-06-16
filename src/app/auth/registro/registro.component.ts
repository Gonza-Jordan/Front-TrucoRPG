import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Card } from '../../components/card/card';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';

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

function passwordFuerte(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  const errores: ValidationErrors = {};
  if (v.length < 6)           errores['minlength']   = true;
  if (!/[A-Z]/.test(v))      errores['sinMayuscula'] = true;
  if (!/[a-z]/.test(v))      errores['sinMinuscula'] = true;
  if (!/[0-9]/.test(v))      errores['sinNumero']    = true;
  return Object.keys(errores).length ? errores : null;
}

const ERRORES_SERVIDOR: Record<string, string> = {
  'Passwords must have at least one uppercase':  'La contraseña debe tener al menos una mayúscula.',
  'Passwords must have at least one lowercase':  'La contraseña debe tener al menos una minúscula.',
  'Passwords must have at least one digit':      'La contraseña debe tener al menos un número.',
  'Passwords must be at least':                  'La contraseña debe tener al menos 6 caracteres.',
  'Passwords must have at least one non alphanumeric': 'La contraseña debe tener al menos un carácter especial.',
  'Username':                                    'El nombre de usuario ya está en uso.',
  'Email':                                       'El email ya está registrado.',
  'DuplicateUserName':                           'El nombre de usuario ya está en uso.',
  'DuplicateEmail':                              'El email ya está registrado.',
};

function traducirErrorServidor(msg: string): string {
  for (const [clave, traduccion] of Object.entries(ERRORES_SERVIDOR)) {
    if (msg.includes(clave)) return traduccion;
  }
  return 'Error al registrarse. Intentá de nuevo.';
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Card, PageWrapper],
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
      password: ['', [Validators.required, passwordFuerte]],
      confirmarPassword: ['', Validators.required]
    }, { validators: passwordsIguales });
  }

  get userName()          { return this.form.get('userName')!; }
  get email()             { return this.form.get('email')!; }
  get password()          { return this.form.get('password')!; }
  get confirmarPassword() { return this.form.get('confirmarPassword')!; }

  get tieneLongitud()  { return (this.password.value?.length ?? 0) >= 6; }
  get tieneMayuscula() { return /[A-Z]/.test(this.password.value ?? ''); }
  get tieneMinuscula() { return /[a-z]/.test(this.password.value ?? ''); }
  get tieneNumero()    { return /[0-9]/.test(this.password.value ?? ''); }

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
        const raw = err.error?.error ?? err.error?.message ?? '';
        this.errorServidor = raw ? traducirErrorServidor(raw) : 'Error al registrarse. Intentá de nuevo.';
        this.cargando = false;
      }
    });
  }
}
