import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';

export default class MapaPrincipalScene extends BaseScene {
  constructor() {
    super('MapaPrincipal');
  }

  init(data) {
    this.playerKey = data.playerSprite || 'player';
    this.startX = data.x || 100;
    this.startY = data.y || 100;
  }

  create() {
    this.botonPantallaCompleta();
    this.crearControlesMobile();

    this.fondo = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, 'pasto')
      .setOrigin(0, 0);

    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(1);
    this.JugadorPrincipal.setCollideWorldBounds(true);

    this.keys = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.JugadorPrincipal.update(this.keys, this.teclaE);
  }
}
