import { Injectable } from '@angular/core';
import { initHistoria } from '../../../game/historiaConfig.js';
import { personajePorId } from '../../../game/data/personaje.js';

@Injectable({
  providedIn: 'root'
})
export class HistoriaService {
  private juegoInstance: any = null;
  private heroeIdSeleccionado: number | null = null;
  private habilidadSeleccionada: string | null = null; 

  constructor() {}

  setHeroeSeleccionado(id: number): void {
    this.heroeIdSeleccionado = id;
  }

  setHabilidadSeleccionada(habilidad: string): void {
    this.habilidadSeleccionada = habilidad;
  }

  obtenerSpriteKey(): string {
    if (this.heroeIdSeleccionado !== null) {
      const heroe = personajePorId(this.heroeIdSeleccionado);
      if (heroe && heroe.spriteKey) {
        return heroe.spriteKey;
      }
    }
    return 'nene-hacha';
  }

  iniciarJuego(contenedorId: string): void {
    if (this.juegoInstance) {
      this.destruirJuego();
    }

    this.juegoInstance = initHistoria(contenedorId);

    const spriteKey = this.obtenerSpriteKey();
    this.juegoInstance.registry.set('playerSprite', spriteKey);
    this.juegoInstance.registry.set('playerAbility', this.habilidadSeleccionada ?? 'Ninguna');
  }

  destruirJuego(): void {
    if (this.juegoInstance) {
      this.juegoInstance.destroy(true);
      this.juegoInstance = null;
    }
  }
}