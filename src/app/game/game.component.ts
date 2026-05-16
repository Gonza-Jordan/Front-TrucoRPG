import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  async ngAfterViewInit(): Promise<void> {
    // Importación dinámica para no bloquear el arranque de Angular
    const { initGame } = await import('../../game/main.js');
    this.game = initGame('contenedor-juego');
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
