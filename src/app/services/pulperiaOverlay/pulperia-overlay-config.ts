import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PulperiaOverlayConfig {
  tipoVista: 'tienda' | 'partida-solo' | 'multijugador' | null;
  subVista?: 'menu' | 'tipo' | 'tradicional' | 'sala' | null;
  datos?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PulperiaUiService {
  private fuenteOverlay = new BehaviorSubject<PulperiaOverlayConfig>({ tipoVista: null, subVista: null });
  estadoOverlay$ = this.fuenteOverlay.asObservable();

  // Cambiamos el nombre para que sea ultra claro y seguro
  get esFlujoPhaser(): boolean {
    return this.fuenteOverlay.value.tipoVista !== null;
  }

  // Getter específico para saber si el flujo actual de Phaser es el multijugador
  get esMultijugadorPhaser(): boolean {
    return this.fuenteOverlay.value.tipoVista === 'multijugador';
  }

  abrirOverlay(tipoVista: PulperiaOverlayConfig['tipoVista'], subVista: PulperiaOverlayConfig['subVista'] = 'menu', datos?: any) {
    this.fuenteOverlay.next({ tipoVista, subVista, datos });
  }

  cambiarSubVista(subVista: PulperiaOverlayConfig['subVista'], nuevosDatos?: any) {
    const estadoActual = this.fuenteOverlay.value;
    this.fuenteOverlay.next({
      ...estadoActual,
      subVista,
      datos: { ...estadoActual.datos, ...nuevosDatos }
    });
  }

  cerrarOverlay() {
    this.fuenteOverlay.next({ tipoVista: null, subVista: null });
  }
}