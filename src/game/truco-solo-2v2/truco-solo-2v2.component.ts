import {
  Component, OnInit, OnDestroy,
  ChangeDetectorRef, ChangeDetectionStrategy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// ── Tipos del backend ─────────────────────────────────────────────
export interface Carta2v2 { numero: number; palo: string; valorTruco: number; }

interface Jugador2v2 {
  id: string; nombre: string; esMaquina: boolean;
  mano: Carta2v2[]; jugadas: Carta2v2[];
}

interface Vuelta2v2 {
  cartasJugadas: Record<string, Carta2v2>;
  ganadorVuelta: string | null;
  mejorCartaEquipoA: Carta2v2 | null;
  mejorCartaEquipoB: Carta2v2 | null;
}

interface Equipo2v2 {
  id: string; nombre: string;
  jugador1: Jugador2v2; jugador2: Jugador2v2;
}

export interface ManoTruco2v2 {
  id: string;
  numeroDeMano: number;
  posicion1: Jugador2v2;
  posicion2: Jugador2v2;
  posicion3: Jugador2v2;
  posicion4: Jugador2v2;
  equipoA: Equipo2v2;
  equipoB: Equipo2v2;

  turnoActual: string;
  jugadorMano: string;
  equipoMano: string;

  vueltas: Vuelta2v2[];
  vueltaActual: Vuelta2v2 | null;
  ganadorMano: string | null;
  manoTerminada: boolean;

  // Envido
  envidoCantado: boolean;
  envidoResuelto: boolean;
  cantorEnvido: string | null;
  tipoEnvidoCantado: string | null;
  ganadorEnvido: string | null;
  puntosEnvido: number;
  estadoEnvido: string | null;
  envidoPendienteRespuestaDe: string | null;
  faseEnvido: string | null;
  tantosDeclarados: Record<string, number | null>;
  tantosReales: Record<string, number>;
  sonBuenasDeclarado: boolean;
  indiceDeclaracionTanto: number;

  // Truco
  trucoCantado: boolean;
  trucoResuelto: boolean;
  cantorTruco: string | null;
  equipoCantorTruco: string | null;
  nivelTruco: number;
  puntosTrucoMano: number;
  estadoTruco: string | null;
  trucoPendienteRespuestaDe: string | null;
  puedeEscalarTruco: string | null;

  // Puntos
  puntosEquipoA: number;
  puntosEquipoB: number;
  partidaTerminada: boolean;
  ganadorPartida: string | null;
}

// ── Tipos de UI ───────────────────────────────────────────────────
interface BazaDisplay {
  yo: Carta2v2 | null;
  compa: Carta2v2 | null;
  op1: Carta2v2 | null;
  op2: Carta2v2 | null;
  ganador: 'nosotros' | 'ellos' | 'parda' | null;
}

interface BtnAccion {
  label: string; color: string;
  action: () => void;
  enabled: boolean;
}

const API = '/api/truco2v2';

@Component({
  selector: 'app-truco-solo-2v2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './truco-solo-2v2.component.html',
  styleUrls: [
    '../truco-solo/truco-solo.component.css',
    '../truco-2v2/truco-2v2.component.css',
    './truco-solo-2v2.component.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrucoSolo2v2Component implements OnInit, OnDestroy {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  // ── Estado del juego ─────────────────────────────────────────
  mano: ManoTruco2v2 | null = null;

  // ── UI ────────────────────────────────────────────────────────
  btns: BtnAccion[] = [];
  bazaSlots: BazaDisplay[] = [];
  tantoInput = 0;
  mostrarInputTanto = false;
  mostrarConfirmSalir = false;
  toastMsg = '';
  gameOver = false;
  gameOverGanamos = false;

  readonly fanAngles = [-12, 0, 12];
  readonly fanXOff   = [-18, 0, 18];

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Helpers para template ─────────────────────────────────────
  get yo():     Jugador2v2 | null  { return this.mano?.posicion1 ?? null; }
  get compa():  Jugador2v2 | null  { return this.mano?.posicion3 ?? null; }
  get rival1(): Jugador2v2 | null  { return this.mano?.posicion2 ?? null; }
  get rival2(): Jugador2v2 | null  { return this.mano?.posicion4 ?? null; }

  get puntosNosotros(): number { return this.mano?.puntosEquipoA ?? 0; }
  get puntosEllos():    number { return this.mano?.puntosEquipoB ?? 0; }
  get estadoEnvido():   string { return this.mano?.estadoEnvido ?? 'No se cantó.'; }
  get estadoTruco():    string { return this.mano?.estadoTruco  ?? 'No se cantó.'; }
  get turnoBadge():     string { return this.calcularTurnoBadge(); }

  tallySticksNosotros: any[] = [];
  tallySticksEllos:    any[] = [];

  // ── Init ──────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    await this.nuevaPartida();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Acciones del humano ───────────────────────────────────────
  async jugarCarta(carta: Carta2v2): Promise<void> {
    if (!this.mano || this.mano.turnoActual !== 'J1') return;
    await this.call('jugar-carta', { manoId: this.mano.id, numero: carta.numero, palo: carta.palo });
  }

  async cantarEnvido(tipo: string): Promise<void> {
    if (!this.mano) return;
    await this.call('cantar-envido', { manoId: this.mano.id, tipo });
  }

  async responderEnvido(aceptar: boolean, escalarA?: string): Promise<void> {
    if (!this.mano) return;
    await this.call('responder-envido', { manoId: this.mano.id, aceptar, escalarA });
  }

  async declararTanto(): Promise<void> {
    if (!this.mano) return;
    await this.call('declarar-tanto', { manoId: this.mano.id, tanto: this.tantoInput });
    this.mostrarInputTanto = false;
  }

  async sonBuenas(): Promise<void> {
    if (!this.mano) return;
    await this.call('son-buenas', { manoId: this.mano.id });
    this.mostrarInputTanto = false;
  }

  async cantarTruco(): Promise<void> {
    if (!this.mano) return;
    await this.call('cantar-truco', { manoId: this.mano.id });
  }

  async responderTruco(aceptar: boolean, escalarA?: string): Promise<void> {
    if (!this.mano) return;
    await this.call('responder-truco', { manoId: this.mano.id, aceptar, escalarA });
  }

  async irseAlMazo(): Promise<void> {
    if (!this.mano) return;
    await this.call('irse-al-mazo', { manoId: this.mano.id });
  }

  async nuevaMano(): Promise<void> {
    if (!this.mano) return;
    await this.call('nueva-mano', { manoId: this.mano.id });
    this.gameOver = false;
  }

  async nuevaPartida(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<ManoTruco2v2>(`${API}/nueva-partida`, {})
      );
      this.actualizarEstado(res);
    } catch (e: any) {
      this.showToast('Error al iniciar partida: ' + (e?.error?.title ?? e?.message));
    }
  }

  // ── Llamada genérica al backend ───────────────────────────────
  private async call(endpoint: string, body: object): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<ManoTruco2v2>(`${API}/${endpoint}`, body)
      );
      this.actualizarEstado(res);
    } catch (e: any) {
      this.showToast(e?.error?.detail ?? e?.error?.title ?? 'Error de conexión con el servidor.');
    }
  }

  // ── Actualizar todo el estado de UI ──────────────────────────
  private actualizarEstado(mano: ManoTruco2v2): void {
    this.mano = mano;
    this.bazaSlots = this.buildBazas(mano);
    this.tantoInput = this.calcularMiTanto(mano);
    this.mostrarInputTanto = mano.faseEnvido === 'declarando_tantos'
      && mano.envidoPendienteRespuestaDe === 'J1';
    this.buildBtns(mano);
    this.redrawTally(mano.puntosEquipoA, mano.puntosEquipoB);

    if (mano.partidaTerminada && !this.gameOver) {
      this.gameOver       = true;
      this.gameOverGanamos = mano.ganadorPartida === 'EquipoA';
    }
    this.cdr.markForCheck();
  }

  private buildBazas(mano: ManoTruco2v2): BazaDisplay[] {
    const slots: BazaDisplay[] = [];
    for (const v of mano.vueltas) {
      slots.push({
        yo:     v.cartasJugadas['J1'] ?? null,
        compa:  v.cartasJugadas['J3'] ?? null,
        op1:    v.cartasJugadas['J2'] ?? null,
        op2:    v.cartasJugadas['J4'] ?? null,
        ganador: this.mapGanador(v.ganadorVuelta),
      });
    }
    // vuelta en curso
    if (mano.vueltaActual) {
      const v = mano.vueltaActual;
      slots.push({
        yo:     v.cartasJugadas['J1'] ?? null,
        compa:  v.cartasJugadas['J3'] ?? null,
        op1:    v.cartasJugadas['J2'] ?? null,
        op2:    v.cartasJugadas['J4'] ?? null,
        ganador: null,
      });
    }
    // Rellenar hasta 3 slots vacíos
    while (slots.length < 3) {
      slots.push({ yo: null, compa: null, op1: null, op2: null, ganador: null });
    }
    return slots;
  }

  private mapGanador(g: string | null): 'nosotros' | 'ellos' | 'parda' | null {
    if (g === 'EquipoA') return 'nosotros';
    if (g === 'EquipoB') return 'ellos';
    if (g === 'Parda')   return 'parda';
    return null;
  }

  private buildBtns(mano: ManoTruco2v2): void {
    const btns: BtnAccion[] = [];
    const esMiTurno  = mano.turnoActual === 'J1';
    const manoEnd    = mano.manoTerminada || !!mano.ganadorMano || mano.partidaTerminada;

    // ── Truco pending ─────────────────────────────────────────
    if (mano.trucoPendienteRespuestaDe === 'J1') {
      btns.push({ label: 'QUIERO',    color: '#44ff44', enabled: true, action: () => this.responderTruco(true)  });
      if ((mano.nivelTruco ?? 0) < 3 && mano.puedeEscalarTruco === 'J1') {
        const lbl = mano.nivelTruco === 1 ? 'RETRUCO' : 'VALE 4';
        const esc = mano.nivelTruco === 1 ? 'retruco' : 'valecuatro';
        btns.push({ label: lbl, color: '#ffaa00', enabled: true, action: () => this.responderTruco(true, esc) });
      }
      btns.push({ label: 'NO QUIERO', color: '#ff4444', enabled: true, action: () => this.responderTruco(false) });
    }
    // ── Envido pending ────────────────────────────────────────
    else if (mano.envidoPendienteRespuestaDe === 'J1' && mano.faseEnvido === 'pendiente_respuesta') {
      btns.push({ label: 'QUIERO',       color: '#44ff44', enabled: true, action: () => this.responderEnvido(true) });
      const tipo = mano.tipoEnvidoCantado ?? 'Envido';
      if (tipo === 'Envido')
        btns.push({ label: 'ENVIDO',       color: '#4488ff', enabled: true, action: () => this.responderEnvido(true, 'Envido Envido') });
      if (tipo === 'Envido' || tipo === 'EnvidoEnvido')
        btns.push({ label: 'REAL ENVIDO',  color: '#4488ff', enabled: true, action: () => this.responderEnvido(true, 'Real Envido') });
      if (tipo !== 'FaltaEnvido')
        btns.push({ label: 'FALTA ENVIDO', color: '#4488ff', enabled: true, action: () => this.responderEnvido(true, 'Falta Envido') });
      btns.push({ label: 'NO QUIERO',    color: '#ff4444', enabled: true, action: () => this.responderEnvido(false) });
    }
    // ── Declarar tanto ────────────────────────────────────────
    else if (mano.envidoPendienteRespuestaDe === 'J1' && mano.faseEnvido === 'declarando_tantos') {
      btns.push({ label: `TENGO ${this.tantoInput}`, color: '#44ff44', enabled: true, action: () => this.declararTanto() });
      btns.push({ label: 'SON BUENAS',               color: '#ffaa00', enabled: true, action: () => this.sonBuenas() });
    }
    // ── Mano terminada ────────────────────────────────────────
    else if (mano.manoTerminada && !mano.partidaTerminada) {
      btns.push({ label: 'NUEVA MANO', color: '#cc8800', enabled: true, action: () => this.nuevaMano() });
    }
    // ── Turno normal ──────────────────────────────────────────
    else if (!manoEnd) {
      // Envido
      const envPosible = !mano.envidoCantado && !mano.trucoCantado
        && mano.vueltas.length === 0 && !mano.vueltaActual;
      if (envPosible) {
        btns.push({ label: 'Envido',       color: '#4488ff', enabled: esMiTurno, action: () => this.cantarEnvido('Envido') });
        btns.push({ label: 'Real Envido',  color: '#4488ff', enabled: esMiTurno, action: () => this.cantarEnvido('Real Envido') });
        btns.push({ label: 'Falta Envido', color: '#4488ff', enabled: esMiTurno, action: () => this.cantarEnvido('Falta Envido') });
      }
      // Truco
      if (!mano.trucoCantado) {
        btns.push({ label: 'Truco', color: '#dd4422', enabled: esMiTurno, action: () => this.cantarTruco() });
      }
      // Ir al mazo
      btns.push({ label: 'Ir al mazo', color: '#884422', enabled: esMiTurno, action: () => this.irseAlMazo() });
    }

    this.btns = btns;
  }

  private calcularTurnoBadge(): string {
    const m = this.mano;
    if (!m) return '';
    if (m.partidaTerminada) return '';
    if (m.manoTerminada) {
      const gan = m.ganadorMano === 'EquipoA' ? '¡Ganaron la mano!' : 'Perdieron la mano.';
      return gan;
    }
    if (m.trucoPendienteRespuestaDe === 'J1') return 'Respondé el Truco';
    if (m.envidoPendienteRespuestaDe === 'J1' && m.faseEnvido === 'pendiente_respuesta') return 'Respondé el Envido';
    if (m.envidoPendienteRespuestaDe === 'J1' && m.faseEnvido === 'declarando_tantos') return 'Declarás tus tantos';
    if (m.turnoActual === 'J1') return 'Tu turno — jugá una carta o cantá';
    return `Turno de ${m.turnoActual === 'J3' ? 'tu compañero' : 'un rival'}...`;
  }

  private calcularMiTanto(mano: ManoTruco2v2): number {
    const cartas = mano.posicion1?.mano ?? [];
    return this.calcularTanto(cartas);
  }

  private calcularTanto(cartas: Carta2v2[]): number {
    const grupos: Record<string, number[]> = {};
    for (const c of cartas) {
      const v = c.numero >= 10 ? 0 : c.numero;
      if (!grupos[c.palo]) grupos[c.palo] = [];
      grupos[c.palo].push(v);
    }
    let mejor = 0;
    for (const vals of Object.values(grupos)) {
      const sorted = [...vals].sort((a, b) => b - a);
      if (sorted.length >= 2) mejor = Math.max(mejor, sorted[0] + sorted[1] + 20);
    }
    if (mejor > 0) return mejor;
    return Math.max(...cartas.map(c => c.numero >= 10 ? 0 : c.numero), 0);
  }

  // ── Tanteador ─────────────────────────────────────────────────
  private redrawTally(ptsA: number, ptsB: number): void {
    this.tallySticksNosotros = this.buildTally(ptsA, '#c8a030');
    this.tallySticksEllos    = this.buildTally(ptsB, '#d46010');
  }

  private buildTally(pts: number, color: string): any[] {
    const out: any[] = [];
    if (pts <= 0) return out;
    const full = Math.floor(pts / 5), rem = pts % 5;
    const BS = 14, BGAP = 3, SL = 9, SGAP = 3;
    let bx = 6;
    for (let i = 0; i < Math.min(full, 3); i++) {
      this.addBox(out, bx, 4, BS, color);
      bx += BS + BGAP;
    }
    if (rem > 0 && full < 3) {
      let sx = bx;
      for (let i = 0; i < rem; i++) { out.push({ x1: sx, y1: 4 + SL, x2: sx + SL, y2: 4, color }); sx += SL + SGAP; }
    }
    return out;
  }

  private addBox(out: any[], x: number, y: number, s: number, color: string): void {
    out.push({ x1: x,   y1: y+s, x2: x,   y2: y,   color });
    out.push({ x1: x,   y1: y,   x2: x+s, y2: y,   color });
    out.push({ x1: x+s, y1: y,   x2: x+s, y2: y+s, color });
    out.push({ x1: x+s, y1: y+s, x2: x,   y2: y+s, color });
    out.push({ x1: x,   y1: y+s, x2: x+s, y2: y,   color });
  }

  // ── Imagen de carta ───────────────────────────────────────────
  cardImg(c: Carta2v2): string {
    const nums: Record<number, number> = { 1:1,2:2,3:3,4:4,5:5,6:6,7:7,10:8,11:9,12:10 };
    const palos: Record<string, number> = { Oro:0, Copa:10, Espada:20, Basto:30 };
    return `assets/cards/${(palos[c.palo] ?? 0) + (nums[c.numero] ?? 1)}.PNG`;
  }

  // ── Game over / salir ─────────────────────────────────────────
  salirPartida():    void { this.mostrarConfirmSalir = true; }
  cancelarSalir():   void { this.mostrarConfirmSalir = false; }
  async confirmarSalir(): Promise<void> {
    this.mostrarConfirmSalir = false;
    this.router.navigate(['/home']);
  }

  private showToast(msg: string): void {
    this.toastMsg = msg;
    this.cdr.markForCheck();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMsg = ''; this.cdr.markForCheck(); }, 4000);
  }
}
