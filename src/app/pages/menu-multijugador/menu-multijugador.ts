import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';

@Component({
  selector: 'app-menu-multijugador',
  imports: [RouterLink, ConnectionStatusComponent],
  templateUrl: './menu-multijugador.html',
  styleUrl: './menu-multijugador.css',
})
export class MenuMultijugador {

}
