import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-multijugador',
  imports: [Header,Footer,RouterLink],
  templateUrl: './menu-multijugador.html',
  styleUrl: './menu-multijugador.css',
})
export class MenuMultijugador {

}
