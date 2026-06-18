export default class Tutorial {
  /**
   * @param {Phaser.Scene} escena 
   * @param {string} idTutorial
   * @param {Array<Object>} pasos
   */
  constructor(escena, idTutorial, pasos) {
    this.escena = escena;
    this.idTutorial = idTutorial;
    this.pasos = pasos;
    this.pasoActual = 0;
    this.activo = false;

    // nos fijamos si el jugador ya miró el tutorial
    this.yaVisto = localStorage.getItem(this.idTutorial) === 'true';
  }

  iniciar() {
    // si lo vio no lo mostramos y seguimos con la escena 
    if (this.yaVisto) {
      return false;
    }

    this.activo = true;
    this.pasoActual = 0;

    // bloqueamos al avatar del jugador para que no se mueva 
    if (this.escena.JugadorPrincipal && this.escena.JugadorPrincipal.body) {
      this.escena.JugadorPrincipal.setVelocity(0);
    }

    // ejecutamos el primer paso
    this.ejecutarPaso();

    this.escena.input.on('pointerdown', () => this.avanzar());
    this.teclaEspacio = this.escena.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    return true;
  }

  update() {
    if (!this.activo) return;

    // Bloqueo estricto de movimiento en el update
    if (this.escena.JugadorPrincipal) {
      this.escena.JugadorPrincipal.update(
        {
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false },
        },
        this.escena.teclaE,
      );
    }

    const paso = this.pasos[this.pasoActual];
    if (this.globoContenedor && paso && paso.enfoqueNpc) {
      this.globoContenedor.x = paso.enfoqueNpc.x;
      this.globoContenedor.y = paso.enfoqueNpc.y - 60;
    }

    if (Phaser.Input.Keyboard.JustDown(this.teclaEspacio)) {
      this.avanzar();
    }
  }

  ejecutarPaso() {
    const paso = this.pasos[this.pasoActual];

    if (paso.texto) {
      if (!this.globoContenedor) {
        this.crearGloboTexto(
          paso.enfoqueNpc || {
            x: this.escena.cameras.main.midPoint.x,
            y: this.escena.cameras.main.midPoint.y + 60,
          },
          paso.texto,
        );
      } else {
        this.textoGlobo.setText(paso.texto);
      }
    }

    if (paso.camaraDestino) {
      this.escena.cameras.main.stopFollow();
      this.escena.cameras.main.pan(
        paso.camaraDestino.x,
        paso.camaraDestino.y,
        paso.camaraTiempo || 1500,
        'Power2',
      );
    } else if (paso.seguirJugador) {
      this.escena.cameras.main.pan(
        this.escena.JugadorPrincipal.x,
        this.escena.JugadorPrincipal.y,
        1500,
        'Power2',
        false,
        (camera, progress) => {
          if (progress === 1) camera.startFollow(this.escena.JugadorPrincipal, true, 0.1, 0.1);
        },
      );
    }
  }

  avanzar() {
    if (!this.activo) return;

    this.pasoActual++;

    if (this.pasoActual < this.pasos.length) {
      this.ejecutarPaso();
    } else {
      this.finalizar();
    }
  }

  finalizar() {
    this.activo = false;

    localStorage.setItem(this.idTutorial, 'true');

    this.escena.cameras.main.startFollow(this.escena.JugadorPrincipal, true, 0.1, 0.1);

    this.escena.input.off('pointerdown');

    if (this.globoContenedor) {
      this.escena.tweens.add({
        targets: this.globoContenedor,
        alpha: 0,
        duration: 300,
        onComplete: () => this.globoContenedor.destroy(),
      });
    }
  }

  crearGloboTexto(posicion, mensaje) {
    const ancho = 160;
    const alto = 50;
    const pad = 10;
    this.globoContenedor = this.escena.add.container(posicion.x, posicion.y - 60).setDepth(100);

    const fondo = this.escena.add.graphics();
    fondo.fillStyle(0xffffff, 0.95).lineStyle(2, 0x2d1910, 1);
    const rx = -(ancho / 2) - pad;
    const ry = -alto - pad;
    const rw = ancho + pad * 2;
    const rh = alto + pad * 2;
    fondo.fillRoundedRect(rx, ry, rw, rh, 8).strokeRoundedRect(rx, ry, rw, rh, 8);

    fondo
      .beginPath()
      .moveTo(-10, ry + rh)
      .lineTo(10, ry + rh)
      .lineTo(0, ry + rh + 10)
      .closePath()
      .fillPath()
      .strokePath();

    this.textoGlobo = this.escena.add
      .text(0, ry + rh / 2, mensaje, {
        fontFamily: 'Jersey 20',
        fontSize: '15px',
        color: '#2d1910',
        align: 'center',
        wordWrap: { width: ancho },
      })
      .setOrigin(0.5);

    this.globoContenedor.add([fondo, this.textoGlobo]);
  }
}
