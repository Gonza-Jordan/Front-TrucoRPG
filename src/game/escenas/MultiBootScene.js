import Phaser from 'phaser';

export default class MultiBootScene extends Phaser.Scene {
  constructor() {
    super('MultiBootScene');
  }

  preload() {
    // Sprites del jugador
    this.load.spritesheet('personaje', './assets/sprites/personaje.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('personaje1', './assets/sprites/personaje1.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('personaje2', './assets/sprites/personaje2.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Tilemap de la pulpería (reutilizamos los mismos assets)
    this.load.tilemapTiledJSON('mapaPulperia', './assets/mapa-pulperia/interiorPulperia.json');
    this.load.image('PisoPulperia', './assets/mapa-pulperia/InteriorPulperia.png');
    this.load.image('BarPulperia', './assets/mapa-pulperia/BarPulperia.png');
    this.load.image('ParedesPulperia', './assets/mapa-pulperia/Paredes.png');
    this.load.image('RackPulperia', './assets/mapa-pulperia/RackPulperia.png');

    // Objeto mesa y audio
    this.load.image('mesa_juego', './assets/objetos/mesa.png');
    this.load.audio('pasos', './assets/musica/sonidos/paso.ogg');

    // Plugin joystick mobile
    this.load.plugin(
      'rexvirtualjoystickplugin',
      'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js',
      true,
    );
  }

  async create() {
    await document.fonts.load('16px "Jersey 20"');
    await document.fonts.ready;

    const spriteKey = this.registry.get('playerSprite') || 'personaje1';
    this.scene.start('SalaMultijugador', { playerSprite: spriteKey });
  }
}
