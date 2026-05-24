import BaseScene from "./BaseScene.js";

export default class WeaponScene extends BaseScene {
    constructor() {
        super('WeaponScene');
    }

    init(data) {
        this.player = data.player;
        this.modo = data.modo || 'maquina';
    }

    create() {
        this.botonPantallaCompleta();

        this.add.text(640, 210, 'ELEGI TU ARMA', {
            fontFamily: '"Jersey 10"',
            fontSize: '35px',
            fill: '#000000'
        }).setOrigin(0.5);

        const hacha = this.add.image(540, 330, 'hacha').setOrigin(0.5).setInteractive();
        const arco  = this.add.image(740, 330, 'arco').setOrigin(0.5).setInteractive();

        hacha.on('pointerdown', () => this.irASiguiente(`${this.player}-hacha`));
        arco.on('pointerdown',  () => this.irASiguiente(`${this.player}-arco`));
    }

    irASiguiente(finalSprite) {
        if (this.modo === 'multijugador') {
            this.scene.start('LobbyScene', { playerSprite: finalSprite });
        } else {
            this.scene.start('HeroSelectScene', { playerSprite: finalSprite });
        }
    }
}
