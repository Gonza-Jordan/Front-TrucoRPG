import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
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
  @ViewChild('gameContainer') gameContainer!: ElementRef;

  private game: any = null;
  private router = inject(Router);

  // Handler guardado como propiedad para poder hacer removeEventListener
  private onTrucoSoloStart = (e: Event) => {
    // Destruir Phaser antes de navegar para liberar recursos
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    this.router.navigate(['/truco-solo']);
  };

  async ngAfterViewInit(): Promise<void> {
    // Escuchar el evento que dispara GameScene.js al presionar E sobre el troll
    window.addEventListener('truco-solo:start', this.onTrucoSoloStart);

    // Importación dinámica para no bloquear el arranque de Angular
    const { initGame } = await import('../../game/main.js');
    this.game = initGame('contenedor-juego');
  }

  ngOnDestroy(): void {
    window.removeEventListener('truco-solo:start', this.onTrucoSoloStart);
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
