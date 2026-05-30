import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HEROES } from '../../../game/data/heroes';

@Component({
  selector: 'app-seleccion-personaje',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccion-personaje.html',
  styleUrl: './seleccion-personaje.css',
})
export class SeleccionPersonaje {
  heroes = HEROES; 
  
  selectedHeroId: number | null = null;

  @Output() heroeConfirmado = new EventEmitter<number>();

  seleccionarHeroe(id: number): void {
    this.selectedHeroId = id;
  }

  enviarConfirmacion(): void {
    if (this.selectedHeroId !== null) {
      this.heroeConfirmado.emit(this.selectedHeroId);
    }
  }
}