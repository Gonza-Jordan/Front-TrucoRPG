import { Component, OnInit } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-multijugador-tradicional-sala',
  imports: [Header,Footer,RouterLink],
  templateUrl: './menu-multijugador-tradicional-sala.html',
  styleUrl: './menu-multijugador-tradicional-sala.css',
})
export class MenuMultijugadorTradicionalSala implements OnInit {
  codigoSala = '';

  ngOnInit() {
    this.obtenerCodigoSalaMock();
  }

  obtenerCodigoSalaMock() {
    // Mock de backend: código de sala aleatorio para compartir con amigos.
    this.codigoSala = this.generarCodigoSala();
  }

  generarCodigoSala(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  copiarCodigo() {
    if (!this.codigoSala) return;
    navigator.clipboard.writeText(this.codigoSala).catch(() => {
      console.warn('No se pudo copiar el código al portapapeles');
    });
  }
}
