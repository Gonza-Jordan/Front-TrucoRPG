import Phaser from 'phaser';

export default class PuntoInteraccion {
  /**
   * @param {Phaser.Scene} escena
   * @param {number} x
   * @param {number} y
   * @param {string} tipoVista
   * @param {string|null|undefined} texturaSprite
   * @param {Object|undefined} datosExtra
   */

  constructor(escena, x, y, tipoVista, texturaSprite, datosExtra = {}) {
    this.escena = escena;
    this.tipoVista = tipoVista;
    this.datosExtra = datosExtra;
    this.cercaDelObjeto = false;

    if (
      typeof texturaSprite === 'string' &&
      texturaSprite.trim() !== '' &&
      texturaSprite !== 'false'
    ) {
      this.sprite = this.escena.add.image(x, y, texturaSprite).setScale(0.8).setDepth(0);
    }

    this.zone = this.escena.add.zone(x, y, 24, 24);
    this.escena.physics.add.existing(this.zone);
    this.zone.body.setSize(16, 16);
    this.zone.body.setAllowGravity(false);
    this.zone.body.moves = false;

    this.textoE = this.escena.add
      .text(x, y - 50, 'E', {
        fontFamily: '"Jersey 10"',
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#573a04',
        stroke: '#000000',
        strokeThickness: 3,
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setVisible(false);

    window.addEventListener('resume-game', () => {
      if (this.escena && this.escena.physics.world) {
        this.escena.physics.world.resume();
      }
    });
  }

  update(jugador, teclaE, interactuoMobile = false) {
    if (!jugador || !jugador.body) return;

    const enZona = this.escena.physics.overlap(jugador, this.zone);

    if (enZona && !this.cercaDelObjeto) {
      this.cercaDelObjeto = true;
      this.textoE.setVisible(true);
    }

    if (enZona) {
      this.textoE.x = jugador.x;
      this.textoE.y = jugador.y - 55;

      const quiereInteractuar = Phaser.Input.Keyboard.JustDown(teclaE) || interactuoMobile;

      if (quiereInteractuar) {
        jugador.setVelocity(0);
        this.escena.physics.world.pause();

        const eventoUi = new CustomEvent('game-interact', {
          detail: {
            vista: this.tipoVista,
            datos: this.datosExtra,
          },
        });
        window.dispatchEvent(eventoUi);
      }
    } else {
      if (this.cercaDelObjeto) {
        this.cercaDelObjeto = false;
        this.textoE.setVisible(false);
      }
    }
  }
}
