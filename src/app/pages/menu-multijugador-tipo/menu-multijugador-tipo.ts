import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';

@Component({
  selector: 'app-menu-multijugador-tipo',
  imports: [RouterLink, ConnectionStatusComponent],
  templateUrl: './menu-multijugador-tipo.html',
  styleUrl: './menu-multijugador-tipo.css',
})
export class MenuMultijugadorTipo {
  constructor(private router: Router) {}

  seleccionarModo(modo: '1v1' | '2v2' | '3v3'): void {
    this.router.navigate(['/menu-multijugador-tradicional'], {
      queryParams: { gameMode: modo },
    });
  }
}
