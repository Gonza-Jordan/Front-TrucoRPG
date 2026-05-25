import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],

  template: `
    <div id="contenedor-juego" #gameContainer></div>
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

  constructor(private route: ActivatedRoute) {}

  async ngAfterViewInit(): Promise<void> {

    // Import dinámico de Phaser
    const { initGame } = await import('../../game/main.js');

    // Obtener modo desde la URL
    // /game/maquina
    // /game/multi
    const modo =
      this.route.snapshot.paramMap.get('modo') || 'maquina';

    // Iniciar Phaser
    this.game = initGame('contenedor-juego', modo);
  }

  ngOnDestroy(): void {

    // Destruir Phaser al salir del componente
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}