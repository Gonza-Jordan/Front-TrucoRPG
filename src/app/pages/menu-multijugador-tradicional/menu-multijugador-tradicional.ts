import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner';
import { SalaService } from '../../services/sala.service';

@Component({
  selector: 'app-menu-multijugador-tradicional',
  imports: [RouterLink, ConnectionStatusComponent, QrScannerComponent, FormsModule],
  templateUrl: './menu-multijugador-tradicional.html',
  styleUrl: './menu-multijugador-tradicional.css',
})
export class MenuMultijugadorTradicional implements OnInit {
  modalAbierto = false;
  escanerAbierto = false;
  codigoIngresado = '';
  errorUnirse = '';
  cargando = false;
  gameMode: '1v1' | '2v2' = '1v1';

  constructor(private sala: SalaService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.gameMode = (this.route.snapshot.queryParamMap.get('gameMode') as any) ?? '1v1';
  }

  abrirModalUnirse() {
    this.codigoIngresado = '';
    this.errorUnirse = '';
    this.modalAbierto = true;
  }

  cerrarModal() {
    if (this.cargando) return;
    this.modalAbierto = false;
  }

  abrirEscanerQr() {
    this.errorUnirse = '';
    this.escanerAbierto = true;
  }

  cerrarEscanerQr() {
    this.escanerAbierto = false;
  }

  /** Recibe el código leído desde el QR e intenta unirse automáticamente. */
  onCodigoQr(codigo: string) {
    this.escanerAbierto = false;
    this.codigoIngresado = (codigo ?? '').toUpperCase().trim();
    if (this.codigoIngresado.length >= 6) {
      this.confirmarUnirse();
    }
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
        queryParams: { mode: 'unirse', gameMode: this.gameMode },
      });
    } catch {
      this.errorUnirse = 'Error de conexión. Verificá que el servidor esté activo.';
      this.cargando = false;
    }
  }
}
