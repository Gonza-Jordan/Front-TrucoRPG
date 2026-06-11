import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { GameUiService } from '../../../services/historia-overlay/overlay-config';
import { TiendaOverlayComponent } from '../../overlays/tienda-overlay/tienda-overlay';
import { InventarioOverlay } from '../../overlays/inventario-overlay/inventario-overlay';
import { LogrosOverlay } from '../../overlays/logros-overlay/logros-overlay';
import { ArmarioOverlay } from '../../overlays/armario-overlay/armario-overlay';

@Component({
  selector: 'app-historia-overlay-manager',
  standalone: true,
  imports: [TiendaOverlayComponent, InventarioOverlay, LogrosOverlay, ArmarioOverlay], 
  templateUrl: './historia-overlay-manager-component.html',
  styleUrls: ['./historia-overlay-manager-component.css']
})
export class HistoriaOverlayManagerComponent implements OnInit {
  vistaActiva: any = null;
  datosRecibidos: any = null;

  constructor(private uiService: GameUiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.uiService.overlayState$.subscribe(config => {
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