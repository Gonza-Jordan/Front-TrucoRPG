import Phaser from 'phaser';
export default class HistoriaBootScene extends Phaser.Scene {

    constructor(){
        super('HistoriaBootScene');
    }

    preload(){
        this.load.spritesheet('nena-arco','./assets/sprites/nena-arco.png',{frameWidth:64,frameHeight:64});
        this.load.spritesheet('nena-hacha','./assets/sprites/nena-hacha.png',{frameWidth:64,frameHeight:64});
        this.load.spritesheet('nene-arco','./assets/sprites/nene-arco.png',{frameWidth:64,frameHeight:64});
        this.load.spritesheet('nene-hacha','./assets/sprites/nene-hacha.png',{frameWidth:64,frameHeight:64});

        this.load.image('pasto','./assets/objetos/pasto.png');
        
        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
    }

    
    async create(){
        await document.fonts.load('16px "Jersey 20"');
        await document.fonts.ready;

        const dummy = this.add.text(0, 0, ' ', {
            fontFamily: 'Jersey 20'
        });
        dummy.setVisible(false);

        const personajeElegido = this.registry.get('playerSprite') || 'nene-hacha';

        this.scene.start('MapaPrincipal', { playerSprite: personajeElegido });
    }
}