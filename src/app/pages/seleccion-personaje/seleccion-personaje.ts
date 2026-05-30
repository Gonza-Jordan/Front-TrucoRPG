import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HEROES } from '../../../game/data/heroes';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-seleccion-personaje',
  standalone: true,
  imports: [CommonModule, Header,Footer],
  templateUrl: './seleccion-personaje.html',
  styleUrl: './seleccion-personaje.css',
})
export class SeleccionPersonaje {
  heroes = HEROES; 

  selectedHeroId: number | null = null;

  seleccionarHeroe(id: number) {
    this.selectedHeroId = id;
  }
}
