import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reglas } from '../interfaces/reglas';
import { Cartas } from '../interfaces/cartas';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  private http = inject(HttpClient);

  obtenerReglas(): Observable<Reglas[]> {
    return this.http.get<Reglas[]>(
      'http://localhost:5001/api/Tutorial/generales'
    );
  }

  obtenerCartas(): Observable<Cartas[]> {
    return this.http.get<Cartas[]>(
      'http://localhost:5001/api/Tutorial/cartas'
    );
  }
}