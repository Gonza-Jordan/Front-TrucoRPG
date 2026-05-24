import Phaser from 'phaser';
import BootScene from './escenas/BootScene.js';
import MenuScene from './escenas/MenuScene.js';
import CharacterScene from './escenas/CharacterScene.js';
import WeaponScene from './escenas/WeaponScene.js';
import LobbyScene from './escenas/LobbyScene.js';
import GameScene from './escenas/GameScene.js';
import GameScene2 from './escenas/GameScene2.js';
import BaseScene from './escenas/BaseScene.js';
import HeroSelectScene from './escenas/HeroSelectScene.js';
import TrucoMultiScene from './escenas/TrucoMultiScene.js';
import TrucoSoloScene from './escenas/TrucoSoloScene.js';

export function initGame(parent = 'contenedor-juego', modo = 'maquina') {
  const config = {
    type: Phaser.AUTO,
    callbacks: {
      postBoot: (game) => {
        game.registry.set('modo', modo);
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
      fullscreenTarget: parent,
    },
    backgroundColor: '#1a5c1a',
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scene: [
      BootScene,
      MenuScene,
      CharacterScene,
      WeaponScene,
      HeroSelectScene,
      LobbyScene,
      GameScene,
      GameScene2,
      BaseScene,
      TrucoMultiScene,
      TrucoSoloScene,
    ],
    parent,
  };

  return new Phaser.Game(config);
}
