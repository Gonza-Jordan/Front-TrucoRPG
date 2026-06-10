import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obtenerToken();

  // Si tenemos un token guardado, clonamos la petición original y le inyectamos la cabecera
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Es CLAVE que diga 'Bearer ' con el espacio antes del token
      }
    });
  }

  // Dejamós que la petición siga su camino hacia el backend
  return next(req);
};
