import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-menu-multijugador',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './menu-multijugador.html',
  styleUrl: './menu-multijugador.css',
})
export class MenuMultijugador {}
