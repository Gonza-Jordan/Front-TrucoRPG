import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TrucoSoloComponent } from '../../game/truco-solo/truco-solo.component';

@Component({
  selector: 'app-game',
  standalone: true,

  imports: [
    CommonModule,
    TrucoSoloComponent
  ],

  template: `

  <!-- Phaser -->
  <div
    id="contenedor-juego"
    #gameContainer
    [style.display]="mostrarTrucoSolo ? 'none' : 'block'">
  </div>

  <!-- Mesa Angular -->
  @if (mostrarTrucoSolo) {

    <app-truco-solo></app-truco-solo>

  }

`,

  styles: [`

    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #1a5c1a;
    }

    #contenedor-juego {
      width: 100%;
      height: 100%;
    }

  `],
})

export class GameComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gameContainer')
  gameContainer!: ElementRef;

  private game: any = null;

  mostrarTrucoSolo = false;

  constructor(
    private route: ActivatedRoute
  ) { }

  async ngAfterViewInit(): Promise<void> {

    // Import dinámico Phaser
    const { initGame } = await import('../../game/main.js');

    // Obtener modo desde URL
    // /game/maquina
    // /game/multi
    const modo =
      this.route.snapshot.paramMap.get('modo') || 'maquina';

    // Iniciar Phaser
    this.game = initGame(
      'contenedor-juego',
      modo
    );

    // Listener para abrir y cerrar la mesa de angular
    window.addEventListener(
      'truco-solo:start',
      this.abrirMesaTruco
    );

    window.addEventListener(
      'truco-solo:end',
      this.cerrarMesaTruco
    );

    // Auto-fullscreen al rotar a landscape en mobile
    const esTactil = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
    if (esTactil) {
      screen.orientation?.addEventListener('change', this._onOrientationChange);
      // Si ya está en landscape al cargar, intentar fullscreen
      if (screen.orientation?.type?.includes('landscape')) {
        this._solicitarFullscreen();
      }
    }
  }

  private _onOrientationChange = () => {
    if (screen.orientation?.type?.includes('landscape')) {
      this._solicitarFullscreen();
    }
  };

  private _solicitarFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    const orientation = screen.orientation as any;
    if (orientation?.lock) {
      orientation.lock('landscape').catch(() => {});
    }
  }

  abrirMesaTruco = () => {

    this.mostrarTrucoSolo = true;

    this.game.scene.pause('GameScene');

  }

  cerrarMesaTruco = () => {

    this.mostrarTrucoSolo = false;

    this.game.scene.resume('GameScene');

  }



  ngOnDestroy(): void {

    window.removeEventListener(
      'truco-solo:start',
      this.abrirMesaTruco
    );

    window.removeEventListener(
      'truco-solo:end',
      this.cerrarMesaTruco
    );

    screen.orientation?.removeEventListener('change', this._onOrientationChange);

    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}