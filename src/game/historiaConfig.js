import Phaser from 'phaser';
import BaseScene from './escenas/BaseScene.js';
import HistoriaBootScene from './escenas/HistoriaBootScene.js';
import MapaPrincipalScene from './escenas/MapaPrincipalScene.js';
import InteriorCasaScene from './escenas/InteriorCasaScene.js';
import InteriorPulperiaScene from './escenas/InteriorPulperiaScene.js';
import MapaAventura1Scene from './escenas/MapaAventura1Scene.js';


export function initHistoria(parent = 'contenedor-juego') {
  const config = {
    type: Phaser.AUTO,
    callbacks: {
      postBoot: (game) => {
        const esTactil =
          navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
        if (esTactil && screen.orientation?.lock) {
          screen.orientation.lock('landscape').catch(() => { });
        }
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
      fullscreenTarget: 'contenedor-juego-completo',
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scene: [HistoriaBootScene, MapaPrincipalScene, BaseScene, InteriorCasaScene, InteriorPulperiaScene, MapaAventura1Scene],
    parent,


    //para que no se rompan los assets con zoom
    //antialias: false,
    //pixelArt: true,

  };

  return new Phaser.Game(config);
}
