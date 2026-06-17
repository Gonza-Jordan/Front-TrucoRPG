import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { PulperiaUiService } from '../../../services/pulperiaOverlay/pulperia-overlay-config';
import { MenuMultijugador } from '../../../pages/menu-multijugador/menu-multijugador';
import { TiendaOverlayComponent } from '../../overlays/tienda-overlay/tienda-overlay';
import { PartidaSoloComponent } from '../../juego/partida-solo/partida-solo';

@Component({
  selector: 'app-pulperia-manager',
  standalone: true,
  imports: [MenuMultijugador, PartidaSoloComponent, TiendaOverlayComponent],
  templateUrl: './pulperia-manager.html',
  styleUrl: './pulperia-manager.css',
})
export class PulperiaManager implements OnInit {
  vistaActiva: 'tienda' | 'partida-solo' | 'multijugador' | null = null;
  datosRecibidos: any = null;

  private vistasValidas = ['tienda', 'partida-solo', 'multijugador'];

  constructor(
    private uiService: PulperiaUiService,
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
    const vista = customEvent.detail.vista;

    if (!this.vistasValidas.includes(vista)) {
      return;
    }

    this.uiService.abrirOverlay(
      vista as 'tienda' | 'partida-solo' | 'multijugador',
      customEvent.detail.datos,
    );
  }

  cerrar() {
    this.uiService.cerrarOverlay();
    window.dispatchEvent(new CustomEvent('resume-game'));
  }
}
