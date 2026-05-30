import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';
import { SalaService } from '../../services/sala.service';

@Component({
  selector: 'app-menu-multijugador-tradicional',
  imports: [Header, Footer, RouterLink, ConnectionStatusComponent, FormsModule],
  templateUrl: './menu-multijugador-tradicional.html',
  styleUrl: './menu-multijugador-tradicional.css',
})
export class MenuMultijugadorTradicional {
  modalAbierto = false;
  codigoIngresado = '';
  errorUnirse = '';
  cargando = false;

  constructor(private sala: SalaService, private router: Router) {}

  abrirModalUnirse() {
    this.codigoIngresado = '';
    this.errorUnirse = '';
    this.modalAbierto = true;
  }

  cerrarModal() {
    if (this.cargando) return;
    this.modalAbierto = false;
  }

  async confirmarUnirse() {
    const codigo = this.codigoIngresado.toUpperCase().trim();
    if (codigo.length < 6) {
      this.errorUnirse = 'El código debe tener 6 caracteres.';
      return;
    }
    this.errorUnirse = '';
    this.cargando = true;
    try {
      this.sala.reset();
      await this.sala.conectar();
      const ok = await this.sala.unirseASala(codigo);
      if (!ok) {
        this.errorUnirse = 'Sala no encontrada o llena.';
        this.cargando = false;
        return;
      }
      this.router.navigate(['/menu-multijugador-tradicional-sala'], {
        queryParams: { mode: 'unirse' },
      });
    } catch {
      this.errorUnirse = 'Error de conexión. Verificá que el servidor esté activo.';
      this.cargando = false;
    }
  }
}
