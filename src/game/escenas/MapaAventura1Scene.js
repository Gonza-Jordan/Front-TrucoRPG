import Phaser from 'phaser';
import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import Npc from '../personajes/Npc.js';
import Portal from '../objetos/Portal.js';
const RIVAL_NAHUELITO_NIVEL = 1;

const JEFE1_X = 816;
const JEFE1_Y = 368;

export default class MapaAventura1Scene extends BaseScene {
  constructor() {
    super('MapaAventura1');
  }

  init(data) {
    this.playerKey = data.playerSprite || this.registry.get('playerSprite') || 'nene-hacha';
    this.startX = data.x ?? 85;
    this.startY = data.y ?? 470;
    this.claseHeroe = data.claseHeroe ?? this.registry.get('claseHeroe') ?? null;
  }

  preload() {
    this.load.audio('pasos', './assets/musica/sonidos/paso.ogg');
  }

  create() {
    this.botonPantallaCompleta();
    this.crearControlesMobile();
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // CREACION DEL MAPA

    const map = this.make.tilemap({ key: 'mapa-aventura-1' }); // ✅ key del BootScene
    console.log('map:', map);
    console.log('map.tilesets:', map?.tilesets);

    const sueloTileset = map.addTilesetImage('Suelo', 'Suelo');
    const vegetacionTileset = map.addTilesetImage('Vegetacion', 'Vegetacion Av');
    const piedrasTileset = map.addTilesetImage('Piedras', 'Piedras Av');
    const arbol2Tileset = map.addTilesetImage('Arbol2', 'Arbol 2 Av');
    const arbol1Tileset = map.addTilesetImage('Arbol1', 'Arbol 1 Av');
    const aguaTileset = map.addTilesetImage('Agua', 'Agua');
    const fogataTileset = map.addTilesetImage('Fogata', 'Fuego Av');
    const paredesMontañaTileset = map.addTilesetImage('ParedesMontaña', 'ParedesMontaña');
    const paredesCuevaTileset = map.addTilesetImage('ParedesCueva', 'ParedesCueva');

    //capas principales
    map.createLayer('Base', sueloTileset);
    map.createLayer('Agua', aguaTileset);
    map.createLayer('Montañas', [sueloTileset, paredesCuevaTileset, paredesMontañaTileset]);
    map.createLayer('Camino', sueloTileset);
    map.createLayer('Pasto/Vegetacion', [vegetacionTileset, piedrasTileset]);
    map.createLayer('Piedras', piedrasTileset);

    //capas arboles
    const arbolesLayer = map.createLayer('Arboles', [
      arbol1Tileset,
      arbol2Tileset,
      vegetacionTileset,
    ]);
    const arboles2Layer = map.createLayer('Arboles2', [
      arbol1Tileset,
      arbol2Tileset,
      vegetacionTileset,
    ]);
    const arboles3Layer = map.createLayer('Arboles 3', [arbol1Tileset, arbol2Tileset]);

    arbolesLayer.setDepth(2);
    arboles2Layer.setDepth(2);
    arboles3Layer.setDepth(2);

    //obj
    map.createLayer('Objetos', [fogataTileset, paredesCuevaTileset]);

    //colisiones
    const colisionesLayer = map.createLayer('Colisiones', sueloTileset);
    colisionesLayer.setCollisionByExclusion([-1]);

    console.log(vegetacionTileset);
    console.log(arbol1Tileset);
    console.log(arbol2Tileset);

    //player
    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(1);
    this.JugadorPrincipal.setCollideWorldBounds(true);

    this.physics.add.collider(this.JugadorPrincipal, colisionesLayer);

    //cam
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.JugadorPrincipal, true, 0.1, 0.1);

    //prueba para escalar el mapa
    //this.cameras.main.setZoom(1.23);
    //this.cameras.main.roundPixels = true;

    this.JugadorPrincipal.setScale(1.1);

    //controles
    this.keys = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // TODO: agregar portales según el diseño del mapa
    // this.portalDeVuelta = new Portal(
    //   this,
    //   X, Y,
    //   'MapaPrincipal',
    //   false,
    //   { x: 1917, y: 323 },
    // );
    // this.physics.add.overlap(this.JugadorPrincipal, this.portalDeVuelta.zone);

    // TODO: agregar portales según el diseño del mapa
    this.portalMapaAventura2 = new Portal(this, 1092, 131, 'MapaAventura2', false, {
      x: 1078,
      y: 611,
    });
    this.physics.add.overlap(this.JugadorPrincipal, this.portalMapaAventura2.zone);

    this.jefe1 = new Npc(this, JEFE1_X, JEFE1_Y, 'troll').setDepth(0);

    this.zonaJefe1 = this.add.zone(this.jefe1.x, this.jefe1.y, this.jefe1.width, this.jefe1.height);
    this.physics.add.existing(this.zonaJefe1);
    this.zonaJefe1.body.setAllowGravity(false);
    this.zonaJefe1.body.moves = false;

    const mensajeJefe1 = this.esTactil
      ? '¡Tocá "Interactuar" para desafiar al Nahuelito!'
      : '¡Presioná E para desafiar al Nahuelito!';
    this.mensajeJefe1 = this.add
      .text(this.jefe1.x, this.jefe1.y - this.jefe1.height / 2 - 20, mensajeJefe1, {
        fontFamily: '"Jersey 10"',
        fontSize: '18px',
        color: '#000',
        backgroundColor: '#fff',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(10);
    this.estaEnZonaJefe1 = false;
    this.physics.add.overlap(
      this.JugadorPrincipal,
      this.zonaJefe1,
      () => {
        this.estaEnZonaJefe1 = true;
      },
      null,
      this,
    );
  }

  iniciarPeleaNahuelito() {
    if (this.claseHeroe !== null) {
      localStorage.setItem('heroeId', String(this.claseHeroe));
    }
    localStorage.setItem('rivalNivel', String(RIVAL_NAHUELITO_NIVEL));
    localStorage.setItem('historiaPartida', '1');
    window.dispatchEvent(new CustomEvent('truco-solo:start'));
  }

  update() {
    this.JugadorPrincipal.update(this.keys, this.teclaE);

    const seMueve =
      this.JugadorPrincipal.body.velocity.x !== 0 || this.JugadorPrincipal.body.velocity.y !== 0;

    if (seMueve) {
      this.estabaMoviendose = true;
    } else if (this.estabaMoviendose) {
      const xActual = Math.round(this.JugadorPrincipal.x);
      const yActual = Math.round(this.JugadorPrincipal.y);
      console.log(`📍 Personaje parado en coordenadas -> X: ${xActual}, Y: ${yActual}`);
      this.estabaMoviendose = false;
    }

const interactuoMobile = this.botonInteractuarPresionado;

this.portalMapaAventura2.update(
  this.JugadorPrincipal,
  this.teclaE,
  interactuoMobile
);

this.mensajeJefe1.setVisible(this.estaEnZonaJefe1);

const interactuar =
  Phaser.Input.Keyboard.JustDown(this.teclaE) ||
  this.botonInteractuarPresionado;

if (this.estaEnZonaJefe1 && interactuar) {
  this.iniciarPeleaNahuelito();
}

this.botonInteractuarPresionado = false;
this.estaEnZonaJefe1 = false;
  }
}
