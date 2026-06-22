import Phaser from 'phaser';

export default class JugadorPrincipal extends Phaser.Physics.Arcade.Sprite {
  constructor(escena, x, y, nombre) {
    super(escena, x, y, nombre);

    this.nombre = nombre;

    escena.add.existing(this);
    escena.physics.add.existing(this);

    this.sonidoPasos = escena.sound.add('pasos', {
      loop: true,
      volume: 0.5,
    });

    this.verificarYCrearAnimaciones(escena, this.nombre);
  }

  verificarYCrearAnimaciones(escena, spriteKey) {
    if (!escena.anims.exists(`${spriteKey}-quieto`)) {
      escena.anims.create({
        key: `${spriteKey}-quieto`,
        frames: escena.anims.generateFrameNumbers(spriteKey, { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      });

      escena.anims.create({
        key: `${spriteKey}-caminando-arriba`,
        frames: escena.anims.generateFrameNumbers(spriteKey, { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });

      escena.anims.create({
        key: `${spriteKey}-caminando-abajo`,
        frames: escena.anims.generateFrameNumbers(spriteKey, { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });

      escena.anims.create({
        key: `${spriteKey}-caminando-izquierda`,
        frames: escena.anims.generateFrameNumbers(spriteKey, { start: 16, end: 19 }),
        frameRate: 8,
        repeat: -1,
      });

      escena.anims.create({
        key: `${spriteKey}-caminando-derecha`,
        frames: escena.anims.generateFrameNumbers(spriteKey, { start: 12, end: 15 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  update(keys) {
    const velocidad = 700;

    this.setVelocity(0);

    let joyStick = this.scene.joyStick;

    let moverIzquierda = keys.left.isDown || joyStick?.left;
    let moverDerecha = keys.right.isDown || joyStick?.right;
    let moverArriba = keys.up.isDown || joyStick?.up;
    let moverAbajo = keys.down.isDown || joyStick?.down;

    if (moverIzquierda) this.setVelocityX(-velocidad);
    if (moverDerecha) this.setVelocityX(velocidad);
    if (moverArriba) this.setVelocityY(-velocidad);
    if (moverAbajo) this.setVelocityY(velocidad);

    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      this.body.velocity.normalize().scale(velocidad);
    }

    const seEstaMoviendo = this.body.velocity.x !== 0 || this.body.velocity.y !== 0;

    if (seEstaMoviendo) {
      if (!this.sonidoPasos.isPlaying) {
        this.sonidoPasos.play();
      }
    } else {
      if (this.sonidoPasos.isPlaying || this.sonidoPasos.isPaused) {
        this.sonidoPasos.stop();
      }
    }

    const currentSkin = this.texture.key;
    this.verificarYCrearAnimaciones(this.scene, currentSkin);

    if (moverIzquierda) {
      this.anims.play(`${currentSkin}-caminando-izquierda`, true);
    } else if (moverDerecha) {
      this.anims.play(`${currentSkin}-caminando-derecha`, true);
    } else if (moverArriba) {
      this.anims.play(`${currentSkin}-caminando-arriba`, true);
    } else if (moverAbajo) {
      this.anims.play(`${currentSkin}-caminando-abajo`, true);
    } else {
      this.anims.play(`${currentSkin}-quieto`, true);
    }
  }
}
