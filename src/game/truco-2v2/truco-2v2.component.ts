import {
  Component, OnInit, OnDestroy,
  ChangeDetectorRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SalaService } from '../../app/services/sala.service';

// ── Tipos ─────────────────────────────────────────────────────────────────
export interface Carta2v2 { numero: number; palo: string; }

interface FanCard { carta: Carta2v2 | null; }

interface BazaSlot2v2 {
  yo:     Carta2v2 | undefined;
  compa:  Carta2v2 | undefined;
  op1:    Carta2v2 | undefined;
  op2:    Carta2v2 | undefined;
  ganador: 'nosotros' | 'ellos' | 'parda' | undefined;
}

interface Jugador2v2 { nombre: string; }

interface TallyStick { x1: number; y1: number; x2: number; y2: number; color: string; }

// ── Botones de placeholder ─────────────────────────────────────────────────
const PLACEHOLDER_BTNS = [
  { label: 'Envido',       color: '#4488ff' },
  { label: 'Real Envido',  color: '#4488ff' },
  { label: 'Falta Envido', color: '#4488ff' },
  { label: 'Truco',        color: '#dd4422' },
  { label: 'Ir al mazo',   color: '#884422' },
];

@Component({
  selector: 'app-truco-2v2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './truco-2v2.component.html',
  styleUrls: [
    '../truco-solo/truco-solo.component.css',
    './truco-2v2.component.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrucoMulti2v2Component implements OnInit, OnDestroy {

  // ── Jugadores ──────────────────────────────────────────────────
  yo:      Jugador2v2 = { nombre: 'VOS' };
  compa:   Jugador2v2 = { nombre: 'COMPA' };
  rivals:  Jugador2v2[] = [
    { nombre: 'RIVAL 1' },
    { nombre: 'RIVAL 2' },
  ];

  // ── Cartas propias (placeholder visual) ───────────────────────
  miCartas: FanCard[] = [
    { carta: { numero: 1,  palo: 'Espada' } },
    { carta: { numero: 7,  palo: 'Oro'    } },
    { carta: { numero: 3,  palo: 'Basto'  } },
  ];

  readonly fanAngles = [-12, 0, 12];
  readonly fanXOff   = [-18, 0, 18];

  // ── Mesa / bazas ───────────────────────────────────────────────
  bazaSlots: BazaSlot2v2[] = [
    { yo: undefined, compa: undefined, op1: undefined, op2: undefined, ganador: undefined },
    { yo: undefined, compa: undefined, op1: undefined, op2: undefined, ganador: undefined },
    { yo: undefined, compa: undefined, op1: undefined, op2: undefined, ganador: undefined },
  ];

  // ── Marcador ───────────────────────────────────────────────────
  puntosNosotros = 0;
  puntosEllos    = 0;
  tallySticksNosotros: TallyStick[] = [];
  tallySticksEllos:    TallyStick[] = [];

  // ── Estado ────────────────────────────────────────────────────
  estadoEnvido = 'No se cantó.';
  estadoTruco  = 'No se cantó.';
  turnoBadge   = 'Esperando inicio de partida...';
  btns = PLACEHOLDER_BTNS;

  toastMsg            = '';
  mostrarConfirmSalir = false;

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private subs: Subscription[] = [];

  constructor(
    private sala: SalaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.redrawTally();

    this.subs.push(
      this.sala.jugadorDesconectado$.subscribe(v => {
        if (v) {
          this.showToast('Un jugador se desconectó de la partida.');
          this.cdr.markForCheck();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Acciones (placeholder — sin lógica aún) ───────────────────
  jugarCarta(idx: number): void {
    // TODO: implementar lógica 2v2
    this.showToast('Lógica de juego próximamente...');
  }

  // ── Tanteador ─────────────────────────────────────────────────
  private redrawTally(): void {
    this.tallySticksNosotros = this.buildTally(this.puntosNosotros, '#c8a030');
    this.tallySticksEllos    = this.buildTally(this.puntosEllos,    '#d46010');
  }

  private buildTally(pts: number, color: string): TallyStick[] {
    const out: TallyStick[] = [];
    if (pts <= 0) return out;
    const full = Math.floor(pts / 5);
    const rem  = pts % 5;
    const BS = 14, BGAP = 3, SL = 9, SGAP = 3;
    // Primera mitad (izquierda del divisor en 65)
    let bx = 10;
    for (let i = 0; i < Math.min(full, 3); i++) {
      this.addBox(out, bx, 4, BS, color);
      bx += BS + BGAP;
    }
    if (rem > 0 && full < 3) {
      let sx = bx;
      for (let i = 0; i < rem; i++) {
        out.push({ x1: sx, y1: 4 + SL, x2: sx + SL, y2: 4, color });
        sx += SL + SGAP;
      }
    }
    return out;
  }

  private addBox(out: TallyStick[], x: number, y: number, s: number, color: string): void {
    out.push({ x1: x,   y1: y + s, x2: x,     y2: y,     color }); // left
    out.push({ x1: x,   y1: y,     x2: x + s, y2: y,     color }); // top
    out.push({ x1: x+s, y1: y,     x2: x + s, y2: y + s, color }); // right
    out.push({ x1: x+s, y1: y + s, x2: x,     y2: y + s, color }); // bottom
    out.push({ x1: x,   y1: y + s, x2: x + s, y2: y,     color }); // diagonal
  }

  // ── Navegación ────────────────────────────────────────────────
  salirPartida(): void {
    this.mostrarConfirmSalir = true;
  }

  async confirmarSalir(): Promise<void> {
    this.mostrarConfirmSalir = false;
    await this.sala.abandonar();
    this.router.navigate(['/home']);
  }

  cancelarSalir(): void {
    this.mostrarConfirmSalir = false;
  }

  // ── Imagen de carta ───────────────────────────────────────────
  cardImg(c: Carta2v2): string {
    const mapaNumeros: Record<number, number> = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 10: 8, 11: 9, 12: 10,
    };
    const offsetPalo: Record<string, number> = {
      Oro: 0, Copa: 10, Espada: 20, Basto: 30,
    };
    return `assets/cards/${offsetPalo[c.palo] + mapaNumeros[c.numero]}.PNG`;
  }

  // ── Toast ─────────────────────────────────────────────────────
  private showToast(msg: string): void {
    this.toastMsg = msg;
    this.cdr.markForCheck();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMsg = '';
      this.cdr.markForCheck();
    }, 3500);
  }
}
