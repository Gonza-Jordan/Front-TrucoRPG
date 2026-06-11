import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OverlayConfig {
  tipoVista: 'tienda' | 'inventario' | 'logros' | 'armario' | null;
  datos?: any;
}

@Injectable({
  providedIn: 'root'
})
export class GameUiService {
  private overlaySource = new BehaviorSubject<OverlayConfig>({ tipoVista: null });
  overlayState$ = this.overlaySource.asObservable();

  abrirOverlay(tipoVista: OverlayConfig['tipoVista'], datos?: any) {
    this.overlaySource.next({ tipoVista, datos });
  }

  cerrarOverlay() {
    this.overlaySource.next({ tipoVista: null });
  }
}