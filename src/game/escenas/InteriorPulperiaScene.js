import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import BaseScene from './BaseScene.js';
import Npc from '../personajes/Npc.js';
import Tutorial from '../objetos/Tutorial.js';
import Portal from '../objetos/Portal.js';
import PuntoInteraccion from '../objetos/PuntoInteraccion.js';

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
    this.load.audio('pasos', './assets/musica/sonidos/paso.ogg');
  }

  create() {
    this.botonPantallaCompleta();
    this.crearControlesMobile();
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    const map = this.make.tilemap({ key: 'mapaPulperia' });
    const barraTileSet = map.addTilesetImage('BarPulperia', 'BarPulperia');
    const paredesTileSet = map.addTilesetImage('Paredes', 'ParedesPulperia');
    const pisoTileSet = map.addTilesetImage('Piso', 'PisoPulperia');
    const rackTileSet = map.addTilesetImage('RackPulperia', 'RackPulperia');

    map.createLayer('Base', pisoTileSet);
    map.createLayer('Paredes', paredesTileSet);
    map.createLayer('Estantes', [rackTileSet, pisoTileSet]);
    const barraLayer = map.createLayer('Barra', barraTileSet);
    const marcoLayer = map.createLayer('Marco', paredesTileSet);
    const colisionesLayer = map.createLayer('Colisiones', paredesTileSet);
    colisionesLayer.setCollisionByExclusion([-1]);

    barraLayer.setDepth(2);
    marcoLayer.setDepth(3);

    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
      this.pasos,
    ).setDepth(3);

    this.JugadorPrincipal.setCollideWorldBounds(true);
    this.physics.add.collider(this.JugadorPrincipal, colisionesLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.JugadorPrincipal, true, 0.1, 0.1);

    this.JugadorPrincipal.setScale(1.8);
    this.keys = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.npc = new Npc(this, 536, 272, 'personaje').setDepth(1);

    //partes de nuestro tutoriaal
    const pasosPulperia = [
      {
        texto: '¡Hola, forastero! Bienvenido a la Pulpería del pueblo.',
        enfoqueNpc: this.npc,
      },
      {
        texto: 'Mirá, en aquella mesa del rincón podés jugar partidas en solitario.',
        enfoqueNpc: this.npc,
      },
      {
        camaraDestino: { x: 1602, y: 180 },
        camaraTiempo: 1500,
      },
      {
        texto: 'Tomate tu tiempo, explorá y divertite.',
        enfoqueNpc: this.npc,
        seguirJugador: true,
      },
    ];

    //mientras lo guardamos en el localStorage, después tendríamos que mandarlo a la base de datos!!!!!!!!!
    this.tutorial = new Tutorial(this, 'tutorial_pulperia_v1', pasosPulperia, true);
    this.tutorial.iniciar();

    this.salirAfuera = new Portal(this, 644, 656, 'MapaPrincipal', false, { x: 1600, y: 170 });
    this.physics.add.overlap(this.JugadorPrincipal, this.salirAfuera.zone);

    this.puntosDeInteraccion = [];

    this.puntosDeInteraccion.push(new PuntoInteraccion(this, 500, 290, 'tienda', false, {}));

    this.puntosDeInteraccion.push(new PuntoInteraccion(this, 1600, 180, 'partida-solo', false, {}));
  }

  update() {
    if (this.tutorial && this.tutorial.activo) {
      this.tutorial.update();
    } else {
      this.JugadorPrincipal.update(this.keys, this.teclaE);

      const interactuoMobile = this.botonInteractuarPresionado;

      const seMueve =
        this.JugadorPrincipal.body.velocity.x !== 0 || this.JugadorPrincipal.body.velocity.y !== 0;
      if (seMueve) {
        this.estabaMoviendose = true;
      } else if (this.estabaMoviendose) {
        console.log(
          `📍 X: ${Math.round(this.JugadorPrincipal.x)}, Y: ${Math.round(this.JugadorPrincipal.y)}`,
        );
        this.estabaMoviendose = false;
      }

      this.puntosDeInteraccion.forEach((punto) => {
        punto.update(this.JugadorPrincipal, this.teclaE, interactuoMobile);
      });

      this.salirAfuera.update(this.JugadorPrincipal, this.teclaE, interactuoMobile);

      this.botonInteractuarPresionado = false;
    }
  }
}
