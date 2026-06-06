import BaseScene from './BaseScene.js';
import JugadorPrincipal from '../personajes/JugadorPrincipal.js';

export default class MapaPrincipalScene extends BaseScene {
  constructor() {
    super('MapaPrincipal');
  }

  init(data) {
    this.playerKey = data.playerSprite || 'player';
    this.startX = data.x || 85;
    this.startY = data.y || 470;
  }

  create() {
    this.botonPantallaCompleta();
    this.crearControlesMobile();

    // A PARTIR DE ACÁ LA CREACION DEL MAPA CON TILEEEED 
    const map = this.make.tilemap({ key: 'mapa' });

    const pisoTileset = map.addTilesetImage('Piso 2', 'Piso 2');
    const arbol1Tileset = map.addTilesetImage('Arbol 1', 'Arbol 1');
    const arbol2Tileset = map.addTilesetImage('Arbol 2', 'Arbol 2');
    const arbol3Tileset = map.addTilesetImage('Arbol 3', 'Arbol 3');
    const fuegoTileset = map.addTilesetImage('Fuego', 'Fuego');
    const gallinasTileset = map.addTilesetImage('Gallinas', 'Gallinas');
    const mateTileset = map.addTilesetImage('Mate', 'Mate');
    const paredesTileset = map.addTilesetImage('Paredes', 'Paredes');
    const partesTileset = map.addTilesetImage('Partes', 'Partes');
    const pavaTileset = map.addTilesetImage('Pava', 'Pava');
    const piedrasTileset = map.addTilesetImage('Piedras', 'Piedras');
    const techosTileset = map.addTilesetImage('Techos', 'Techos');
    const vegetacionTileset = map.addTilesetImage('Vegetacion', 'Vegetacion');

    map.createLayer('Base', pisoTileset);
    map.createLayer('Pasto',[piedrasTileset,vegetacionTileset]);
    map.createLayer('Camino',pisoTileset);
    map.createLayer('Arboles',[vegetacionTileset,arbol1Tileset]);
    map.createLayer('Arboles 2',[arbol2Tileset]);
    map.createLayer('Arboles 3',[arbol3Tileset,partesTileset]);
    map.createLayer('Casas',[paredesTileset,techosTileset,fuegoTileset]);
    map.createLayer('Gallinitas', [gallinasTileset]);
    map.createLayer('Objetos-Casa',[partesTileset,mateTileset,pavaTileset,fuegoTileset]);
    map.createLayer('Gallinitas 2', [gallinasTileset]);

    this.JugadorPrincipal = new JugadorPrincipal(
      this,
      this.startX,
      this.startY,
      this.playerKey,
    ).setDepth(1);
    this.JugadorPrincipal.setCollideWorldBounds(true);

    this.keys = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.JugadorPrincipal.update(this.keys, this.teclaE);
  }
}
