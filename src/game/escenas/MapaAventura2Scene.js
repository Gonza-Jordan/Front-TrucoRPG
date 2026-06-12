import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import Portal from '../objetos/Portal.js';

export default class MapaAventura2Scene extends BaseScene {
    constructor() {
        super('MapaAventura2');
    }

    init(data) {
        this.playerKey = data.playerSprite || 'nene-hacha';
        this.startX = data.x || 1078;
        this.startY = data.y || 611;
    }

    preload() {
        this.load.audio('pasos', './assets/musica/sonidos/paso.ogg');
    }

    create() {
        this.botonPantallaCompleta();
        this.crearControlesMobile();

        // CREACION DEL MAPA

        const map = this.make.tilemap({ key: 'mapa-aventura-2' });
        console.log('map:', map);
        console.log('map.tilesets:', map?.tilesets);

        const cuevaTileset = map.addTilesetImage('Cueva', 'Cueva Av2')
        const cuevaDecoracionTileset = map.addTilesetImage('CuevaDecoracion', 'CuevaDecoracion Av2')

        //capas principales
        const baseLayer = map.createLayer('Base', cuevaTileset);
        const caminoLayer = map.createLayer('Camino', [cuevaTileset, cuevaDecoracionTileset]);
        const piedritasLayer = map.createLayer('PiedritasPiso/Agua', cuevaTileset);
        const agujerosLayer = map.createLayer('Agujeros', cuevaTileset);
        const paredesLayer = map.createLayer('Paredes', cuevaTileset);
        const piedrasLayer = map.createLayer('Piedras', [cuevaTileset, cuevaDecoracionTileset]);
        const piedras2Layer = map.createLayer('Piedras2', [cuevaTileset, cuevaDecoracionTileset]);





        //colisiones
        // const colisionesLayer = map.createLayer('Colisiones', sueloTileset);
        //colisionesLayer.setCollisionByExclusion([-1]);


        //player
        this.JugadorPrincipal = new JugadorPrincipal(
            this,
            this.startX,
            this.startY,
            this.playerKey,
        ).setDepth(1);
        this.JugadorPrincipal.setCollideWorldBounds(true);

        //  this.physics.add.collider(this.JugadorPrincipal, colisionesLayer);

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

        // TODO: agregar portales según el diseño del mapa
        // this.portalDeVuelta = new Portal(
        //   this,
        //   X, Y,
        //   'MapaPrincipal',
        //   false,
        //   { x: 1917, y: 323 },
        // );
        // this.physics.add.overlap(this.JugadorPrincipal, this.portalDeVuelta.zone);
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

        // this.portalDeVuelta.update(this.JugadorPrincipal, this.teclaE);
    }
}
