import { Component, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common'; // Importamos DOCUMENT
import { SeleccionPersonajeHistoria } from '../../../pages/seleccion-personaje-historia/seleccion-personaje-historia';
import { HistoriaService } from '../../../services/historia/historia-service';
import { CasaManager } from '../../casaManager/casa-manager/casa-manager';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule, SeleccionPersonajeHistoria, CasaManager],
  templateUrl: './historia.html',
  styleUrl: './historia.css',
})
export class Historia implements OnDestroy {
  vistaActual: 'seleccion-heroe' | 'en-juego' = 'seleccion-heroe';

  constructor(
    private historiaService: HistoriaService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  alConfirmarHeroe(evento: { heroeId: number; habilidad: string }): void {
    this.historiaService.setHeroeSeleccionado(evento.heroeId);
    this.historiaService.setHabilidadSeleccionada(evento.habilidad);

    this.vistaActual = 'en-juego';

    this.document.body.classList.add('modo-phaser-mobile');

    setTimeout(() => {
      this.historiaService.iniciarJuego('historia-container');

      window.dispatchEvent(new Event('resize'));
    }, 50);
  }

  ngOnDestroy(): void {
    this.historiaService.destruirJuego();
    this.document.body.classList.remove('modo-phaser-mobile');
  }
}
