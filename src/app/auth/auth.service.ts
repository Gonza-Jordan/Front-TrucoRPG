import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}

export interface UsuarioInfo {
  nombre: string;
  email:  string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  readonly avatarUrl = signal<string | null>(localStorage.getItem('avatarUrl'));

  setAvatar(url: string | null): void {
    if (url) localStorage.setItem('avatarUrl', url);
    else localStorage.removeItem('avatarUrl');
    this.avatarUrl.set(url);
  }

  constructor(private http: HttpClient) {}

  registrar(data: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, data);
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  obtenerUsuario(): UsuarioInfo | null {
    const token = this.obtenerToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        nombre: payload['name'] ?? payload['unique_name'] ?? '',
        email:  payload['email'] ?? '',
      };
    } catch {
      return null;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }
}
