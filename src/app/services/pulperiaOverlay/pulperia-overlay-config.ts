import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PulperiaOverlayConfig {
  tipoVista: 'tienda' | 'partida-solo' | 'multijugador' | null;
  datos? : any;
}

@Injectable({
  providedIn: 'root',
})
export class PulperiaUiService {

  private fuenteOverlay = new BehaviorSubject<PulperiaOverlayConfig>({ tipoVista: null});
    estadoOverlay$ = this.fuenteOverlay.asObservable();
  
    abrirOverlay(tipoVista: PulperiaOverlayConfig['tipoVista'], datos?: any){
      this.fuenteOverlay.next({ tipoVista,datos});
    }
  
    cerrarOverlay(){
      this.fuenteOverlay.next({ tipoVista: null});
    }
  
}
