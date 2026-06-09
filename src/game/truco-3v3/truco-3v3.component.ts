import {
  Component, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// ── Tipos (scaffold visual; la lógica se conecta más adelante) ───────────────
export interface Carta3v3 { numero: number; palo: string; }

interface AsientoRival {
  rol: string;        // 'J2'..'J6'
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
    './truco-3v3.component.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Truco3v3Component {

  // ── Asiento propio (abajo) ────────────────────────────────────
  yoRol = 'J1';
  yoNombre = 'VOS';
  misCartas: Carta3v3[] = [
    { numero: 1,  palo: 'Espada' },
    { numero: 7,  palo: 'Oro'    },
    { numero: 3,  palo: 'Basto'  },
  ];

  readonly fanAngles = [-14, 0, 14];
  readonly fanXOff   = [-22, 0, 22];

  // ── Rival de enfrente (arriba) ────────────────────────────────
  frente: AsientoRival = { rol: 'J4', nombre: 'RIVAL 2', equipo: 'ellos', cartasEnMano: 3 };

  // ── Dos jugadores a la izquierda (de arriba hacia abajo) ──────
  izquierda: AsientoRival[] = [
    { rol: 'J5', nombre: 'RIVAL 3', equipo: 'ellos',    cartasEnMano: 3 },
    { rol: 'J3', nombre: 'COMPA 2', equipo: 'nosotros', cartasEnMano: 3 },
  ];

  // ── Dos jugadores a la derecha (de arriba hacia abajo) ────────
  derecha: AsientoRival[] = [
    { rol: 'J6', nombre: 'RIVAL 1', equipo: 'ellos',    cartasEnMano: 3 },
    { rol: 'J2', nombre: 'COMPA 1', equipo: 'nosotros', cartasEnMano: 3 },
  ];

  // ── Marcador (placeholder) ────────────────────────────────────
  puntosNosotros = 0;
  puntosEllos    = 0;
  estadoEnvido = 'No se cantó.';
  estadoTruco  = 'No se cantó.';
  turnoBadge   = 'Pantalla 3v3 — en construcción';

  mostrarConfirmSalir = false;

  constructor(private router: Router) {}

  // Helper para dibujar N reversos
  reversos(n: number): number[] { return Array.from({ length: n }, (_, i) => i); }

  // ── Acciones (placeholder) ────────────────────────────────────
  jugarCarta(_carta: Carta3v3): void {
    // TODO: conectar con el backend 3v3 cuando exista la lógica.
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
  confirmarSalir(): void {
    this.mostrarConfirmSalir = false;
    this.router.navigate(['/home']);
  }
}
