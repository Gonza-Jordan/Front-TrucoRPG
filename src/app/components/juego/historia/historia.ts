import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeleccionPersonaje } from '../../../pages/seleccion-personaje/seleccion-personaje';
import { HistoriaService } from '../../../services/historia/historia-service';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule, SeleccionPersonaje],
  templateUrl: './historia.html',
  styleUrl: './historia.css',
})
export class Historia implements OnDestroy {
  vistaActual: 'seleccion-heroe' | 'en-juego' = 'seleccion-heroe';

  constructor(private historiaService: HistoriaService) {}

  alConfirmarHeroe(idHeroe: number): void {
    this.historiaService.setHeroeSeleccionado(idHeroe);
    
    this.vistaActual = 'en-juego';
    
    setTimeout(() => {
      this.historiaService.iniciarJuego('historia-container');
    }, 0);
  }

  ngOnDestroy(): void {
    this.historiaService.destruirJuego();
  }
}