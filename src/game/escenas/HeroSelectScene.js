import BaseScene from "./BaseScene.js";
import { HEROES, heroePorId, textoFichaHeroe } from "../data/heroes.js";

const FONT = '"Jersey 10"';

/** Modo historia: elegís héroe y habilidades. Modo tradicional: truco clásico. */
export default class HeroSelectScene extends BaseScene {
    constructor() {
        super('HeroSelectScene');
    }

    init(data) {
        this.playerSprite = data.playerSprite || 'nene-hacha';
        this.modoJuego = 1;
        this.claseHeroe = 0;
    }

    create() {
        this.botonPantallaCompleta();
        const F = { fontFamily: FONT };

        this.add.text(640, 48, 'MODO DE JUEGO', { ...F, fontSize: '42px', fill: '#36ff36' }).setOrigin(0.5);

        this._btnModoTrad = this._crearBoton(640, 120, 'TRADICIONAL (sin habilidades)', '#888888', () => this._setModo(0));
        this._btnModoHist = this._crearBoton(640, 168, 'HISTORIA (con héroe)', '#66ee66', () => this._setModo(1));

        this.add.text(640, 230, 'ELEGÍ TU HÉROE', { ...F, fontSize: '32px', fill: '#ffdd44' }).setOrigin(0.5);

        this._heroBtns = [];
        HEROES.forEach((h, i) => {
            const x = 320 + i * 210;
            const btn = this._crearBoton(x, 300, h.nombre, h.color, () => this._setHeroe(h.id));
            this._heroBtns.push({ btn, data: h });
        });

        this._hint = this.add.text(640, 370, '',
            {
                ...F,
                fontSize: '15px',
                fill: '#dddddd',
                align: 'center',
                lineSpacing: 6,
                wordWrap: { width: 820 },
            })
            .setOrigin(0.5, 0);

        this._crearBoton(640, 620, 'JUGAR', '#ffffff', () => this._continuar());
        this._crearBoton(640, 680, 'Volver', '#aa6633', () =>
            this.scene.start('WeaponScene', {
                player: this.playerSprite.startsWith('nena') ? 'nena' : 'nene',
                modo: 'maquina',
            }));

        this._actualizarUI();
    }

    _crearBoton(x, y, label, color, cb) {
        const bg = this.add.rectangle(x, y, Math.min(200, label.length * 9 + 40), 40, 0x222222)
            .setStrokeStyle(1, 0x555555).setInteractive();
        this.add.text(x, y, label, { fontFamily: FONT, fontSize: '18px', fill: color }).setOrigin(0.5);
        bg.on('pointerover', () => bg.setFillStyle(0x333333));
        bg.on('pointerout',  () => bg.setFillStyle(0x222222));
        bg.on('pointerdown', cb);
        return { bg, txt: null, color };
    }

    _setModo(modo) {
        this.modoJuego = modo;
        this._actualizarUI();
    }

    _setHeroe(id) {
        this.claseHeroe = id;
        this.modoJuego = 1;
        this._actualizarUI();
    }

    _actualizarUI() {
        this._btnModoTrad.bg.setStrokeStyle(this.modoJuego === 0 ? 3 : 1, this.modoJuego === 0 ? 0xffffff : 0x555555);
        this._btnModoHist.bg.setStrokeStyle(this.modoJuego === 1 ? 3 : 1, this.modoJuego === 1 ? 0xffffff : 0x555555);

        this._heroBtns.forEach(({ btn, data }) => {
            const sel = this.modoJuego === 1 && this.claseHeroe === data.id;
            btn.bg.setStrokeStyle(sel ? 3 : 1, sel ? 0xffffff : 0x555555);
            btn.bg.setAlpha(this.modoJuego === 1 ? 1 : 0.35);
        });

        if (this.modoJuego === 0) {
            this._hint.setText('Modo tradicional: truco clásico sin habilidades de héroe.');
        } else {
            this._hint.setText(textoFichaHeroe(heroePorId(this.claseHeroe)));
        }
    }

    _continuar() {
        this.scene.start('GameScene', {
            playerSprite: this.playerSprite,
            multijugador: false,
            modoJuego: this.modoJuego,
            claseHeroe: this.modoJuego === 1 ? this.claseHeroe : null,
        });
    }
}
