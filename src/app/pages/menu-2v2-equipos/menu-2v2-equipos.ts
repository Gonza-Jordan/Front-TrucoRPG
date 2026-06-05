import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';
import { SalaService, EstadoEquipos, LobbyListos } from '../../services/sala.service';

interface Slot {
  posicion: number;
  ocupado: boolean;
  esYo: boolean;
}

@Component({
  selector: 'app-menu-2v2-equipos',
  standalone: true,
  imports: [CommonModule, ConnectionStatusComponent],
  templateUrl: './menu-2v2-equipos.html',
  styleUrl: './menu-2v2-equipos.css',
})
export class Menu2v2EquiposComponent implements OnInit, OnDestroy {
  estadoEquipos: EstadoEquipos | null = null;
  lobbyListos: LobbyListos | null = null;
  miEquipo: string | null = null;
  miListo = false;
  errorMsg = '';

  slotsSanMartin: Slot[] = [
    { posicion: 0, ocupado: false, esYo: false },
    { posicion: 0, ocupado: false, esYo: false },
  ];
  slotsBelgrano: Slot[] = [
    { posicion: 0, ocupado: false, esYo: false },
    { posicion: 0, ocupado: false, esYo: false },
  ];

  private subs: Subscription[] = [];

  constructor(private sala: SalaService, private router: Router) {}

  ngOnInit(): void {
    // Si no hay conexión (acceso directo a la URL), volver al menú
    if (!this.sala.codigoSala$.value) {
      this.router.navigate(['/menu-multijugador-tipo']);
      return;
    }

    this.subs.push(
      this.sala.estadoEquipos$.subscribe(estado => {
        if (!estado) return;
        this.estadoEquipos = estado;
        this.actualizarSlots(estado);
      }),

      this.sala.lobbyListos$.subscribe(ll => {
        this.lobbyListos = ll;
      }),

      this.sala.miListo$.subscribe(v => (this.miListo = v)),

      this.sala.juegoIniciado$.subscribe(v => {
        if (v) this.router.navigate(['/juego/2v2-multi']);
      }),

      this.sala.jugadorDesconectado$.subscribe(v => {
        if (v) {
          this.errorMsg = 'Un jugador se desconectó de la sala.';
          this.miListo = false;
          this.sala.miListo$.next(false);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private actualizarSlots(estado: EstadoEquipos): void {
    const miPosicion = estado.miPosicion;

    // Reconstruir slots por equipo
    const jugadoresSanMartin = estado.jugadores.filter(j => j.equipo === 'sanMartin');
    const jugadoresBelgrano  = estado.jugadores.filter(j => j.equipo === 'belgrano');

    this.slotsSanMartin = this.construirSlots(jugadoresSanMartin, miPosicion);
    this.slotsBelgrano  = this.construirSlots(jugadoresBelgrano, miPosicion);

    // Actualizar mi equipo
    const yo = estado.jugadores.find(j => j.posicion === miPosicion);
    this.miEquipo = yo?.equipo ?? null;
  }

  private construirSlots(jugadores: { posicion: number; equipo: string | null }[], miPosicion: number): Slot[] {
    const slots: Slot[] = [
      { posicion: 0, ocupado: false, esYo: false },
      { posicion: 0, ocupado: false, esYo: false },
    ];
    jugadores.forEach((j, idx) => {
      if (idx < 2) {
        slots[idx] = {
          posicion: j.posicion,
          ocupado: true,
          esYo: j.posicion === miPosicion,
        };
      }
    });
    return slots;
  }

  /** Devuelve true si el botón del equipo debe estar deshabilitado */
  equipoDeshabilitado(equipo: string): boolean {
    if (this.miListo) return true;
    if (this.miEquipo === equipo) return false; // ya estoy en él → siempre habilitado para mostrar estado
    const count = equipo === 'sanMartin'
      ? (this.estadoEquipos?.countSanMartin ?? 0)
      : (this.estadoEquipos?.countBelgrano ?? 0);
    return count >= 2;
  }

  async elegirEquipo(equipo: string): Promise<void> {
    if (this.miListo) return;
    if (this.equipoDeshabilitado(equipo) && this.miEquipo !== equipo) {
      this.errorMsg = equipo === 'sanMartin'
        ? 'El Equipo San Martín ya está completo.'
        : 'El Equipo Belgrano ya está completo.';
      setTimeout(() => (this.errorMsg = ''), 2500);
      return;
    }
    try {
      await this.sala.elegirEquipo(equipo as 'sanMartin' | 'belgrano');
      this.errorMsg = '';
    } catch {
      this.errorMsg = 'Error al comunicarse con el servidor.';
    }
  }

  async comenzar(): Promise<void> {
    if (this.miListo) return;
    if (!this.estadoEquipos?.equiposListos) {
      this.errorMsg = 'Los equipos deben estar completos (2 vs 2).';
      return;
    }
    if (!this.miEquipo) {
      this.errorMsg = 'Debés elegir un equipo primero.';
      return;
    }
    try {
      await this.sala.listoParaJugar();
      this.errorMsg = '';
    } catch {
      this.errorMsg = 'Error al comunicarse con el servidor.';
    }
  }

  async abandonar(): Promise<void> {
    await this.sala.abandonar();
    this.router.navigate(['/menu-multijugador-tipo']);
  }
}
