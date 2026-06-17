import { Component, OnDestroy, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common'; // Importamos DOCUMENT
import { SeleccionPersonajeHistoria } from '../../../pages/seleccion-personaje-historia/seleccion-personaje-historia';
import { HistoriaService } from '../../../services/historia/historia-service';
import { TrucoSoloComponent } from '../../../../game/truco-solo/truco-solo.component';
import { CasaManager } from '../../casaManager/casa-manager/casa-manager';
import { PulperiaManager } from '../../pulperiaManager/pulperia-manager/pulperia-manager';


@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule, SeleccionPersonajeHistoria, TrucoSoloComponent,CasaManager,PulperiaManager],
  templateUrl: './historia.html',
  styleUrl: './historia.css',
})
export class Historia implements OnInit, OnDestroy {
  vistaActual: 'seleccion-heroe' | 'en-juego' = 'seleccion-heroe';
  mostrarTrucoSolo = false;

  constructor(
    private historiaService: HistoriaService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    window.addEventListener('truco-solo:start', this.abrirMesaTruco);
    window.addEventListener('truco-solo:end', this.cerrarMesaTruco);
  }

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

  abrirMesaTruco = (): void => {
    this.mostrarTrucoSolo = true;
    this.historiaService.pausarEscena('MapaAventura1');
  };

  cerrarMesaTruco = (): void => {
    this.mostrarTrucoSolo = false;
    this.historiaService.reanudarEscena('MapaAventura1');
  };

  ngOnDestroy(): void {
    window.removeEventListener('truco-solo:start', this.abrirMesaTruco);
    window.removeEventListener('truco-solo:end', this.cerrarMesaTruco);
    localStorage.removeItem('historiaPartida');
    localStorage.removeItem('rivalNivel');
    this.historiaService.destruirJuego();
    this.document.body.classList.remove('modo-phaser-mobile');
  }
}
