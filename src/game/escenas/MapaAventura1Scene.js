import Phaser from 'phaser';
import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import Oponente from '../personajes/Oponente.js';
import Portal from '../objetos/Portal.js';
import ZonaInteraccionNpc from '../objetos/ZonaInteraccionNpc.js';

const RIVAL_NAHUELITO_NIVEL = 1;
const RIVAL_POMBERITO_NIVEL = 2;

const JEFE1_X = 937;
const JEFE1_Y = 499;

const JEFE2_X = 1085;
const JEFE2_Y = 200;

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
    this.load.spritesheet('nahuelito', './assets/sprites/nahuelito.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('pomberito', './assets/sprites/pomberito.png', { frameWidth: 64, frameHeight: 64 });
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

    // portal mapa aventura 2
    this.portalMapaAventura2 = new Portal(this, 1092, 131, 'MapaAventura2', false, {
      x: 1078,
      y: 611,
    });
    this.physics.add.overlap(this.JugadorPrincipal, this.portalMapaAventura2.zone);

    // portal volver al mapa principal
    this.portalMapaPrincipal = new Portal(this, 35, 552, 'MapaPrincipal', false, {
      x: 1917,
      y: 352,
    });
    this.physics.add.overlap(this.JugadorPrincipal, this.portalMapaPrincipal.zone);

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
    this.oponenteNahuelito = new Oponente(this, JEFE1_X, JEFE1_Y, 'nahuelito').setDepth(0);
    this.oponenteNahuelito.setScale(2);
    this.zonaJefe1 = new ZonaInteraccionNpc(this, JEFE1_X, JEFE1_Y);
  }

  _crearJefePomberito() {
    this.oponentePomberito = new Oponente(this, JEFE2_X, JEFE2_Y, 'pomberito').setDepth(0);
    this.oponentePomberito.setScale(1);
    this.zonaJefe2 = new ZonaInteraccionNpc(this, JEFE2_X, JEFE2_Y);
    this.etiquetaBloqueoPomberito = this.add
      .text(JEFE2_X, JEFE2_Y - 55, 'Derrotá al Nahuelito antes', {
        fontFamily: '"Jersey 10"',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#573a04',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(10);
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
      this._actualizarEtiquetaBloqueoPomberito();
    } catch {
      this.puedePelearPomberito = false;
      this._actualizarEtiquetaBloqueoPomberito();
    }
  }

  _actualizarEtiquetaBloqueoPomberito() {
    if (!this.etiquetaBloqueoPomberito) return;
    this.etiquetaBloqueoPomberito.setVisible(!this.puedePelearPomberito);
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

    this.portalMapaAventura2.update(this.JugadorPrincipal, this.teclaE, interactuoMobile);
    this.portalMapaPrincipal.update(this.JugadorPrincipal, this.teclaE, interactuoMobile);

    const enZonaJefe1 = this.zonaJefe1.update(this.JugadorPrincipal);
    const enZonaJefe2 = this.zonaJefe2.update(
      this.JugadorPrincipal,
      this.puedePelearPomberito,
    );

    const interactuar =
      Phaser.Input.Keyboard.JustDown(this.teclaE) ||
      this.botonInteractuarPresionado;

    if (enZonaJefe1 && interactuar) {
      this.iniciarPelea(RIVAL_NAHUELITO_NIVEL);
    }

    if (enZonaJefe2 && interactuar && this.puedePelearPomberito) {
      this.iniciarPelea(RIVAL_POMBERITO_NIVEL);
    }

    this.botonInteractuarPresionado = false;
  }
}
