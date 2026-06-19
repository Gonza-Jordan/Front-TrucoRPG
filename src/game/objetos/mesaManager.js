export default class MesaManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} jugador
   * @param {*} salaService
   * @param {*} uiService
   * @param {Object|null} anclajesPorModo - opcional. Si se pasa, ubica cada sala
   *   pública debajo de la mesa fija del modo correspondiente.
   *   Formato: { '1v1': {x, y}, '2v2': {x, y}, '3v3': {x, y} }
   */
  constructor(scene, jugador, salaService, uiService, anclajesPorModo = null) {
    this.scene = scene;
    this.jugador = jugador;
    this.salaService = salaService;
    this.uiService = uiService;
    this.anclajesPorModo = anclajesPorModo;

    this.mesasPublicasGroup = this.scene.physics.add.group();

    this._onSalaActualizada = () => this.actualizarMesas().catch(() => {});
    window.addEventListener('sala-lista-actualizada', this._onSalaActualizada);
  }

  async actualizarMesas() {
    if (!this.salaService) return;

    try {
      const [s1, s2, s3] = await Promise.all([
        this.salaService.listarSalasPublicas('1v1'),
        this.salaService.listarSalasPublicas('2v2'),
        this.salaService.listarSalasPublicas('3v3'),
      ]);

      this.mesasPublicasGroup.getChildren().forEach((mesa) => {
        const texto = mesa.getData('textoAsociado');
        const zona = mesa.getData('zonaAsociada');
        if (texto) texto.destroy();
        if (zona) zona.destroy();
      });
      this.mesasPublicasGroup.clear(true, true);

      if (this.anclajesPorModo) {
        // Modo anclado: cada sala pública aparece debajo de su mesa fija
        const salasPorModo = { '1v1': s1, '2v2': s2, '3v3': s3 };
        const OFFSET_Y  = 140; // distancia debajo de la mesa fija
        const ESPACIO_X = 110; // separación horizontal si hay varias salas del mismo modo

        Object.entries(salasPorModo).forEach(([, salas]) => {
          salas.forEach((sala, index) => {
            const ancla = this.anclajesPorModo[sala.modo || sala.gameMode];
            if (!ancla) return;
            const posX = ancla.x + (index - (salas.length - 1) / 2) * ESPACIO_X;
            const posY = ancla.y + OFFSET_Y;
            this.crearMesaDeJuego(posX, posY, sala);
          });
        });
      } else {
        // Comportamiento original (pulpería)
        const todasLasSalas = [...s1, ...s2, ...s3];
        let origenX  = 1000;
        let origenY  = 400;
        let espacioX = 140;

        todasLasSalas.forEach((sala, index) => {
          const posX = origenX + index * espacioX;
          const posY = origenY;
          this.crearMesaDeJuego(posX, posY, sala);
        });
      }
    } catch (error) {
      console.error('Error al actualizar las salas desde MesaManager:', error);
    }
  }

  crearMesaDeJuego(x, y, sala) {
    const mesa = this.mesasPublicasGroup.create(x, y, 'mesa_juego');
    mesa.setScale(1).setImmovable(true);

    const textoContador = this.scene.add
      .text(x, y - 45, `SALA: ${sala.codigo}\n${sala.jugadores}/${sala.maxJugadores}`, {
        fontFamily: 'Jersey 20',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        align: 'center',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(4);

    let zonaInteraccion = this.scene.add.zone(x, y, 90, 90);
    this.scene.physics.add.existing(zonaInteraccion);

    mesa.setData('textoAsociado', textoContador);
    mesa.setData('zonaAsociada', zonaInteraccion);

    this.scene.physics.add.overlap(this.jugador, zonaInteraccion, () => {
      const interactuoMobile = this.scene.botonInteractuarPresionado;
      if (Phaser.Input.Keyboard.JustDown(this.scene.teclaE) || interactuoMobile) {
        this.unirseASalaDesdeMesa(sala.codigo, sala.modo);
      }
    });
  }

  unirseASalaDesdeMesa(codigo, modo) {
    if (this.uiService) {
      this.jugador.body.setVelocity(0);
      this.uiService.abrirOverlay('multijugador', 'tradicional', {
        mode: 'unirse',
        codigoSugerido: codigo,
        gameMode: modo,
      });
    }
  }

  destroy() {
    window.removeEventListener('sala-lista-actualizada', this._onSalaActualizada);
    if (this.mesasPublicasGroup) {
      this.mesasPublicasGroup.clear(true, true);
    }
  }
}