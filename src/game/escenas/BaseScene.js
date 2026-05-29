import Phaser from 'phaser';

export default class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);

    this.joystick = null;
    this.esTactil = false;
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

  botonPantallaCompleta() {
    let teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    teclaF.on('down', () => {
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
