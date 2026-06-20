import { Injectable } from '@angular/core';
import { initHistoria } from '../../../game/historiaConfig.js';
import { personajePorId } from '../../../game/data/personaje.js';
import { claseHeroePorHabilidadId } from '../../../game/data/habilidades.js';

@Injectable({
  providedIn: 'root',
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
    return 'personaje';
  }

  iniciarJuego(contenedorId: string, salaService: any, uiService: any): void {
    if (this.juegoInstance) {
      this.destruirJuego();
    }

    this.juegoInstance = initHistoria(contenedorId, salaService, uiService);

    const spriteKey = this.obtenerSpriteKey();
    const claseHeroe = this.habilidadSeleccionada
      ? claseHeroePorHabilidadId(this.habilidadSeleccionada)
      : null;

    this.juegoInstance.registry.set('playerSprite', spriteKey);
    this.juegoInstance.registry.set('playerAbility', this.habilidadSeleccionada ?? 'Ninguna');
    this.juegoInstance.registry.set('claseHeroe', claseHeroe);
  }

  obtenerJuego(): any {
    return this.juegoInstance;
  }

  pausarEscena(key: string): void {
    this.juegoInstance?.scene.pause(key);
  }

  reanudarEscena(key: string): void {
    this.juegoInstance?.scene.resume(key);
  }

  private readonly escenasMapa = [
    'MapaPrincipal',
    'MapaAventura1',
    'MapaAventura2',
    'MapaAventura3',
    'InteriorCasa',
    'InteriorPulperia',
  ];

  obtenerEscenaMapaActiva(): string {
    if (this.juegoInstance) {
      for (const key of this.escenasMapa) {
        const scene = this.juegoInstance.scene.getScene(key);
        if (scene?.scene?.isActive()) {
          return key;
        }
      }
    }
    return localStorage.getItem('historiaMapaEscena') ?? 'MapaAventura1';
  }

  pausarEscenaMapaActiva(): void {
    const key = this.obtenerEscenaMapaActiva();
    localStorage.setItem('historiaMapaEscena', key);
    this.pausarEscena(key);
  }

  reanudarEscenaMapaTrasCombate(): void {
    const key = localStorage.getItem('historiaMapaEscena') ?? this.obtenerEscenaMapaActiva();
    this.reanudarEscena(key);
    window.dispatchEvent(new Event('resize'));
  }

  destruirJuego(): void {
    if (this.juegoInstance) {
      this.juegoInstance.destroy(true);
      this.juegoInstance = null;
    }
  }
}
