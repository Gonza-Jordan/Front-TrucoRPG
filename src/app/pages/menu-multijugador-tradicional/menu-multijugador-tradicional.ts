import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner';
import { SalaService, SalaPublicaInfo } from '../../services/sala.service';

@Component({
  selector: 'app-menu-multijugador-tradicional',
  imports: [CommonModule, RouterLink, ConnectionStatusComponent, QrScannerComponent, FormsModule],
  templateUrl: './menu-multijugador-tradicional.html',
  styleUrl: './menu-multijugador-tradicional.css',
})
export class MenuMultijugadorTradicional implements OnInit {
  modalAbierto = false;
  escanerAbierto = false;
  codigoIngresado = '';
  errorUnirse = '';
  cargando = false;
  gameMode: '1v1' | '2v2' | '3v3' = '1v1';

  // ── Crear sala (modal con opción pública) ──────────────────────
  modalCrearAbierto = false;
  salaPublica = false;

  // ── Buscar partida (salas públicas) ────────────────────────────
  modalBuscarAbierto = false;
  salasPublicas: SalaPublicaInfo[] = [];
  cargandoBuscar = false;
  errorBuscar = '';

  constructor(private sala: SalaService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.gameMode = (this.route.snapshot.queryParamMap.get('gameMode') as any) ?? '1v1';
  }

  // ── Crear sala ─────────────────────────────────────────────────
  abrirModalCrear() {
    this.salaPublica = false;
    this.modalCrearAbierto = true;
  }

  cerrarModalCrear() {
    this.modalCrearAbierto = false;
  }

  confirmarCrear() {
    this.modalCrearAbierto = false;
    this.router.navigate(['/menu-multijugador-tradicional-sala'], {
      queryParams: { mode: 'crear', gameMode: this.gameMode, publica: this.salaPublica },
    });
  }

  // ── Buscar partida ─────────────────────────────────────────────
  async abrirModalBuscar() {
    this.modalBuscarAbierto = true;
    await this.refrescarSalas();
  }

  cerrarModalBuscar() {
    if (this.cargando) return;
    this.modalBuscarAbierto = false;
  }

  async refrescarSalas() {
    this.errorBuscar = '';
    this.cargandoBuscar = true;
    try {
      await this.sala.conectar();
      this.salasPublicas = await this.sala.listarSalasPublicas(this.gameMode);
    } catch {
      this.errorBuscar = 'No se pudieron cargar las salas. Verificá la conexión.';
      this.salasPublicas = [];
    } finally {
      this.cargandoBuscar = false;
    }
  }

  async unirseASalaDisponible(codigo: string) {
    // El modal queda abierto: si falla, mostramos el error y refrescamos la lista;
    // si la unión funciona, unirseConCodigo navega fuera de esta pantalla.
    await this.unirseConCodigo(codigo, () => this.refrescarSalas());
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
    await this.unirseConCodigo(codigo);
  }

  /**
   * Une al jugador a una sala por código (usado tanto por el modal de código como
   * por la lista de salas públicas). Si falla, ejecuta onError (p. ej. refrescar lista).
   */
  private async unirseConCodigo(codigo: string, onError?: () => void) {
    this.errorUnirse = '';
    this.cargando = true;
    try {
      this.sala.reset();
      await this.sala.conectar();
      const ok = await this.sala.unirseASala(codigo);
      if (!ok) {
        this.errorUnirse = 'Sala no encontrada o llena.';
        this.cargando = false;
        if (onError) onError();
        return;
      }
      this.router.navigate(['/menu-multijugador-tradicional-sala'], {
        queryParams: { mode: 'unirse', gameMode: this.gameMode },
      });
    } catch {
      this.errorUnirse = 'Error de conexión. Verificá que el servidor esté activo.';
      this.cargando = false;
      if (onError) onError();
    }
  }
}
