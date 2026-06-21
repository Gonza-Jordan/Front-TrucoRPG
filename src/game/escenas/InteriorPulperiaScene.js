import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import BaseScene from './BaseScene.js';
import Npc from '../personajes/Npc.js';
import Tutorial from '../objetos/Tutorial.js';
import Portal from '../objetos/Portal.js';
import PuntoInteraccion from '../objetos/PuntoInteraccion.js';
import MesaManager from '../objetos/mesaManager.js';
import { TUTORIALES } from '../data/tutoriales.js';

export default class InteriorPulperiaScene extends BaseScene {
  constructor() {
    super('InteriorPulperiaScene');
    this.timerBuscarSalas = null;
    this.mesaManager = null;
  }

  init(data) {
    this.playerKey = data.playerSprite || 'player';
    this.startX = data.x || 85;
    this.startY = data.y || 470;
  }

  preload() {
    this.load.audio('pasos', './assets/musica/sonidos/paso.ogg');
    this.load.image('mesa_juego', './assets/objetos/mesa.png');
  }

  async create() {
    this.botonPantallaCompleta();
    this.crearControlesMobile();
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    const map = this.make.tilemap({ key: 'mapaPulperia' });
    const barraTileSet = map.addTilesetImage('BarPulperia', 'BarPulperia');
    const paredesTileSet = map.addTilesetImage('Paredes', 'ParedesPulperia');
    const pisoTileSet = map.addTilesetImage('Piso', 'PisoPulperia');
    const rackTileSet = map.addTilesetImage('RackPulperia', 'RackPulperia');
    const perchaTileSet = map.addTilesetImage('percha','percha');
    const alfombraTileSet = map.addTilesetImage('alfombra','alfombra');

    map.createLayer('Base', pisoTileSet);
    map.createLayer('Paredes', paredesTileSet);
    map.createLayer('Estantes', [rackTileSet, pisoTileSet]);
    const barraLayer = map.createLayer('Barra', [barraTileSet,alfombraTileSet,perchaTileSet]);
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

    const pasosCargados = TUTORIALES.pulperia.map((paso) => {
      if (paso.enfoque === 'npc') {
        return { ...paso, enfoqueNpc: this.npc };
      }
      return paso;
    });

    this.tutorial = new Tutorial(this, 'tutorialPulperia', pasosCargados, true);
    this.tutorial.iniciar();

    this.salirAfuera = new Portal(this, 644, 656, 'MapaPrincipal', false, { x: 1600, y: 170 });
    this.physics.add.overlap(this.JugadorPrincipal, this.salirAfuera.zone);

    this.puntosDeInteraccion = [
      new PuntoInteraccion(this, 536, 378, 'tienda', false, {}),
      new PuntoInteraccion(this, 1600, 180, 'partida-solo', 'mesa_juego',0.9, {}),
      new PuntoInteraccion(this, 1400, 180, 'multijugador', 'mesa_juego',0.9, { subVista: 'tipo' }),
    ];

    const estiloVineta = {
      fontFamily: 'Jersey 20',
      fontSize: '14px',
      color: '#ffe8a0',
      backgroundColor: '#3a1e00cc',
      stroke: '#000000',
      strokeThickness: 2,
      padding: { x: 10, y: 5 },
    };
    this.add.text(1400, 118, 'Multijugador', estiloVineta).setOrigin(0.5).setDepth(5);
    this.add.text(1600, 118, 'Solitario',    estiloVineta).setOrigin(0.5).setDepth(5);

    const salaService = this.game.registry.get('salaService');
    const uiService = this.game.registry.get('uiService');

    this.mesaManager = new MesaManager(this, this.JugadorPrincipal, salaService, uiService);

    if (salaService) {
      try {
        await salaService.conectar();
        await this.mesaManager.actualizarMesas();

        this.timerBuscarSalas = this.time.addEvent({
          delay: 10000,
          callback: this.mesaManager.actualizarMesas,
          callbackScope: this.mesaManager,
          loop: true,
        });
      } catch (error) {
        console.error('No se pudo conectar al SalaService desde Phaser:', error);
      }
    }

    this.onStartMatchBound = this.manejarInicioPartida.bind(this);
    window.addEventListener('start-multiplayer-match', this.onStartMatchBound);
  }

  manejarInicioPartida() {
    if (this.timerBuscarSalas) this.timerBuscarSalas.destroy();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.route.navigate.start('TrucoPartidaMultiplayerScene', {
        salaService: this.game.registry.get('salaService'),
      });
    });
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

  shutdown() {
    if (this.timerBuscarSalas) this.timerBuscarSalas.destroy();
    if (this.mesaManager) this.mesaManager.destroy();
    if (this.onStartMatchBound) {
      window.removeEventListener('start-multiplayer-match', this.onStartMatchBound);
    }
  }
}
