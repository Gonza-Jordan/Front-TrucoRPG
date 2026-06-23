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
        .text(x, y - 102, label, {
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
      new PuntoInteraccion(this, x, y, 'multijugador', 'mesa_juego', 0.9, {
        gameMode,
        subVista: 'tradicional',
      }),
    );

    // Portal de salida
    this._crearPortal(460, 430);

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
      this._salirAlMenu();
      return;
    }

    this.JugadorPrincipal.update(this.keys, this.teclaE);
    const interactuoMobile = this.botonInteractuarPresionado;

    // Portal: mostrar tooltip y detectar interacción
    if (this._portalZona) {
      const dx = this.JugadorPrincipal.x - this._portalZona.x;
      const dy = this.JugadorPrincipal.y - this._portalZona.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cerca = dist < 90;

      if (this._portalTooltip) this._portalTooltip.setVisible(cerca);

      if (cerca && (Phaser.Input.Keyboard.JustDown(this.teclaE) || interactuoMobile)) {
        this._salirAlMenu();
        return;
      }
    }

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

    // Partículas del portal orbitando
    if (this._portalParticulas && this._portalZona) {
      this._portalAngle = (this._portalAngle || 0) + 0.035;
      const { x, y } = this._portalZona;
      this._portalParticulas.forEach(({ dot, fase }) => {
        const angle = this._portalAngle + fase;
        const r = 34;
        dot.setPosition(x + Math.cos(angle) * r, y + Math.sin(angle) * r * 0.45);
      });
    }

    this.botonInteractuarPresionado = false;
  }

  _salirAlMenu() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(420, () => {
      window.dispatchEvent(new CustomEvent('multi-room:exit'));
    });
  }

  /**
   * Crea un portal animado en (x, y) que al interactuar sale al menú.
   */
  _crearPortal(x, y) {
    // ── Suelo del portal (óvalo oscuro) ──────────────────────────
    const sombra = this.add.ellipse(x, y + 36, 80, 20, 0x000000, 0.35).setDepth(1);

    // ── Glow exterior (anillo animado) ────────────────────────────
    const glowOuter = this.add.graphics().setDepth(2);
    const glowInner = this.add.graphics().setDepth(2);
    const core      = this.add.graphics().setDepth(2);

    const drawPortal = (alpha) => {
      glowOuter.clear();
      glowOuter.lineStyle(6, 0x4400cc, alpha * 0.4);
      glowOuter.strokeCircle(x, y, 44);
      glowOuter.lineStyle(4, 0x6622ff, alpha * 0.55);
      glowOuter.strokeCircle(x, y, 38);

      glowInner.clear();
      glowInner.lineStyle(5, 0x9944ff, alpha * 0.75);
      glowInner.strokeCircle(x, y, 30);
      glowInner.lineStyle(3, 0xcc88ff, alpha * 0.9);
      glowInner.strokeCircle(x, y, 22);

      core.clear();
      core.fillStyle(0x220055, alpha * 0.85);
      core.fillCircle(x, y, 18);
      core.fillStyle(0x6600cc, alpha * 0.5);
      core.fillCircle(x, y, 12);
      core.fillStyle(0xccaaff, alpha * 0.3);
      core.fillCircle(x, y, 6);
    };

    drawPortal(1);

    // Pulso de brillo
    this.tweens.add({
      targets: { v: 1 },
      v: 0.55,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (tween, target) => drawPortal(target.v),
    });

    // Partículas que orbitan (usando círculos gráficos pequeños)
    this._portalParticulas = [];
    const N = 6;
    for (let i = 0; i < N; i++) {
      const dot = this.add.graphics().setDepth(3);
      dot.fillStyle(0xddbbff, 1);
      dot.fillCircle(0, 0, 3);
      this._portalParticulas.push({ dot, fase: (i / N) * Math.PI * 2 });
    }

    // ── Label "SALIDA" ────────────────────────────────────────────
    this.add
      .text(x, y - 60, 'SALIDA', {
        fontFamily: 'Jersey 20',
        fontSize: '18px',
        color: '#cc99ff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(5);

    // ── Tooltip (oculto hasta que el jugador se acerque) ──────────
    this._portalTooltip = this.add
      .text(x, y - 78, '[ E ] Salir al menú', {
        fontFamily: 'Jersey 20',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000099',
        stroke: '#000000',
        strokeThickness: 2,
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(5)
      .setVisible(false);

    // Animación de las partículas en el update
    this._portalZona = { x, y };
    this._portalAngle = 0;
  }

  /** Genera dos texturas reutilizables: silla mirando al norte y al sur */
  _generarTexturasSilla() {
    const W = 36;  // ancho silla
    const H = 32;  // alto silla
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
    const sep    = 45;  // separación horizontal entre sillas
    const offsetY = 68; // distancia vertical desde el centro de la mesa

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
