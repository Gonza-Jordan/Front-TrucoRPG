import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';
import Portal from '../objetos/Portal.js';

export default class MapaAventura1Scene extends BaseScene {
  constructor() {
    super('MapaAventura1'); // ✅ coincide con BootScene y con el portal
  }

  init(data) {
    this.playerKey = data.playerSprite || 'nene-hacha';
    this.startX = data.x || 85;
    this.startY = data.y || 470;
  }


  create() {
    console.log('1 - entrando a create');
    this.botonPantallaCompleta();
    console.log('2 - después de botonPantallaCompleta');
    this.crearControlesMobile();
    console.log('3 - después de crearControlesMobile');

    // CREACION DEL MAPA

    const map = this.make.tilemap({ key: 'mapa-aventura-1' }); // ✅ key del BootScene
    console.log('map:', map);
    console.log('map.tilesets:', map?.tilesets);

    const sueloTileset = map.addTilesetImage('Suelo', 'Suelo');
    const vegetacionTileset = map.addTilesetImage('Vegetacion', 'Vegetacion Av');
    const piedrasTileset = map.addTilesetImage('Piedras', 'Piedras Av');
    const arbol2Tileset = map.addTilesetImage('Arbol2', 'Arbol 2 Av');
    const arbol1Tileset = map.addTilesetImage('Arbol1', 'Arbol 1 Av');
    const aguaTileset = map.addTilesetImage('Agua', 'Agua');
    const fogataTileset = map.addTilesetImage('Fogata', 'Fuego Av');
    const paredesMontañaTileset = map.addTilesetImage('ParedesMontaña', 'ParedesMontaña');
    const paredesCuevaTileset = map.addTilesetImage('ParedesCueva', 'ParedesCueva');

    // Capas de fondo
    map.createLayer('Base', sueloTileset);
    map.createLayer('Agua', aguaTileset);
    map.createLayer('Montañas', paredesMontañaTileset);
    map.createLayer('Camino', sueloTileset);
    map.createLayer('Pasto/Vegetacion', [vegetacionTileset, piedrasTileset]);
    map.createLayer('Piedras', piedrasTileset);

    // Capas con depth elevado (se renderizan sobre el jugador)
    const arbolesLayer = map.createLayer('Arboles', [arbol1Tileset, vegetacionTileset]);
    const arboles2Layer = map.createLayer('Arboles2', [arbol2Tileset]);
    const arboles3Layer = map.createLayer('Arboles 3', [arbol1Tileset]);

    arbolesLayer.setDepth(2);
    arboles2Layer.setDepth(2);
    arboles3Layer.setDepth(2);

    // Objetos decorativos
    map.createLayer('Objetos', [fogataTileset, paredesCuevaTileset]);

    // Capa de colisiones
    const colisionesLayer = map.createLayer('Colisiones', sueloTileset);
    colisionesLayer.setCollisionByExclusion([-1]);

    // Jugador
    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(1);
    this.JugadorPrincipal.setCollideWorldBounds(true);

    this.physics.add.collider(this.JugadorPrincipal, colisionesLayer);

    // Cámara y mundo
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.JugadorPrincipal, true, 0.1, 0.1);

    this.JugadorPrincipal.setScale(1.1);

    // Controles teclado
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
      this.JugadorPrincipal.body.velocity.x !== 0 ||
      this.JugadorPrincipal.body.velocity.y !== 0;

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
