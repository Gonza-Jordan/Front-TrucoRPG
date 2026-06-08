import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import BaseScene from './BaseScene.js';

export default class InteriorPulperiaScene extends BaseScene {
  constructor() {
    super('InteriorPulperiaScene');
  }

  init(data) {
    this.playerKey = data.playerSprite || 'player';
    this.startX = data.x || 85;
    this.startY = data.y || 470;
  }

  preload() {
    this.load.image('Piso', './assets/objetos/piso.png');
    this.load.image('cartel', './assets/mapa-principal/Cartel.png');
  }

  create() {
    this.botonPantallaCompleta();
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, 'Piso')
      .setOrigin(0)
      .setDepth(0)
      .setScale(1.2);

    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(1);

    this.add.image(621, 336, 'cartel').setDepth(0).setScale(2.5);

    this.JugadorPrincipal.setCollideWorldBounds(true);

    this.JugadorPrincipal.setScale(2);

    this.keys = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.JugadorPrincipal.update(this.keys);
  }
}
