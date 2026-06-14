import Phaser from 'phaser';
import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import Npc from '../personajes/Npc.js';
import Portal from '../objetos/Portal.js';

const RIVAL_NAHUELITO_NIVEL = 1;
const RIVAL_POMBERITO_NIVEL = 2;

const JEFE1_X = 816;
const JEFE1_Y = 368;

// Puerta de la cueva (cerca del portal a MapaAventura2 en 1092, 131)
const JEFE2_X = 1060;
const JEFE2_Y = 155;

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

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

    const map = this.make.tilemap({ key: 'mapa-aventura-1' });

    const sueloTileset = map.addTilesetImage('Suelo', 'Suelo');
    const vegetacionTileset = map.addTilesetImage('Vegetacion', 'Vegetacion Av');
    const piedrasTileset = map.addTilesetImage('Piedras', 'Piedras Av');
    const arbol2Tileset = map.addTilesetImage('Arbol2', 'Arbol 2 Av');
    const arbol1Tileset = map.addTilesetImage('Arbol1', 'Arbol 1 Av');
    const aguaTileset = map.addTilesetImage('Agua', 'Agua');
    const fogataTileset = map.addTilesetImage('Fogata', 'Fuego Av');
    const paredesMontañaTileset = map.addTilesetImage('ParedesMontaña', 'ParedesMontaña');
    const paredesCuevaTileset = map.addTilesetImage('ParedesCueva', 'ParedesCueva');

    map.createLayer('Base', sueloTileset);
    map.createLayer('Agua', aguaTileset);
    map.createLayer('Montañas', [sueloTileset, paredesCuevaTileset, paredesMontañaTileset]);
    map.createLayer('Camino', sueloTileset);
    map.createLayer('Pasto/Vegetacion', [vegetacionTileset, piedrasTileset]);
    map.createLayer('Piedras', piedrasTileset);

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

    map.createLayer('Objetos', [fogataTileset, paredesCuevaTileset]);

    const colisionesLayer = map.createLayer('Colisiones', sueloTileset);
    colisionesLayer.setCollisionByExclusion([-1]);

    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(1);
    this.JugadorPrincipal.setCollideWorldBounds(true);

    this.physics.add.collider(this.JugadorPrincipal, colisionesLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.JugadorPrincipal, true, 0.1, 0.1);

    this.JugadorPrincipal.setScale(1.1);

    this.keys = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.portalMapaAventura2 = new Portal(this, 1092, 131, 'MapaAventura2', false, {
      x: 1078,
      y: 611,
    });
    this.physics.add.overlap(this.JugadorPrincipal, this.portalMapaAventura2.zone);

    this._crearJefeNahuelito();
    this._crearJefePomberito();

    this.puedePelearPomberito = false;
    this.cargarPuedePelearPomberito();

    this._onProgresoActualizado = () => this.cargarPuedePelearPomberito();
    this._onTrucoEnd = () => this.cargarPuedePelearPomberito();
    window.addEventListener('historia:progreso-actualizado', this._onProgresoActualizado);
    window.addEventListener('truco-solo:end', this._onTrucoEnd);
  }

  shutdown() {
    window.removeEventListener('historia:progreso-actualizado', this._onProgresoActualizado);
    window.removeEventListener('truco-solo:end', this._onTrucoEnd);
  }

  _crearJefeNahuelito() {
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

  _crearJefePomberito() {
    this.jefe2 = new Npc(this, JEFE2_X, JEFE2_Y, 'troll').setDepth(0);

    this.zonaJefe2 = this.add.zone(this.jefe2.x, this.jefe2.y, this.jefe2.width, this.jefe2.height);
    this.physics.add.existing(this.zonaJefe2);
    this.zonaJefe2.body.setAllowGravity(false);
    this.zonaJefe2.body.moves = false;

    this.mensajeJefe2 = this.add
      .text(this.jefe2.x, this.jefe2.y - this.jefe2.height / 2 - 20, '', {
        fontFamily: '"Jersey 10"',
        fontSize: '18px',
        color: '#000',
        backgroundColor: '#fff',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(10);

    this.estaEnZonaJefe2 = false;
    this.physics.add.overlap(
      this.JugadorPrincipal,
      this.zonaJefe2,
      () => {
        this.estaEnZonaJefe2 = true;
      },
      null,
      this,
    );
  }

  async cargarPuedePelearPomberito() {
    try {
      const res = await fetch(
        `/api/historia/rivales/${RIVAL_POMBERITO_NIVEL}/puede-pelear`,
        { headers: authHeaders() },
      );
      if (!res.ok) return;

      const data = await res.json();
      this.puedePelearPomberito = !!data.puedePelear;
      this.motivoBloqueoPomberito = data.motivo ?? null;
      this.actualizarMensajePomberito();
    } catch {
      this.puedePelearPomberito = false;
      this.actualizarMensajePomberito();
    }
  }

  actualizarMensajePomberito() {
    if (!this.mensajeJefe2) return;

    if (this.puedePelearPomberito) {
      this.mensajeJefe2.setText(
        this.esTactil
          ? '¡Tocá "Interactuar" para desafiar a El Pomberito!'
          : '¡Presioná E para desafiar a El Pomberito!',
      );
    } else {
      this.mensajeJefe2.setText('Derrotá al Nahuelito antes de enfrentar a El Pomberito.');
    }
  }

  iniciarPelea(rivalNivel) {
    if (this.claseHeroe !== null) {
      localStorage.setItem('heroeId', String(this.claseHeroe));
    }
    localStorage.setItem('rivalNivel', String(rivalNivel));
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
      this.estabaMoviendose = false;
    }

    const interactuoMobile = this.botonInteractuarPresionado;

    this.portalMapaAventura2.update(
      this.JugadorPrincipal,
      this.teclaE,
      interactuoMobile,
    );

    this.mensajeJefe1.setVisible(this.estaEnZonaJefe1);
    this.mensajeJefe2.setVisible(this.estaEnZonaJefe2);

    const interactuar =
      Phaser.Input.Keyboard.JustDown(this.teclaE) ||
      this.botonInteractuarPresionado;

    if (this.estaEnZonaJefe1 && interactuar) {
      this.iniciarPelea(RIVAL_NAHUELITO_NIVEL);
    }

    if (this.estaEnZonaJefe2 && interactuar) {
      if (this.puedePelearPomberito) {
        this.iniciarPelea(RIVAL_POMBERITO_NIVEL);
      }
    }

    this.botonInteractuarPresionado = false;
    this.estaEnZonaJefe1 = false;
    this.estaEnZonaJefe2 = false;
  }
}
