import { Injectable } from '@angular/core';
import { initHistoria } from '../../../game/historiaConfig.js';

@Injectable({
  providedIn: 'root'
})
export class HistoriaService {
  private juegoInstance: any = null;
  private heroeIdSeleccionado: number | null = null;

  constructor() {}

  setHeroeSeleccionado(id: number): void {
    this.heroeIdSeleccionado = id;
  }

  obtenerSpriteKey(): string {
    const mapeo: { [key: number]: string } = {
      0: 'nene-hacha',
      1: 'nena-hacha',
      2: 'nene-arco',
      3: 'nena-arco',
    };
    return mapeo[this.heroeIdSeleccionado ?? 0];
  }

  iniciarJuego(contenedorId: string): void {
    if (this.juegoInstance) {
      this.destruirJuego();
    }

    this.juegoInstance = initHistoria(contenedorId);

    const spriteKey = this.obtenerSpriteKey();
    this.juegoInstance.registry.set('playerSprite', spriteKey);
  }

  destruirJuego(): void {
    if (this.juegoInstance) {
      this.juegoInstance.destroy(true);
      this.juegoInstance = null;
    }
  }
}