import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CasaOverlayConfig {
  tipoVista: 'inventario' | 'logros' | 'armario' | null;
  datos?: any;
}

@Injectable({
  providedIn: 'root',
})
export class GameUiService {

  private fuenteOverlay = new BehaviorSubject<CasaOverlayConfig>({ tipoVista: null});
  estadoOverlay$ = this.fuenteOverlay.asObservable();

  abrirOverlay(tipoVista: CasaOverlayConfig['tipoVista'], datos?: any){
    this.fuenteOverlay.next({ tipoVista,datos});
  }

  cerrarOverlay(){
    this.fuenteOverlay.next({ tipoVista: null});
  }
  
}
