import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';

@Component({
  selector: 'app-menu-multijugador-tradicional',
  imports: [Header,Footer,RouterLink,ConnectionStatusComponent],
  templateUrl: './menu-multijugador-tradicional.html',
  styleUrl: './menu-multijugador-tradicional.css',
})
export class MenuMultijugadorTradicional {

}
