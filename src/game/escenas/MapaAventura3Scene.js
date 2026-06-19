import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import Portal from '../objetos/Portal.js';
import Oponente from '../personajes/Oponente.js';


export default class MapaAventura3Scene extends BaseScene {
    constructor() {
        super('MapaAventura3');
    }

    init(data) {
        this.playerKey = data.playerSprite || 'nene-hacha';
        this.startX = data.x || 1078;
        this.startY = data.y || 611;
    }

    preload() {
        this.load.audio('pasos', './assets/musica/sonidos/paso.ogg');
        this.load.spritesheet('mandinga', './assets/sprites/mandinga.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.botonPantallaCompleta();
        this.crearControlesMobile();

        // CREACION DEL MAPA

        const map = this.make.tilemap({ key: 'mapa-aventura-3' });
        console.log('map:', map);
        console.log('map.tilesets:', map?.tilesets);

        const cuevaTileset = map.addTilesetImage('Cueva', 'Cueva Av3')
        const cuevaDecoracionTileset = map.addTilesetImage('CuevaDecoracion', 'CuevaDecoracion Av3')
        const tronoTileset = map.addTilesetImage('Trono', 'Trono Av3')

        //capas principales
        const baseLayer = map.createLayer('Base', cuevaTileset);
        const caminoLayer = map.createLayer('Camino', [cuevaTileset, cuevaDecoracionTileset]);

        const piedritasLayer = map.createLayer('PiedritasPiso/Lava', cuevaTileset);
        const paredesLayer = map.createLayer('Paredes', cuevaTileset);
        const piedrasLayer = map.createLayer('Piedras', [cuevaTileset, cuevaDecoracionTileset, tronoTileset]);
        const piedras2Layer = map.createLayer('Piedras2', [cuevaTileset, cuevaDecoracionTileset]);





        //colisiones
        const colisionesLayer = map.createLayer('Colisiones', cuevaTileset);
        colisionesLayer.setCollisionByExclusion([-1]);


        //player
        this.JugadorPrincipal = new JugadorPrincipal(
            this,
            this.startX,
            this.startY,
            this.playerKey,
        ).setDepth(1);
        this.JugadorPrincipal.setCollideWorldBounds(true);

        this.physics.add.collider(this.JugadorPrincipal, colisionesLayer);

        //cam
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.JugadorPrincipal, true, 0.1, 0.1);

        //prueba para escalar el mapa
        //this.cameras.main.setZoom(1.23);
        //this.cameras.main.roundPixels = true;

        this.JugadorPrincipal.setScale(1.1);

        //controles
        this.keys = this.input.keyboard.createCursorKeys();
        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);


        //volver mapa aventura 2
        this.portalMapaAventura2 = new Portal(this, 35, 492, 'MapaAventura2', false, {
            x: 1109,
            y: 35,
        });
        this.physics.add.overlap(this.JugadorPrincipal, this.portalMapaAventura2.zone);



        //mandinga
        this.oponenteMandinga = new Oponente(this, 1068, 325, 'mandinga').setDepth(0);
        this.oponenteMandinga.setScale(1.3);
    }

    update() {
        this.JugadorPrincipal.update(this.keys, this.teclaE);

        const seMueve =
            this.JugadorPrincipal.body.velocity.x !== 0 || this.JugadorPrincipal.body.velocity.y !== 0;

        if (seMueve) {
            this.estabaMoviendose = true;
        } else if (this.estabaMoviendose) {
            const xActual = Math.round(this.JugadorPrincipal.x);
            const yActual = Math.round(this.JugadorPrincipal.y);
            console.log(`📍 Personaje parado en coordenadas -> X: ${xActual}, Y: ${yActual}`);
            this.estabaMoviendose = false;
        }

        const interactuoMobile = this.botonInteractuarPresionado;

        this.portalMapaAventura2.update(this.JugadorPrincipal, this.teclaE);
        if (this.botonInteractuarPresionado) {
            this.botonInteractuarPresionado = false;
        }

    }
}
