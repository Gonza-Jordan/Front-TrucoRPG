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
  vistaActual: 'menu-principal' | 'seleccion-heroe' | 'seleccion-modo-tradicional' = 'menu-principal';

  jugarTradicional(modo: '1v1' | '2v2' | '3v3'): void {
    localStorage.removeItem('heroeId');
    if (modo === '2v2') {
      this.router.navigate(['/jugar/solitario-2v2']);
    } else if (modo === '3v3') {
      this.router.navigate(['/jugar/solitario-3v3']);
    } else {
      this.router.navigate(['/jugar/solitario']);
    }
  }

  alConfirmarHeroe(idHeroe: number): void {
    localStorage.setItem('heroeId', idHeroe.toString());
    this.router.navigate(['/jugar/solitario']);
  }
}