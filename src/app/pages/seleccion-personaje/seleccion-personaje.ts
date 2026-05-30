import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { HEROES } from '../../../game/data/heroes';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-seleccion-personaje',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './seleccion-personaje.html',
  styleUrl: './seleccion-personaje.css',
})
export class SeleccionPersonaje {
  @Input() standalone = true; // false cuando se embebe dentro de otro componente

  heroes = HEROES;
  selectedHeroId: number | null = null;
  readonly esTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  @Output() heroeConfirmado = new EventEmitter<number>();

  constructor(private location: Location) {}

  seleccionarHeroe(id: number): void {
    this.selectedHeroId = id;
  }

  elegirOtro(): void {
    this.selectedHeroId = null;
  }

  enviarConfirmacion(): void {
    if (this.selectedHeroId !== null) {
      this.heroeConfirmado.emit(this.selectedHeroId);
    }
  }

  volver(): void {
    this.location.back();
  }
}