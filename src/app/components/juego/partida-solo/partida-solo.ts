import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SeleccionPersonaje } from '../../../pages/seleccion-personaje/seleccion-personaje';

@Component({
  selector: 'app-partida-solo',
  standalone: true,
  imports: [CommonModule, SeleccionPersonaje,RouterLink],
  templateUrl: './partida-solo.html',
  styleUrl: './partida-solo.css'
})
export class PartidaSoloComponent {
  private router = inject(Router);
  vistaActual: 'menu-principal' | 'seleccion-heroe' = 'menu-principal';

  jugarTradicional(): void {
    localStorage.removeItem('heroeId');
    this.router.navigate(['/jugar/solitario']);
  }

  alConfirmarHeroe(idHeroe: number): void {
    localStorage.setItem('heroeId', idHeroe.toString());
    this.router.navigate(['/jugar/solitario']);
  }
}