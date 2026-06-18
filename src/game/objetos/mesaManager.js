export default class MesaManager {
  constructor(scene, jugador, salaService, uiService) {
    this.scene = scene;
    this.jugador = jugador;
    this.salaService = salaService;
    this.uiService = uiService;

    this.mesasPublicasGroup = this.scene.physics.add.group();
  }

  async actualizarMesas() {
    if (!this.salaService) return;

    try {
      const [s1, s2, s3] = await Promise.all([
        this.salaService.listarSalasPublicas('1v1'),
        this.salaService.listarSalasPublicas('2v2'),
        this.salaService.listarSalasPublicas('3v3'),
      ]);

      const todasLasSalas = [...s1, ...s2, ...s3];

      this.mesasPublicasGroup.getChildren().forEach((mesa) => {
        const texto = mesa.getData('textoAsociado');
        const zona = mesa.getData('zonaAsociada');
        if (texto) texto.destroy();
        if (zona) zona.destroy();
      });
      this.mesasPublicasGroup.clear(true, true);

      let origenX = 1000;
      let origenY = 400;
      let espacioX = 140;

      todasLasSalas.forEach((sala, index) => {
        const posX = origenX + index * espacioX;
        const posY = origenY;
        this.crearMesaDeJuego(posX, posY, sala);
      });
    } catch (error) {
      console.error('Error al actualizar las salas desde MesaManager:', error);
    }
  }

  crearMesaDeJuego(x, y, sala) {
    const mesa = this.mesasPublicasGroup.create(x, y, 'mesa_juego');
    mesa.setScale(0.09).setImmovable(true);

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
    if (this.mesasPublicasGroup) {
      this.mesasPublicasGroup.clear(true, true);
    }
  }
}