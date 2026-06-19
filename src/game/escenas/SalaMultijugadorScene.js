import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import BaseScene from './BaseScene.js';
import PuntoInteraccion from '../objetos/PuntoInteraccion.js';
import MesaManager from '../objetos/mesaManager.js';

export default class SalaMultijugadorScene extends BaseScene {
  constructor() {
    super('SalaMultijugador');
    this.timerBuscarSalas = null;
    this.mesaManager = null;
    this.estabaMoviendose = false;
  }

  init(data) {
    this.playerKey = data.playerSprite || 'personaje1';
    this.startX = data.x || 880;
    this.startY = data.y || 500;
  }

  async create() {
    this.botonPantallaCompleta();
    this.crearControlesMobile();
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Tilemap (reutiliza los assets de la pulpería)
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

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Jugador
    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(3);
    this.JugadorPrincipal.setCollideWorldBounds(true);
    this.physics.add.collider(this.JugadorPrincipal, colisionesLayer);
    this.cameras.main.startFollow(this.JugadorPrincipal, true, 0.1, 0.1);
    this.JugadorPrincipal.setScale(1.8);

    // Controles
    this.keys = this.input.keyboard.createCursorKeys();
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.teclaEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Título de la sala (fijo en pantalla)
    this.add
      .text(640, 30, 'SALA MULTIJUGADOR', {
        fontFamily: 'Jersey 20',
        fontSize: '28px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);

    // Texturas de sillas (generadas en runtime)
    this._generarTexturasSilla();

    // 3 mesas: una por modo
    const configMesas = [
      { x: 750,  y: 350, gameMode: '1v1', label: '1 VS 1', jugadores: 1 },
      { x: 1050, y: 350, gameMode: '2v2', label: '2 VS 2', jugadores: 2 },
      { x: 1350, y: 350, gameMode: '3v3', label: '3 VS 3', jugadores: 3 },
    ];

    configMesas.forEach(({ x, y, label, jugadores }) => {
      // Sillas
      this._dibujarSillas(x, y, jugadores);

      // Label del modo
      this.add
        .text(x, y - 82, label, {
          fontFamily: 'Jersey 20',
          fontSize: '22px',
          color: '#FFD700',
          backgroundColor: '#00000099',
          stroke: '#000000',
          strokeThickness: 3,
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setDepth(5);
    });

    this.puntosDeInteraccion = configMesas.map(({ x, y, gameMode }) =>
      new PuntoInteraccion(this, x, y, 'multijugador', 'mesa_juego', 1, {
        gameMode,
        subVista: 'tradicional',
      }),
    );

    // Texto de ayuda fijo (no sigue la cámara)
    this.add
      .text(10, 690, '[ ESC ] Volver al menú', {
        fontFamily: 'Jersey 20',
        fontSize: '16px',
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(10);

    // MesaManager para salas públicas dinámicas
    // Los anclajes hacen que cada sala pública aparezca debajo de su mesa fija
    const anclajesPorModo = {
      '1v1': { x: 750,  y: 350 },
      '2v2': { x: 1050, y: 350 },
      '3v3': { x: 1350, y: 350 },
    };
    const salaService = this.game.registry.get('salaService');
    const uiService = this.game.registry.get('uiService');
    this.mesaManager = new MesaManager(this, this.JugadorPrincipal, salaService, uiService, anclajesPorModo);

    if (salaService) {
      try {
        await salaService.conectar();
        await this.mesaManager.actualizarMesas();
        this.timerBuscarSalas = this.time.addEvent({
          delay: 3000,
          callback: this.mesaManager.actualizarMesas,
          callbackScope: this.mesaManager,
          loop: true,
        });
      } catch (e) {
        console.error('Error al conectar SalaService en SalaMultijugador:', e);
      }
    }

    window.addEventListener('resume-game', this._onResumeGame);
  }

  _onResumeGame = () => {
    if (this.physics && this.physics.world) {
      this.physics.world.resume();
    }
    // Refresca la lista de salas públicas al cerrar el overlay
    if (this.mesaManager) {
      this.mesaManager.actualizarMesas().catch(() => {});
    }
  };

  update() {
    if (!this.JugadorPrincipal || !this.JugadorPrincipal.body) return;

    // ESC: salir al menú Angular
    if (Phaser.Input.Keyboard.JustDown(this.teclaEsc)) {
      window.dispatchEvent(new CustomEvent('multi-room:exit'));
      return;
    }

    this.JugadorPrincipal.update(this.keys, this.teclaE);
    const interactuoMobile = this.botonInteractuarPresionado;

    const seMueve =
      this.JugadorPrincipal.body.velocity.x !== 0 ||
      this.JugadorPrincipal.body.velocity.y !== 0;
    if (seMueve) {
      this.estabaMoviendose = true;
    } else if (this.estabaMoviendose) {
      this.estabaMoviendose = false;
    }

    this.puntosDeInteraccion.forEach((punto) => {
      punto.update(this.JugadorPrincipal, this.teclaE, interactuoMobile);
    });

    this.botonInteractuarPresionado = false;
  }

  /** Genera dos texturas reutilizables: silla mirando al norte y al sur */
  _generarTexturasSilla() {
    const W = 26;  // ancho silla
    const H = 22;  // alto silla
    const ASIENTO  = 0x8B5E3C;
    const RESPALDO = 0x4A2808;
    const BORDE    = 0x2D1804;

    // silla_n → respaldo arriba (para sillas por encima de la mesa)
    if (!this.textures.exists('silla_n')) {
      const gn = this.make.graphics({ x: 0, y: 0, add: false });
      gn.fillStyle(BORDE);    gn.fillRect(0, 0, W, H);
      gn.fillStyle(RESPALDO); gn.fillRect(1, 1, W - 2, 7);
      gn.fillStyle(ASIENTO);  gn.fillRect(1, 8, W - 2, H - 9);
      gn.generateTexture('silla_n', W, H);
      gn.destroy();
    }

    // silla_s → respaldo abajo (para sillas por debajo de la mesa)
    if (!this.textures.exists('silla_s')) {
      const gs = this.make.graphics({ x: 0, y: 0, add: false });
      gs.fillStyle(BORDE);    gs.fillRect(0, 0, W, H);
      gs.fillStyle(ASIENTO);  gs.fillRect(1, 1, W - 2, H - 9);
      gs.fillStyle(RESPALDO); gs.fillRect(1, H - 8, W - 2, 7);
      gs.generateTexture('silla_s', W, H);
      gs.destroy();
    }
  }

  /**
   * Dibuja `n` sillas arriba y `n` sillas abajo de la mesa en (x, y).
   * @param {number} x
   * @param {number} y
   * @param {number} n - jugadores por equipo (1, 2 o 3)
   */
  _dibujarSillas(x, y, n) {
    const sep    = 32;  // separación horizontal entre sillas
    const offsetY = 48; // distancia vertical desde el centro de la mesa

    for (let i = 0; i < n; i++) {
      const dx = (i - (n - 1) / 2) * sep;

      // Silla arriba de la mesa (respaldo al norte)
      this.add.image(x + dx, y - offsetY, 'silla_n').setDepth(1);

      // Silla abajo de la mesa (respaldo al sur)
      this.add.image(x + dx, y + offsetY, 'silla_s').setDepth(2);
    }
  }

  shutdown() {
    if (this.timerBuscarSalas) this.timerBuscarSalas.destroy();
    if (this.mesaManager) this.mesaManager.destroy();
    window.removeEventListener('resume-game', this._onResumeGame);
  }
}
