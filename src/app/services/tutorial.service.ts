import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reglas } from '../interfaces/reglas';
import { Cartas } from '../interfaces/cartas';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  private http = inject(HttpClient);

  obtenerReglas(): Observable<Reglas[]> {
    return this.http.get<Reglas[]>(
      `${environment.apiUrl}/api/Tutorial/generales`
    );
  }

  obtenerCartas(): Observable<Cartas[]> {
    return this.http.get<Cartas[]>(
      `${environment.apiUrl}/api/Tutorial/cartas`
    );
  }
}