import Phaser from 'phaser';

export default class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);

    this.joystick = null;
    this.esTactil = false;
    this.botonInteractuarPresionado = false;
  }

  crearControlesMobile() {
    const urlParams = new URLSearchParams(window.location.search);
    const forzar = urlParams.get('joystick') === '1';

    this.esTactil =
      forzar || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

    if (!this.esTactil) return;

    const width = this.scale.width;
    const height = this.scale.height;

    const rexPlugin = this.plugins.get ? this.plugins.get('rexvirtualjoystickplugin') : null;
    if (!rexPlugin) {
      console.warn('Plugin rexvirtualjoystickplugin no disponible');
      return;
    }

    this.joystick = rexPlugin.add(this, {
      x: width * 0.15,
      y: height * 0.8,

      radius: 80,

      base: this.add.circle(0, 0, 80, 0x000000, 0.4),

      thumb: this.add.circle(0, 0, 40, 0xffffff, 0.7),

      dir: '8dir',
      forceMin: 16,
    });

    console.log('Joystick activadoooo');

    this.joyStick = this.joystick;

    // ── Botón "Interactuar" (equivalente tecla E) ─────────────────
    const btnBg = this.add.rectangle(width * 0.85, height * 0.8, 130, 50, 0x000000, 0.5)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setDepth(1000)
      .setScrollFactor(0)
      .setInteractive();
    const btnTxt = this.add.text(width * 0.85, height * 0.8, '⚡ Interactuar', {
      fontFamily: '"Jersey 10"',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);

    this._btnInteractuarBg  = btnBg;
    this._btnInteractuarTxt = btnTxt;

    btnBg.on('pointerdown', () => {
      this.botonInteractuarPresionado = true;
      btnBg.setFillStyle(0x334433, 0.8);
    });
    btnBg.on('pointerup', () => btnBg.setFillStyle(0x000000, 0.5));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x000000, 0.5));

    try {
      if (this.joystick.base) {
        this.joystick.base.setDepth(1000).setScrollFactor(0).setVisible(true);
        if (this.joystick.base.setStrokeStyle) this.joystick.base.setStrokeStyle(2, 0xffffff, 0.4);
      }
      if (this.joystick.thumb) {
        this.joystick.thumb.setDepth(1001).setScrollFactor(0).setVisible(true);
        if (this.joystick.thumb.setStrokeStyle)
          this.joystick.thumb.setStrokeStyle(2, 0x000000, 0.4);
      }
      console.log(
        'Joystick base pos:',
        this.joystick.base?.x,
        this.joystick.base?.y,
        'scene size',
        width,
        height,
      );
    } catch (e) {
      console.warn('Error ajustando propiedades del joystick', e);
    }
  }

  ocultarBotonInteractuar() {
    this._btnInteractuarBg?.setVisible(false);
    this._btnInteractuarTxt?.setVisible(false);
  }

  botonPantallaCompleta() {
    let teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F, false);
    // Ignorar si el foco está en un input/textarea DOM (ej: lobby code input)
    teclaF.on('down', () => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();

        if (screen.orientation?.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      }
    });

    this.add
      .text(10, 10, '[Pantalla completa]', { fill: '0f0' })
      .setInteractive()
      .on('pointerdown', () => {
        if (!this.scale.isFullscreen) {
          this.scale.startFullscreen();
          if (screen.orientation?.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        }
      })
      .setDepth(5);
  }
}
