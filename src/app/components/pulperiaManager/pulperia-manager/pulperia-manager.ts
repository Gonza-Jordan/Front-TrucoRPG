import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { GameUiService } from '../../../services/pulperiaOverlay/pulperia-overlay-config';
import { MenuMultijugador } from '../../../pages/menu-multijugador/menu-multijugador';
import { TiendaOverlayComponent } from '../../overlays/tienda-overlay/tienda-overlay';
import { PartidaSoloComponent } from '../../juego/partida-solo/partida-solo';

@Component({
  selector: 'app-pulperia-manager',
  imports: [MenuMultijugador,PartidaSoloComponent,TiendaOverlayComponent],
  templateUrl: './pulperia-manager.html',
  styleUrl: './pulperia-manager.css',
})
export class PulperiaManager implements OnInit {
  vistaActiva: any = null;
  datosRecibidos: any = null;

  constructor(
    private uiService: GameUiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.uiService.estadoOverlay$.subscribe((config) => {
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
