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

        this.load.tilemapTiledJSON('mapa','./assets/mapa-principal/mapa-principal.json');

        this.load.image('Arbol 1','./assets/mapa-principal/Arbol1.png');
        this.load.image('Arbol 2','./assets/mapa-principal/Arbol2.png');
        this.load.image('Arbol 3','./assets/mapa-principal/Arbol3.png');
        this.load.image('Fuego','./assets/mapa-principal/Fogata.png');
        this.load.image('Gallinas','./assets/mapa-principal/Gallinitas.png');
        this.load.image('Mate','./assets/mapa-principal/mate.png');
        this.load.image('Paredes','./assets/mapa-principal/Paredes.png');
        this.load.image('Partes','./assets/mapa-principal/Partes.png');
        this.load.image('Pava','./assets/mapa-principal/pavita.png');
        this.load.image('Piedras','./assets/mapa-principal/Piedras.png');
        this.load.image('Piso 2','./assets/mapa-principal/Camino.png');
        this.load.image('Techos','./assets/mapa-principal/Techos.png');
        this.load.image('Vegetacion','./assets/mapa-principal/Vegetacion.png');

        
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