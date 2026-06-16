import { Component,OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { GameUiService } from '../../../services/casaOverlay/casa-overlay-config';
import { InventarioOverlay } from '../../overlays/inventario-overlay/inventario-overlay';
import { LogrosOverlay } from '../../overlays/logros-overlay/logros-overlay';
import { ArmarioOverlay } from '../../overlays/armario-overlay/armario-overlay';

@Component({
  selector: 'app-casa-manager',
  standalone: true,
  imports: [InventarioOverlay, LogrosOverlay, ArmarioOverlay],
  templateUrl: './casa-manager.html',
  styleUrl: './casa-manager.css',
})
export class CasaManager implements OnInit{
  vistaActiva: any = null;
  datosRecibidos: any = null;

  constructor(private uiService: GameUiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.uiService.estadoOverlay$.subscribe(config => {
      this.vistaActiva = config.tipoVista;
      this.datosRecibidos = config.datos;
      this.cdr.detectChanges();
    });
  }

  @HostListener('window:game-interact', ['$event'])
  onGameInteract(event: Event) {
    const customEvent = event as CustomEvent;
    this.uiService.abrirOverlay(customEvent.detail.vista, customEvent.detail.datos);
  }

  cerrar() {
    this.uiService.cerrarOverlay();
    window.dispatchEvent(new CustomEvent('resume-game'));
  }

}
