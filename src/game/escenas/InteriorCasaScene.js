import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import BaseScene from './BaseScene.js';
import PuntoInteraccion from '../objetos/PuntoInteraccion.js';
import Portal from '../objetos/Portal.js';

export default class InteriorCasaScene extends BaseScene {
  constructor() {
    super('InteriorCasaScene');
  }

  init(data) {
    this.playerKey = data.playerSprite || 'player';
    this.startX = data.x || 85;
    this.startY = data.y || 470;
  }

  preload() {
    this.load.image('InteriorCasa', './assets/mapa-casa/InteriorCasa.png');
    this.load.image('Paredes', './assets/mapa-casa/Paredes.png');
    this.load.tilemapTiledJSON('mapa-casa', './assets/mapa-casa/InteriorCasa.json');
    this.load.image('cartel','./assets/mapa-principal/Cartel.png');
  }

  create() {
    this.botonPantallaCompleta();
    this.crearControlesMobile();
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    const map = this.make.tilemap({ key: 'mapa-casa' });
    const paredesTileset = map.addTilesetImage('Paredes', 'Paredes');
    const interiorCasaTileset = map.addTilesetImage('InteriorCasa', 'InteriorCasa');

    map.createLayer('Base', interiorCasaTileset);
    map.createLayer('Paredes', paredesTileset);
    map.createLayer('Marco', paredesTileset);
    map.createLayer('Muebles', interiorCasaTileset);
    map.createLayer('Muebles2', interiorCasaTileset);
    const colisiones = map.createLayer('Colisiones', paredesTileset);
    colisiones.setCollisionByExclusion([-1]);

    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(1);

    this.JugadorPrincipal.setCollideWorldBounds(true);
    this.physics.add.collider(this.JugadorPrincipal, colisiones);
    this.JugadorPrincipal.setScale(2.4);

    this.keys = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.puntosDeInteraccion = [];

    this.puntosDeInteraccion.push(
      new PuntoInteraccion(this, 1025, 224, 'inventario', false, {}));

    this.puntosDeInteraccion.push(
      new PuntoInteraccion(this, 247, 224, 'armario', false, {}));

    this.puntosDeInteraccion.push(
      new PuntoInteraccion(this, 703, 192, 'logros', false, {}));

    this.salirAfuera = new Portal(this, 644, 656, 'MapaPrincipal', false, { x: 444, y: 195 });
    this.physics.add.overlap(this.JugadorPrincipal, this.salirAfuera.zone);
  }

  update() {
    this.puntosDeInteraccion.forEach((punto) => {
      punto.update(this.JugadorPrincipal, this.teclaE);
    });

    this.JugadorPrincipal.update(this.keys, this.teclaE);

    const seMueve =
      this.JugadorPrincipal.body.velocity.x !== 0 || this.JugadorPrincipal.body.velocity.y !== 0;

    this.salirAfuera.update(this.JugadorPrincipal,this.teclaE);
  }
}
