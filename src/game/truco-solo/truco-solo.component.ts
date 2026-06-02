import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type Palo = 'Oro' | 'Espada' | 'Copa' | 'Basto';
export type TipoEnvido = 'Envido' | 'EnvidoEnvido' | 'Real Envido' | 'RealEnvido' | 'Falta Envido' | 'FaltaEnvido';

export interface Carta {
  numero: number;
  palo: Palo;
  valorTruco: number;
  valorEnvido: number;
}

export interface Baza {
  cartaJugador?: Carta;
  cartaMaquina?: Carta;
  ganador?: 'Humano' | 'Maquina' | 'Parda';
}

export interface VistaHabilidades {
  activaDisponible: boolean;
  activaUsadaEnEstaMano: boolean;
  habilidadesActivasEnPartida: boolean;
  claseHeroe?: number;
  nombreHeroe?: string;
  ultimoMensajeHabilidad?: string;
  cartaReveladaRival?: { numero: number; palo: string; valorTruco: number };
}

export interface ManoState {
  id: string;
  humano:   { mano: Carta[] };
  maquina:  { mano: Carta[] };
  bazas:    Baza[];
  turnoActual: 'Humano' | 'Maquina';
  puntosHumano: number;
  puntosMaquina: number;
  estadoEnvido?: string;
  estadoTruco?:  string;
  envidoCantado?: boolean;
  trucoCantado?:  boolean;
  trucoResuelto?: boolean;
  nivelTruco?: number;
  cantorTruco?: 'Humano' | 'Maquina';
  tipoEnvidoCantado?: TipoEnvido;
  tantoCantadoMaquina?: number;
  tantoHumano?: number;
  envidoResuelto?: boolean;
  ganadorMano?:    'Humano' | 'Maquina' | 'Parda';
  ganadorPartida?: 'Humano' | 'Maquina';
  partidaTerminada?: boolean;
  envidoPendienteRespuestaHumano?: boolean;
  trucoPendienteRespuestaHumano?:  boolean;
  cartaMaquinaEnMesa?: Carta;
  numeroDeMano?: number;
  configuracion?: { modo: number; heroeDelHumano?: number };
  vistaHabilidadesHumano?: VistaHabilidades;
}

export interface Btn {
  label: string;
  color: string;
  enabled: boolean;
  action: (() => void) | null;
}

export interface Slot {
  jugador?: Carta;
  maquina?: Carta;
  pending: boolean;
  winner?: 'Humano' | 'Maquina' | 'Parda';
}

// ── Héroe ─────────────────────────────────────────────────────────────────────

export interface Heroe {
  id: number;
  nombre: string;
  color: string;
  descripcion: string;
}

const HEROES: Heroe[] = [
  { id: 0, nombre: 'Manipulador', color: '#aa66ff', descripcion: 'Cada 3 manos: reemplazá 1 carta por otra del mazo (nunca de menor valor).' },
  { id: 1, nombre: 'Timbero',     color: '#ffaa44', descripcion: 'Antes de jugar: apostá. Si ganás la mano, duplicás puntos; si perdés, rival +2.' },
  { id: 2, nombre: 'Fanfarrón',   color: '#44aaff', descripcion: 'Tu próximo envido o truco aceptado vale +1 punto extra.' },
  { id: 3, nombre: 'Mentiroso',   color: '#66dd88', descripcion: 'Cada 2 manos: al inicio, revelás 1 carta aleatoria del rival.' },
];

// ── Constantes ───────────────────────────────────────────────────────────────

const PALO_SYM: Record<Palo, string> = { Oro: '★', Espada: '†', Copa: '♦', Basto: '♣' };
const API = '/api/truco';
const FAN_ANGLES = [-16, 0, 16];
const FAN_X      = [-84, 0, 84];

// ── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-truco-solo',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './truco-solo.component.html',
  styleUrl: './truco-solo.component.css',
})
export class TrucoSoloComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('gauchoVideo') gauchoVideo!: ElementRef<HTMLVideoElement>;

  private http   = inject(HttpClient);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  // ── Estado del juego ─────────────────────────────────────────────────────
  mano: ManoState | null = null;

  // ── Héroe ─────────────────────────────────────────────────────────────────
  heroe: Heroe | null = null;

  // Índice de la carta seleccionada para el Manipulador (claseHeroe === 0)
  habilidadCartaIdx: number | null = null;

  // true cuando el jugador tocó "Usar habilidad" y esperamos que elija una carta (solo Manipulador)
  modoSeleccionCarta = false;

  // Líneas del log de eventos de habilidad (se acumulan durante la partida)
  eventosHabilidad: string[] = [];

  get vista(): VistaHabilidades | undefined {
    return this.mano?.vistaHabilidadesHumano;
  }

  // Habilidad disponible = el backend dice que está lista y no fue usada esta mano
  get habilidadDisponible(): boolean {
    const v = this.vista;
    if (!this.heroe || !v?.habilidadesActivasEnPartida) return false;
    return !!v.activaDisponible && !v.activaUsadaEnEstaMano;
  }

  // True cuando el jugador tocó el botón y el Manipulador espera que elija carta
  get manipuladorEsperandoCarta(): boolean {
    return !!this.heroe && this.heroe.id === 0 && this.modoSeleccionCarta;
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  btns: Btn[] = [];
  slots: Slot[] = [{ pending: false }, { pending: false }, { pending: false }];
  opCards: { visible: boolean }[] = [
    { visible: true }, { visible: true }, { visible: true },
  ];
  misCarts: { carta: Carta | null; visible: boolean; seleccionada: boolean }[] = [
    { carta: null, visible: false, seleccionada: false },
    { carta: null, visible: false, seleccionada: false },
    { carta: null, visible: false, seleccionada: false },
  ];

  rivalLabel  = 'Esperando mano...';
  turnoBadge  = '';
  bubbleText  = '';
  gameOver    = false;
  gameOverWon = false;
  toastMsg    = '';

  readonly fanAngles = FAN_ANGLES;
  readonly fanXOff   = FAN_X;

  tallySticks: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

  // ── Estado interno ────────────────────────────────────────────────────────
  private loading          = false;
  private prevEstadoTruco    = '';
  private prevEstadoEnvido   = '';
  private prevPendTru        = false;
  private prevPendEnv        = false;
  private prevEnvidoResuelto = false;
  private prevGanadorMano: string | null = null;
  private nuevaManoTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  countdown: number | null = null;
  private bubbleTimer: ReturnType<typeof setTimeout> | null = null;
  private toastTimer:  ReturnType<typeof setTimeout> | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    const video = this.gauchoVideo?.nativeElement;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  ngOnInit(): void {
    const heroeIdStr = localStorage.getItem('heroeId');
    if (heroeIdStr !== null) {
      const id = parseInt(heroeIdStr, 10);
      this.heroe = HEROES.find(h => h.id === id) ?? null;
    }
    const body: Record<string, unknown> = { modo: this.heroe ? 1 : 0 };
    if (this.heroe) body['claseHeroe'] = this.heroe.id;
    this.call('nueva-partida', body);
  }

  ngOnDestroy(): void {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    if (this.toastTimer)  clearTimeout(this.toastTimer);
    this.cancelarCountdown();
  }

  // ── Template helpers ──────────────────────────────────────────────────────
  sym(palo: Palo): string { return PALO_SYM[palo] ?? ''; }

  cardImg(carta: Carta): string {
    const mapaNumeros: Record<number, number> = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 10: 8, 11: 9, 12: 10
    };
    const offsetPalo: Record<Palo, number> = { Oro: 0, Copa: 10, Espada: 20, Basto: 30 };
    return `assets/cards/${offsetPalo[carta.palo] + mapaNumeros[carta.numero]}.PNG`;
  }

  // ── API ───────────────────────────────────────────────────────────────────
  async call(endpoint: string, body: object): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {
      const data = await firstValueFrom(
        this.http.post<ManoState>(`${API}/${endpoint}`, body)
      );
      this.mano = data;
      this.updateEventosHabilidad(data);
      this.updateUI(data);
    } catch (err: any) {
      const msg = (typeof err?.error === 'string' ? err.error : null) ?? err?.error?.message ?? err?.message ?? String(err);
      this.showToast(`Error en ${endpoint}: ${msg}`);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  // Acumula los eventos de habilidad en el log
  private updateEventosHabilidad(m: ManoState): void {
    const v = m.vistaHabilidadesHumano;
    if (!v?.habilidadesActivasEnPartida) return;

    const lineas: string[] = [];

    if (v.activaDisponible && !v.activaUsadaEnEstaMano)
      lineas.push('⚡ Activa disponible');

    if (v.cartaReveladaRival)
      lineas.push(`👁 Rival revelado: ${v.cartaReveladaRival.numero} de ${v.cartaReveladaRival.palo}`);

    if (v.ultimoMensajeHabilidad)
      lineas.push(`▶ ${v.ultimoMensajeHabilidad}`);

    // Solo actualizar si hay algo nuevo que mostrar
    if (lineas.length > 0) {
      this.eventosHabilidad = lineas;
    }
  }

  // ── Jugar carta ───────────────────────────────────────────────────────────
  jugarCarta(i: number): void {
    const c = this.misCarts[i]?.carta;
    if (!c || !this.mano) return;

    // Manipulador en modo selección: el jugador ya tocó "Usar habilidad",
    // ahora elige qué carta cambiar → llamar al backend con esa carta
    if (this.modoSeleccionCarta && this.heroe?.id === 0) {
      this.modoSeleccionCarta = false;
      this.misCarts = this.misCarts.map((mc, idx) => ({ ...mc, seleccionada: idx === i }));
      this.cdr.markForCheck();
      const body: Record<string, unknown> = {
        manoId: this.mano.id,
        numeroCarta: c.numero,
        paloCarta:   c.palo,
      };
      this.misCarts = this.misCarts.map(mc => ({ ...mc, seleccionada: false }));
      this.call('activar-habilidad', body);
      return;
    }

    // Flujo normal: jugar la carta
    this.call('jugar-carta', { manoId: this.mano.id, numero: c.numero, palo: c.palo });
  }

  // ── Usar habilidad ────────────────────────────────────────────────────────
  usarHabilidad(): void {
    if (!this.mano || !this.habilidadDisponible) return;

    // Manipulador: activar modo selección (si ya está activo, ignorar)
    if (this.heroe?.id === 0) {
      if (this.modoSeleccionCarta) return;
      this.modoSeleccionCarta = true;
      this.cdr.markForCheck();
      return;
    }

    // Resto de héroes: llamar al backend directamente sin elegir carta
    this.call('activar-habilidad', { manoId: this.mano.id });
  }

  private iniciarCountdown(onComplete: () => void): void {
    this.cancelarCountdown();
    this.countdown = 3;
    this.cdr.markForCheck();
    this.countdownInterval = setInterval(() => {
      this.countdown = (this.countdown ?? 1) - 1;
      this.cdr.markForCheck();
      if ((this.countdown ?? 0) <= 0) {
        this.cancelarCountdown();
        onComplete();
      }
    }, 1000);
  }

  private cancelarCountdown(): void {
    if (this.countdownInterval) { clearInterval(this.countdownInterval); this.countdownInterval = null; }
    if (this.nuevaManoTimer)    { clearTimeout(this.nuevaManoTimer);     this.nuevaManoTimer = null; }
    this.countdown = null;
  }

  nuevaPartida(): void {
    this.gameOver = false;
    this.eventosHabilidad = [];
    this.habilidadCartaIdx = null;
    this.modoSeleccionCarta = false;
    const body: Record<string, unknown> = { modo: this.heroe ? 1 : 0 };
    if (this.heroe) body['claseHeroe'] = this.heroe.id;
    this.call('nueva-partida', body);
  }

  mostrarConfirmSalir = false;

  salirPartida(): void {
    this.mostrarConfirmSalir = true;
  }

  confirmarSalir(): void {
    this.mostrarConfirmSalir = false;
    window.dispatchEvent(new CustomEvent('truco-solo:end'));
    this.router.navigate(['/home']);
  }

  cancelarSalir(): void {
    this.mostrarConfirmSalir = false;
  }

  // ── UI update ─────────────────────────────────────────────────────────────
  private updateUI(m: ManoState): void {
    this.redrawTally(m.puntosHumano, m.puntosMaquina);

    if (m.ganadorPartida) {
      this.gameOver    = true;
      this.gameOverWon = m.ganadorPartida === 'Humano';
      this.cdr.markForCheck();
      return;
    }
    this.gameOver = false;

    if (m.ganadorMano) {
      this.rivalLabel = m.ganadorMano === 'Humano' ? '¡Perdí la mano!' : '¡Gané la mano!';
      this.habilidadCartaIdx = null;
      this.modoSeleccionCarta = false;
      if (m.ganadorMano !== this.prevGanadorMano && !m.partidaTerminada) {
        this.iniciarCountdown(() => {
          if (this.mano?.ganadorMano && !this.mano?.partidaTerminada)
            this.call('nueva-mano', { manoAnteriorId: this.mano.id });
        });
      }
    } else {
      this.rivalLabel = m.turnoActual === 'Maquina' ? 'Pensando...' : '...';
      this.cancelarCountdown();
    }
    this.prevGanadorMano = m.ganadorMano ?? null;

    const pendEnv   = !!m.envidoPendienteRespuestaHumano;
    const pendTru   = !!m.trucoPendienteRespuestaHumano;
    const esMiTurno = (m.turnoActual === 'Humano' || !!m.cartaMaquinaEnMesa)
                      && !m.ganadorMano && !m.ganadorPartida && !pendEnv && !pendTru;

    this.turnoBadge = esMiTurno
      ? 'Tu turno — jugá una carta o cantá'
      : (pendEnv || pendTru) ? 'Respondé el canto de la máquina' : '';

    this.updateBubble(m, pendTru, pendEnv);
    this.prevEstadoTruco    = m.estadoTruco  ?? '';
    this.prevEstadoEnvido   = m.estadoEnvido ?? '';
    this.prevPendTru        = pendTru;
    this.prevPendEnv        = pendEnv;
    this.prevEnvidoResuelto = !!m.envidoResuelto;

    const cantOp = m.maquina?.mano?.length ?? 0;
    this.opCards = [0, 1, 2].map(i => ({ visible: i < cantOp }));

    this.slots = [0, 1, 2].map(i => {
      const b = m.bazas?.[i];
      const pendingMaq = !b && i === (m.bazas?.length ?? 0) && !!m.cartaMaquinaEnMesa;
      return {
        jugador: b?.cartaJugador,
        maquina: b?.cartaMaquina ?? (pendingMaq ? m.cartaMaquinaEnMesa : undefined),
        pending: pendingMaq,
        winner:  b?.ganador,
      };
    });

    // Preservar estado de selección del Manipulador al actualizar cartas
    this.misCarts = [0, 1, 2].map(i => {
      const carta = m.humano?.mano?.[i] ?? null;
      return {
        carta,
        visible: !!carta && !m.ganadorMano,
        seleccionada: this.habilidadCartaIdx === i,
      };
    });

    this.buildBtns(m, esMiTurno, pendEnv, pendTru);
  }

  // ── Burbuja ───────────────────────────────────────────────────────────────
  private updateBubble(m: ManoState, pendTru: boolean, pendEnv: boolean): void {
    const trucoChanged  = (m.estadoTruco  ?? '') !== this.prevEstadoTruco;
    const envidoChanged = (m.estadoEnvido ?? '') !== this.prevEstadoEnvido;

    if (pendTru || pendEnv) {
      if (pendTru && envidoChanged && m.envidoCantado && !this.prevPendEnv) {
        const e = (m.estadoEnvido ?? '').toLowerCase();
        let rsp = '';
        const justResolved = !!m.envidoResuelto && !this.prevEnvidoResuelto;
        if      (e.includes('no quiso') || e.includes('no quiere')) rsp = '¡No quiero!';
        else if (justResolved && m.tantoCantadoMaquina != null)      rsp = this.prevPendEnv ? `Tengo ${m.tantoCantadoMaquina}.` : `¡Quiero! Tengo ${m.tantoCantadoMaquina}.`;
        else if (e.includes('quiso')    || e.includes('quiere'))     rsp = m.tantoCantadoMaquina != null ? (this.prevPendEnv ? `Tengo ${m.tantoCantadoMaquina}.` : `¡Quiero! Tengo ${m.tantoCantadoMaquina}.`) : '¡Quiero!';
        if (rsp) {
          this.showTempBubble(rsp, 2000);
          setTimeout(() => {
            const trucotxt = this.cantoBubbleText(m, pendTru, false);
            if (trucotxt) this.showBubble(trucotxt);
          }, 2100);
          return;
        }
      }
      if (this.bubbleTimer) { clearTimeout(this.bubbleTimer); this.bubbleTimer = null; }
      const txt = this.cantoBubbleText(m, pendTru, pendEnv);
      if (txt) this.showBubble(txt);
    } else {
      let resp = '';
      if (trucoChanged && m.trucoCantado && !this.prevPendTru) {
        const t = (m.estadoTruco ?? '').toLowerCase();
        resp = (t.includes('no quiso') || t.includes('no quiere'))
          ? '¡No quiero!'
          : (t.includes('quiso') || t.includes('quiere') || t.includes('acepto'))
            ? '¡Quiero!' : '';
      } else if (envidoChanged && m.envidoCantado) {
        const e = (m.estadoEnvido ?? '').toLowerCase();
        const justResolved = !!m.envidoResuelto && !this.prevEnvidoResuelto;
        if (e.includes('no quiso') || e.includes('no quiere')) {
          resp = '¡No quiero!';
        } else if (justResolved && m.tantoCantadoMaquina != null) {
          // Si el humano aceptó el envido de la máquina (prevPendEnv=true) → solo "Tengo X"
          // Si la máquina aceptó la escalación del humano (prevPendEnv=false) → "¡Quiero! Tengo X"
          resp = this.prevPendEnv
            ? `Tengo ${m.tantoCantadoMaquina}.`
            : `¡Quiero! Tengo ${m.tantoCantadoMaquina}.`;
        } else if (e.includes('quiso') || e.includes('quiere') || e.includes('acepto')) {
          resp = m.tantoCantadoMaquina != null
            ? (this.prevPendEnv ? `Tengo ${m.tantoCantadoMaquina}.` : `¡Quiero! Tengo ${m.tantoCantadoMaquina}.`)
            : '¡Quiero!';
        }
      }
      if (resp) {
        this.showTempBubble(resp, 2500);
      } else if (!this.bubbleTimer) {
        this.bubbleText = '';
      }
    }
  }

  private cantoBubbleText(m: ManoState, pendTru: boolean, pendEnv: boolean): string {
    if (pendTru) {
      if (m.nivelTruco === 2) return '¡Retruco!';
      if (m.nivelTruco === 3) return '¡Vale Cuatro!';
      return '¡Truco!';
    }
    if (pendEnv) {
      const s = (m.estadoEnvido ?? '').toLowerCase();
      if (s.includes('falta')) return '¡Falta Envido!';
      if (s.includes('real'))  return '¡Real Envido!';
      return '¡Envido!';
    }
    return '';
  }

  private showBubble(txt: string): void {
    this.bubbleText = txt;
    this.cdr.markForCheck();
  }

  private showTempBubble(txt: string, ms: number): void {
    if (this.bubbleTimer) { clearTimeout(this.bubbleTimer); this.bubbleTimer = null; }
    this.bubbleText = txt;
    this.cdr.markForCheck();
    this.bubbleTimer = setTimeout(() => {
      this.bubbleText = '';
      this.bubbleTimer = null;
      this.cdr.markForCheck();
    }, ms);
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  private showToast(msg: string): void {
    if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = null; }
    this.toastMsg = msg;
    this.cdr.markForCheck();
    this.toastTimer = setTimeout(() => {
      this.toastMsg = '';
      this.toastTimer = null;
      this.cdr.markForCheck();
    }, 4000);
  }

  // ── Botones ───────────────────────────────────────────────────────────────
  private buildBtns(
    m: ManoState, esMiTurno: boolean, pendEnv: boolean, pendTru: boolean
  ): void {
    const manoEnd       = !!m.ganadorMano || !!m.ganadorPartida;
    const trucoCantado  = !!m.trucoCantado;
    const trucoResuelto = !!m.trucoResuelto;
    const raw: [string, string, (() => void) | null][] = [];

    if (m.partidaTerminada) {
      raw.push(['Nueva partida', '#226622', () => this.nuevaPartida()]);

    } else if (m.ganadorMano) {
      raw.push(['Nueva mano', '#cc8800', () => {
        this.cancelarCountdown();
        this.call('nueva-mano', { manoAnteriorId: m.id });
      }]);

    } else if (pendEnv) {
      raw.push(['QUIERO', '#44ff44',
        () => this.call('responder-envido', { manoId: m.id, aceptar: true })]);
      const tipoEnv = m.tipoEnvidoCantado;
      if (tipoEnv === 'Envido')
        raw.push(['ENVIDO', '#ffdd00',
          () => this.call('responder-envido', { manoId: m.id, aceptar: true, escalarA: 'Envido Envido' })]);
      if (tipoEnv === 'Envido' || tipoEnv === 'EnvidoEnvido')
        raw.push(['REAL ENVIDO', '#ffaa00',
          () => this.call('responder-envido', { manoId: m.id, aceptar: true, escalarA: 'Real Envido' })]);
      if (tipoEnv !== 'Falta Envido')
        raw.push(['FALTA ENVIDO', '#ff8800',
          () => this.call('responder-envido', { manoId: m.id, aceptar: true, escalarA: 'Falta Envido' })]);
      raw.push(['NO QUIERO', '#ff4444',
        () => this.call('responder-envido', { manoId: m.id, aceptar: false })]);

    } else if (pendTru) {
      raw.push(['QUIERO', '#44ff44',
        () => this.call('responder-truco', { manoId: m.id, aceptar: true })]);
      if ((m.nivelTruco ?? 0) < 3) {
        const lbl = m.nivelTruco === 1 ? 'RETRUCO' : 'VALE 4';
        const esc = m.nivelTruco === 1 ? 'retruco' : 'valecuatro';
        raw.push([lbl, '#ffaa00',
          () => this.call('responder-truco', { manoId: m.id, aceptar: true, escalarA: esc })]);
      }
      raw.push(['NO QUIERO', '#ff4444',
        () => this.call('responder-truco', { manoId: m.id, aceptar: false })]);
      if (!m.envidoCantado && (m.bazas?.length ?? 0) === 0) {
        raw.push(['Envido',       '#4488ff', () => this.call('cantar-envido-tipo', { manoId: m.id, tipo: 'Envido' })]);
        raw.push(['Real Envido',  '#4488ff', () => this.call('cantar-envido-tipo', { manoId: m.id, tipo: 'Real Envido' })]);
        raw.push(['Falta Envido', '#4488ff', () => this.call('cantar-envido-tipo', { manoId: m.id, tipo: 'Falta Envido' })]);
      }

    } else {
      const envidoPosible = !m.envidoCantado && !m.trucoResuelto
        && (m.bazas?.length ?? 0) === 0 && !manoEnd;
      if (envidoPosible) {
        raw.push(['Envido',       '#4488ff', esMiTurno ? () => this.call('cantar-envido-tipo', { manoId: m.id, tipo: 'Envido' })       : null]);
        raw.push(['Real Envido',  '#4488ff', esMiTurno ? () => this.call('cantar-envido-tipo', { manoId: m.id, tipo: 'Real Envido' })  : null]);
        raw.push(['Falta Envido', '#4488ff', esMiTurno ? () => this.call('cantar-envido-tipo', { manoId: m.id, tipo: 'Falta Envido' }) : null]);
      }

      if (!trucoCantado) {
        raw.push(['Truco', '#cc4444',
          esMiTurno && !manoEnd ? () => this.call('cantar-truco', { manoId: m.id }) : null]);
      } else if (trucoCantado && !trucoResuelto && (m.nivelTruco ?? 0) < 3 && m.cantorTruco !== 'Humano') {
        const lbl = m.nivelTruco === 1 ? 'Retruco' : 'Vale Cuatro';
        raw.push([lbl, '#cc4444',
          esMiTurno && !manoEnd ? () => this.call('escalar-truco', { manoId: m.id }) : null]);
      }

      if (esMiTurno && !manoEnd)
        raw.push(['Ir al mazo', '#556677', () => this.call('irse-al-mazo', { manoId: m.id })]);
    }

    this.btns = raw.map(([label, color, action]) => ({ label, color, action, enabled: !!action }));
  }

  // ── Tanteador SVG ─────────────────────────────────────────────────────────
  private redrawTally(ptsVos: number, ptsMaq: number): void {
    const sticks: typeof this.tallySticks = [];
    this.drawPalitos(sticks, 36,  Math.min(ptsVos, 15), false, 4);
    this.drawPalitos(sticks, 124, Math.min(ptsMaq, 15), true,  4);
    // Buenas (puntos > 15)
    if (ptsVos > 15) this.drawPalitos(sticks, 36,  ptsVos - 15, false, 58);
    if (ptsMaq > 15) this.drawPalitos(sticks, 124, ptsMaq - 15, true,  58);
    this.tallySticks = sticks;
  }

  private drawPalitos(out: typeof this.tallySticks, cx: number, pts: number, isMaq: boolean, yTop: number): void {
    if (pts <= 0) return;
    const color = isMaq ? '#d46010' : '#c8a030';
    const BS = 16, BGAP = 4, SL = 10, SGAP = 4;
    const full = Math.floor(pts / 5), rem = pts % 5;
    if (full > 0) {
      const totalW = full * BS + (full - 1) * BGAP;
      let bx = cx - totalW / 2;
      for (let i = 0; i < full; i++) {
        const by = yTop;
        this.stick(out, bx, by+BS, bx, by, color);
        this.stick(out, bx, by, bx+BS, by, color);
        this.stick(out, bx+BS, by, bx+BS, by+BS, color);
        this.stick(out, bx+BS, by+BS, bx, by+BS, color);
        this.stick(out, bx, by+BS, bx+BS, by, color);
        bx += BS + BGAP;
      }
    }
    if (rem > 0) {
      const totalW = rem * SL + (rem - 1) * SGAP;
      let sx = cx - totalW / 2;
      const sy = full > 0 ? yTop + BS + 4 : yTop + 4;
      for (let i = 0; i < rem; i++) {
        this.stick(out, sx, sy+SL, sx+SL, sy, color);
        sx += SL + SGAP;
      }
    }
  }

  private stick(out: typeof this.tallySticks, x1: number, y1: number, x2: number, y2: number, color: string): void {
    out.push({ x1, y1, x2, y2, color });
  }
}
