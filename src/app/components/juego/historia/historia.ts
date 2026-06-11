import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeleccionPersonajeHistoria } from '../../../pages/seleccion-personaje-historia/seleccion-personaje-historia';
import { HistoriaService } from '../../../services/historia/historia-service';
import { HistoriaOverlayManagerComponent } from '../../historia-overlay-manager-component/historia-overlay-manager-component/historia-overlay-manager-component';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule, SeleccionPersonajeHistoria, HistoriaOverlayManagerComponent],
  templateUrl: './historia.html',
  styleUrl: './historia.css',
})
export class Historia implements OnDestroy {
  vistaActual: 'seleccion-heroe' | 'en-juego' = 'seleccion-heroe';

  constructor(private historiaService: HistoriaService) {}

  alConfirmarHeroe(evento: { heroeId: number; habilidad: string }): void {
    this.historiaService.setHeroeSeleccionado(evento.heroeId);

    this.historiaService.setHabilidadSeleccionada(evento.habilidad);

    this.vistaActual = 'en-juego';

    setTimeout(() => {
      this.historiaService.iniciarJuego('historia-container');
    }, 0);
  }

  ngOnDestroy(): void {
    this.historiaService.destruirJuego();
  }
}
