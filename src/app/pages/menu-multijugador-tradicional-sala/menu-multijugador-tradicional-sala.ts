import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';
import { SalaService } from '../../services/sala.service';
import { PulperiaUiService } from '../../services/pulperiaOverlay/pulperia-overlay-config';

@Component({
  selector: 'app-menu-multijugador-tradicional-sala',
  standalone: true,
  imports: [CommonModule, ConnectionStatusComponent],
  templateUrl: './menu-multijugador-tradicional-sala.html',
  styleUrl: './menu-multijugador-tradicional-sala.css',
})
export class MenuMultijugadorTradicionalSala implements OnInit, OnDestroy {
  mode: 'crear' | 'unirse' = 'crear';
  gameMode: '1v1' | '2v2' | '3v3' = '1v1';
  publica = false;
  codigoSala = '';
  copiado = false;
  qrUrl = '';

  salaLista = false;
  miListo = false;

  jugadoresEnSala = 0;
  get maxJugadores(): number {
    return this.gameMode === '3v3' ? 6 : this.gameMode === '2v2' ? 4 : 2;
  }
  get esPorEquipos(): boolean {
    return this.gameMode === '2v2' || this.gameMode === '3v3';
  }

  errorMsg = '';
  cargandoConexion = true;

  private subs: Subscription[] = [];

  constructor(
    public sala: SalaService,
    private router: Router,
    private route: ActivatedRoute,
    private uiService: PulperiaUiService,
  ) {}

  async ngOnInit() {
    if (this.uiService.esMultijugadorPhaser) {
      this.subs.push(
        this.uiService.estadoOverlay$.subscribe((config) => {
          if (config && config.datos) {
            this.mode = config.datos.mode ?? 'crear';
            this.gameMode = config.datos.gameMode ?? '1v1';
            this.publica = config.datos.publica === true;
          }
        }),
      );
    } else {
      this.mode = (this.route.snapshot.queryParamMap.get('mode') as any) ?? 'crear';
      this.gameMode = (this.route.snapshot.queryParamMap.get('gameMode') as any) ?? '1v1';
      this.publica = this.route.snapshot.queryParamMap.get('publica') === 'true';
    }

    if (this.esPorEquipos && this.mode === 'crear') {
      this.jugadoresEnSala = 1;
    }

    this.subs.push(
      this.sala.codigoSala$.subscribe((c) => {
        this.codigoSala = c;
        if (c) this.actualizarQr(c);
      }),

      this.sala.salaLista$.subscribe((v) => (this.salaLista = v)),
      this.sala.miListo$.subscribe((v) => (this.miListo = v)),

      this.sala.lobbyActualizado$.subscribe((data) => {
        if (data) this.jugadoresEnSala = data.jugadoresEnSala;
      }),

      this.sala.salaCompleta$.subscribe((completa) => {
        if (completa) {
          setTimeout(() => {
            if (this.uiService.esMultijugadorPhaser) {
              this.uiService.cambiarSubVista('sala');
            } else {
              this.router.navigate(['/menu-2v2-equipos'], {
                queryParams: { gameMode: this.gameMode },
              });
            }
          }, 600);
        }
      }),

      this.sala.juegoIniciado$.subscribe((v) => {
        if (v) {
          if (this.uiService.esMultijugadorPhaser) {
            this.uiService.cerrarOverlay();
            window.dispatchEvent(new CustomEvent('start-multiplayer-match'));
          } else {
            this.router.navigate(['/juego/multi']);
          }
        }
      }),

      this.sala.jugadorDesconectado$.subscribe((v) => {
        if (v) {
          this.errorMsg = 'Un jugador se desconectó.';
          this.salaLista = false;
          this.miListo = false;
          this.jugadoresEnSala = Math.max(0, this.jugadoresEnSala - 1);
        }
      }),
    );

    if (this.mode === 'crear') {
      try {
        await this.sala.conectar();
        await this.sala.crearSala(this.gameMode, this.publica);
      } catch {
        this.errorMsg = 'No se pudo conectar al servidor.';
      }
    }

    if (this.esPorEquipos && this.sala.salaCompleta$.value) {
      if (!this.uiService.esMultijugadorPhaser) {
        this.router.navigate(['/menu-2v2-equipos'], { queryParams: { gameMode: this.gameMode } });
      }
    }

    this.cargandoConexion = false;
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private actualizarQr(codigo: string): void {
    const joinUrl = `${window.location.origin}/unirse?code=${codigo}&mode=${this.gameMode}`;
    const encoded = encodeURIComponent(joinUrl);
    this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=c89030&bgcolor=0e0c08&data=${encoded}`;
  }

  get slotsLobby(): { lleno: boolean }[] {
    const slots = [];
    for (let i = 0; i < this.maxJugadores; i++) {
      slots.push({ lleno: i < this.jugadoresEnSala });
    }
    return slots;
  }

  async copiarCodigo() {
    if (!this.codigoSala) return;
    await navigator.clipboard.writeText(this.codigoSala).catch(() => {});
    this.copiado = true;
    setTimeout(() => (this.copiado = false), 2000);
  }

  async comenzar() {
    if (this.miListo) return;
    try {
      await this.sala.listoParaJugar();
    } catch {
      this.errorMsg = 'Error al comunicarse con el servidor.';
    }
  }

  async abandonar() {
    await this.sala.abandonar();
    if (this.uiService.esMultijugadorPhaser) {
      this.uiService.cambiarSubVista('tradicional');
    } else {
      this.router.navigate(['/menu-multijugador-tradicional'], {
        queryParams: { gameMode: this.gameMode },
      });
    }
  }
}
