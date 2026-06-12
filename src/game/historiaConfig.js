import Phaser from 'phaser';
import BaseScene from './escenas/BaseScene.js';
import HistoriaBootScene from './escenas/HistoriaBootScene.js';
import MapaPrincipalScene from './escenas/MapaPrincipalScene.js';
import InteriorCasaScene from './escenas/InteriorCasaScene.js';
import InteriorPulperiaScene from './escenas/InteriorPulperiaScene.js';
import MapaAventura1Scene from './escenas/MapaAventura1Scene.js';
import MapaAventura2Scene from './escenas/MapaAventura2Scene.js';

export function initHistoria(parent = 'contenedor-juego') {
  const config = {
    type: Phaser.AUTO,
    callbacks: {
      postBoot: (game) => {
        const esTactil =
          navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
        if (esTactil && screen.orientation?.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
      fullscreenTarget: 'contenedor-juego-completo',
      autoRound: true,
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scene: [
      HistoriaBootScene,
      MapaPrincipalScene,
      BaseScene,
      InteriorCasaScene,
      InteriorPulperiaScene,
      MapaAventura1Scene,
      MapaAventura2Scene,
    ],
    parent,
  };

  return new Phaser.Game(config);
}
