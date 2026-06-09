import {
  Component, OnInit, OnDestroy,
  ChangeDetectorRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SalaService } from '../../app/services/sala.service';

// ── Tipos del backend (payload personalizado de TrucoEstado3v3) ──────────────
export interface Carta3v3 { numero: number; palo: string; valorTruco?: number; }

interface Vuelta3v3 {
  cartasJugadas: Record<string, Carta3v3>;
  ganadorVuelta: string | null;
}

/** Estado compartido (camelCase) que viaja dentro de cada mensaje personalizado. */
interface Estado3v3 {
  numeroDeMano: number;
  turnoActual: string;       // 'J1'..'J6'
  jugadorMano: string;
  equipoMano: string;
  ganadorMano: string | null;
  manoTerminada: boolean;
  partidaTerminada: boolean;
  ganadorPartida: string | null;
  puntosEquipoA: number;
  puntosEquipoB: number;
  estadoEnvido: string | null;
  estadoTruco: string | null;
  vueltas: Vuelta3v3[];
  vueltaActual: Vuelta3v3 | null;
}

/** Mensaje personalizado que cada jugador recibe (solo ve sus cartas). */
interface Msg3v3 {
  miRol: string;              // 'J1'..'J6' → asiento propio
  miEquipo: string;           // 'EquipoA' | 'EquipoB'
  misCartas: Carta3v3[];
  misJugadas: Carta3v3[];
  cartasCompaneros: Record<string, Carta3v3[]>;
  estado: Estado3v3;
}

interface AsientoRival {
  rol: string;
  nombre: string;
  equipo: 'nosotros' | 'ellos';
  cartasEnMano: number;
}

@Component({
  selector: 'app-truco-3v3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './truco-3v3.component.html',
  styleUrls: [
    '../truco-solo/truco-solo.component.css',
    '../truco-2v2/truco-2v2.component.css',
    './truco-3v3.component.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Truco3v3Component implements OnInit, OnDestroy {

  // ── Estado ────────────────────────────────────────────────────
  msg: Msg3v3 | null = null;
  get estado(): Estado3v3 | null { return this.msg?.estado ?? null; }
  get miRol(): string { return this.msg?.miRol ?? 'J1'; }
  get miEquipo(): string { return this.msg?.miEquipo ?? 'EquipoA'; }

  // ── Asiento propio (abajo) ────────────────────────────────────
  yoNombre = 'VOS';
  get misCartas(): Carta3v3[] { return this.msg?.misCartas ?? []; }

  readonly fanAngles = [-14, 0, 14];
  readonly fanXOff   = [-22, 0, 22];

  // ── Asientos relativos (se recalculan con cada estado) ────────
  // frente = +3, derecha (arriba→abajo) = [+2, +1], izquierda (arriba→abajo) = [+4, +5]
  frente: AsientoRival    = this.placeholder('J4');
  izquierda: AsientoRival[] = [this.placeholder('J5'), this.placeholder('J3')];
  derecha: AsientoRival[]   = [this.placeholder('J6'), this.placeholder('J2')];

  // ── Marcador / textos ─────────────────────────────────────────
  puntosNosotros = 0;
  puntosEllos    = 0;
  estadoEnvido = 'No se cantó.';
  estadoTruco  = 'No se cantó.';
  turnoBadge   = 'Esperando inicio de partida...';

  mostrarConfirmSalir = false;
  toastMsg = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private subs: Subscription[] = [];

  constructor(
    private sala: SalaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.sala.trucoEstado3v3$.subscribe(data => {
        if (data) this.onEstado(data as Msg3v3);
      }),
      this.sala.jugadorDesconectado$.subscribe(v => {
        if (v) this.showToast('Un jugador se desconectó de la partida.');
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Procesar estado entrante ──────────────────────────────────
  private onEstado(msg: Msg3v3): void {
    this.msg = msg;
    const e = msg.estado;

    this.frente    = this.armarAsiento(this.rolAsiento(3));
    this.derecha   = [this.armarAsiento(this.rolAsiento(2)), this.armarAsiento(this.rolAsiento(1))];
    this.izquierda = [this.armarAsiento(this.rolAsiento(4)), this.armarAsiento(this.rolAsiento(5))];

    this.puntosNosotros = this.miEquipo === 'EquipoA' ? e.puntosEquipoA : e.puntosEquipoB;
    this.puntosEllos    = this.miEquipo === 'EquipoA' ? e.puntosEquipoB : e.puntosEquipoA;
    this.estadoEnvido   = e.estadoEnvido ?? 'No se cantó.';
    this.estadoTruco    = e.estadoTruco  ?? 'No se cantó.';
    this.turnoBadge     = this.calcularTurnoBadge(e);

    this.cdr.markForCheck();
  }

  // ── Mapeo de asientos relativos a miRol ───────────────────────
  // Offset 0 = yo (abajo); +1..+5 girando horario (a la derecha).
  private rolAsiento(offset: number): string {
    const p = Number(this.miRol.replace('J', '')) || 1; // 1..6
    return 'J' + (((p - 1 + offset) % 6) + 1);
  }

  private armarAsiento(rol: string): AsientoRival {
    const e = this.estado;
    const equipo: 'nosotros' | 'ellos' =
      this.mismoEquipo(rol) ? 'nosotros' : 'ellos';
    let jugadas = 0;
    if (e) {
      const vueltas = [...(e.vueltas ?? [])];
      if (e.vueltaActual) vueltas.push(e.vueltaActual);
      for (const v of vueltas) if (v.cartasJugadas?.[rol]) jugadas++;
    }
    return { rol, nombre: rol, equipo, cartasEnMano: Math.max(0, 3 - jugadas) };
  }

  /** EquipoA = J1/J3/J5 (impares), EquipoB = J2/J4/J6 (pares). */
  private mismoEquipo(rol: string): boolean {
    const n  = Number(rol.replace('J', ''));
    const yo = Number(this.miRol.replace('J', ''));
    return (n % 2) === (yo % 2);
  }

  private calcularTurnoBadge(e: Estado3v3): string {
    if (e.partidaTerminada) return '';
    if (e.manoTerminada) return e.ganadorMano === this.miEquipo ? '¡Ganaron la mano!' : 'Perdieron la mano.';
    if (e.turnoActual === this.miRol) return 'Tu turno (lógica 3v3 próximamente)';
    return `Turno de ${e.turnoActual}...`;
  }

  private placeholder(rol: string): AsientoRival {
    return { rol, nombre: rol, equipo: 'ellos', cartasEnMano: 3 };
  }

  // Helper para dibujar N reversos
  reversos(n: number): number[] { return Array.from({ length: n }, (_, i) => i); }

  // ── Acciones (placeholder hasta tener la lógica 3v3) ──────────
  jugarCarta(_carta: Carta3v3): void {
    this.showToast('La lógica de juego 3v3 todavía no está disponible.');
  }

  // ── Imagen de carta ───────────────────────────────────────────
  cardImg(c: Carta3v3): string {
    const nums: Record<number, number> = { 1:1,2:2,3:3,4:4,5:5,6:6,7:7,10:8,11:9,12:10 };
    const palos: Record<string, number> = { Oro:0, Copa:10, Espada:20, Basto:30 };
    return `assets/cards/${(palos[c.palo] ?? 0) + (nums[c.numero] ?? 1)}.PNG`;
  }

  // ── Salir ─────────────────────────────────────────────────────
  salirPartida():  void { this.mostrarConfirmSalir = true; }
  cancelarSalir(): void { this.mostrarConfirmSalir = false; }
  async confirmarSalir(): Promise<void> {
    this.mostrarConfirmSalir = false;
    await this.sala.abandonar();
    this.router.navigate(['/home']);
  }

  private showToast(msg: string): void {
    this.toastMsg = msg;
    this.cdr.markForCheck();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMsg = ''; this.cdr.markForCheck(); }, 4000);
  }
}
