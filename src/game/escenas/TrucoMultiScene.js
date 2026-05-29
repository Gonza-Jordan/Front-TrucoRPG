import BaseScene from "./BaseScene.js";
import { multiplayerManager } from "../MultiplayerManager.js";

const PALO   = { Oro: '★', Espada: '†', Copa: '♦', Basto: '♣' };
const FONT   = '"Jersey 10"';

// Paleta — idéntica a TrucoSoloScene
const BG_SIDE  = 0x12100a;
const BG_MESA  = 0x0c4a0c;
const BG_MESA2 = 0x094009;
const DIVIDER  = 0x5a4020;
const CARTA    = 0xf5e6c8;
const REVERSO  = 0x7a1a1a;
const VACIA    = 0x1a6e1a;

export default class TrucoMultiScene extends BaseScene {
    constructor() { super('TrucoMultiScene'); }

    init(data) {
        this.miRol = data.miRol || 'J1';
        this._btnObjs = [];
        this._juegoIniciado = false;
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0805');
        this._buildLayout();
        this._buildWaitingOverlay();

        multiplayerManager.onTrucoEstado = (data) => {
            if (!this._juegoIniciado) {
                this._juegoIniciado = true;
                this._hideWaitingOverlay();
            }
            this._updateUI(data);
        };
        multiplayerManager.onJugadorDesconectado = () => {
            this._pTruco.setText('El otro jugador se desconectó.');
        };

        // Ambos jugadores avisan que están listos; el servidor inicia cuando los dos lleguen
        multiplayerManager.listoParaJugar();

        this.events.on('shutdown', () => { multiplayerManager.onTrucoEstado = null; });
    }

    _buildWaitingOverlay() {
        const W = 1280, H = 720;
        const F = { fontFamily: '"Jersey 10"' };

        const waitBg    = this.add.rectangle(W / 2, H / 2, W, H, 0x050302, 0.95).setDepth(200);
        const waitTitle = this.add.text(W / 2, H / 2 - 80, 'MULTIJUGADOR', {
            ...F, fontSize: '52px', fill: '#44aaff'
        }).setOrigin(0.5).setDepth(201);

        this._waitTxt = this.add.text(W / 2, H / 2 + 10, 'Esperando al otro jugador...', {
            ...F, fontSize: '28px', fill: '#ffffff',
            backgroundColor: '#00000088', padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(201);

        const waitRol = this.add.text(W / 2, H / 2 + 80, `Tu rol: ${this.miRol}`, {
            ...F, fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5).setDepth(201);

        // Puntitos animados
        let dots = 0;
        this._waitTimer = this.time.addEvent({
            delay: 600, loop: true,
            callback: () => {
                dots = (dots + 1) % 4;
                this._waitTxt?.setText('Esperando al otro jugador' + '.'.repeat(dots));
            }
        });

        // Todos los objetos del overlay juntos para ocultarlos de una
        this._waitObjs = [waitBg, waitTitle, this._waitTxt, waitRol];
    }

    _hideWaitingOverlay() {
        if (this._waitTimer) { this._waitTimer.remove(); this._waitTimer = null; }
        this._waitObjs?.forEach(o => o.setVisible(false));
        this._waitObjs = [];
    }

    // ─── LAYOUT ──────────────────────────────────────────────────
    _buildLayout() {
        const W = 1280, H = 720;

        // Sidebars
        this.add.rectangle(100,  H/2, 200, H, BG_SIDE).setDepth(0);
        this.add.rectangle(1180, H/2, 200, H, BG_SIDE).setDepth(0);
        this.add.rectangle(200,  H/2, 2,   H, DIVIDER).setDepth(1);
        this.add.rectangle(1080, H/2, 2,   H, DIVIDER).setDepth(1);

        // Mesa central
        this.add.rectangle(640, H/2, 880, H,   BG_MESA).setDepth(0);
        this.add.rectangle(640, H/2, 820, 660, BG_MESA2).setStrokeStyle(3, 0x062806).setDepth(0);

        this._yBtns = 18;
        this._buildRightPanel();
        this._buildCenter();
    }

    _buildRightPanel() {
        const xL = 1090, xC = 1180;
        const F  = { fontFamily: FONT };

        // ── TANTEADOR: mismo estilo que modo Solo ──────────────────
        this.add.rectangle(xC, 96, 186, 176, 0x0d0804)
            .setStrokeStyle(1, 0x5a3a10).setDepth(2);

        this.add.text(xC, 10, 'T A N T E A D O R', { ...F, fontSize: '13px', fill: '#c89030', letterSpacing: 2 })
            .setOrigin(0.5, 0).setDepth(3);

        this.add.rectangle(xC, 26, 178, 1, 0x7a4a18).setDepth(3);

        this._txtJ1 = this.add.text(1134, 29, 'J1: 0', { ...F, fontSize: '11px', fill: '#66dd44' })
            .setOrigin(0.5, 0).setDepth(3);
        this._txtJ2 = this.add.text(1226, 29, 'J2: 0', { ...F, fontSize: '11px', fill: '#dd4433' })
            .setOrigin(0.5, 0).setDepth(3);

        this.add.rectangle(xC, 108, 1, 148, 0x5a3a10).setDepth(3);

        this.add.text(xC, 44, 'MALAS',  { ...F, fontSize: '9px', fill: '#7a6040' }).setOrigin(0.5, 0).setDepth(3);
        this.add.text(xC, 116, 'BUENAS', { ...F, fontSize: '9px', fill: '#7a6040' }).setOrigin(0.5, 0).setDepth(3);

        this.add.rectangle(xC, 114, 178, 1, 0x3a2a0a).setDepth(3);

        this._gTally = this.add.graphics().setDepth(4);

        this.add.rectangle(xC, 184, 186, 1, 0x5a3a10).setDepth(3);

        // ── ENVIDO ──
        this.add.text(xL, 190, 'ENVIDO', { ...F, fontSize: '14px', fill: '#55aadd' }).setDepth(3);
        this._pEnvido = this.add.text(xL, 208, 'Todavía no se cantó envido.', { ...F, fontSize: '12px', fill: '#bbbbbb', wordWrap: { width: 178 } }).setDepth(3);

        this.add.rectangle(xC, 400, 178, 1, DIVIDER).setDepth(3);

        // ── TRUCO ──
        this.add.text(xL, 406, 'TRUCO', { ...F, fontSize: '14px', fill: '#ddcc44' }).setDepth(3);
        this._pTruco = this.add.text(xL, 424, 'Todavía no se cantó truco.', { ...F, fontSize: '12px', fill: '#bbbbbb', wordWrap: { width: 178 } }).setDepth(3);

        this.add.rectangle(xC, 658, 178, 1, DIVIDER).setDepth(3);
        const bk = this.add.rectangle(xC, 684, 178, 34, 0x221810).setStrokeStyle(1, DIVIDER).setDepth(3).setInteractive();
        this.add.text(xC, 684, 'Volver', { fontFamily: FONT, fontSize: '16px', fill: '#aa6633' }).setOrigin(0.5).setDepth(4);
        bk.on('pointerover', () => bk.setFillStyle(0x332818));
        bk.on('pointerout',  () => bk.setFillStyle(0x221810));
        bk.on('pointerdown', () => {
            multiplayerManager.limpiarCallbacks();
            this.scene.start('GameScene', { multijugador: true });
        });
    }

    _buildCenter() {
        const F = { fontFamily: FONT };

        // Retrato oponente (troll de frente, frame 312)
        this._sprRetrato = this.add.sprite(640, 52, 'troll').setFrame(312).setDisplaySize(76, 76).setDepth(5);
        this._lblPortrait = this.add.text(640, 100, 'Esperando mano', { ...F, fontSize: '14px', fill: '#aaaaaa', backgroundColor: '#00000066', padding: { x: 6, y: 2 } }).setOrigin(0.5).setDepth(5);
        this._lblTurno    = this.add.text(640, 124, '', { ...F, fontSize: '17px', fill: '#ffff88', backgroundColor: '#00000066', padding: { x: 8, y: 3 } }).setOrigin(0.5).setDepth(5);

        // ── Burbuja de diálogo del rival ──
        this._bubbleBg  = this.add.rectangle(800, 45, 220, 48, 0xfffff0).setStrokeStyle(2, 0x333333).setDepth(20).setVisible(false);
        this._bubbleTxt = this.add.text(800, 45, '', { fontFamily: FONT, fontSize: '15px', fill: '#111111', align: 'center', wordWrap: { width: 205 } }).setOrigin(0.5).setDepth(21).setVisible(false);
        this._bubbleTail = this.add.triangle(692, 52, 0, -8, 14, 8, 0, 8, 0xfffff0).setStrokeStyle(1, 0x333333).setDepth(19).setVisible(false);

        // Cartas oponente
        this.add.text(640, 155, 'OPONENTE', { ...F, fontSize: '14px', fill: '#ffaaaa' }).setOrigin(0.5).setDepth(5);
        this._cartsOp = [];
        [500, 610, 720].forEach(x => {
            const r = this.add.rectangle(x, 208, 72, 98, REVERSO).setStrokeStyle(2, 0xdddddd).setDepth(5);
            const l = this.add.text(x, 208, '?', { ...F, fontSize: '28px', fill: '#fff' }).setOrigin(0.5).setDepth(6);
            this._cartsOp.push({ r, l });
        });

        // Mesa
        this.add.line(640, 378, -320, 0, 320, 0, 0x4a9a4a, 1).setDepth(4);
        this.add.text(342, 360, 'J1:', { ...F, fontSize: '14px', fill: '#aaffaa' }).setDepth(5);
        this.add.text(342, 385, 'J2:', { ...F, fontSize: '14px', fill: '#ffaaaa' }).setDepth(5);

        this._slots = [];
        [430, 580, 730].forEach(x => {
            const rJ1 = this.add.rectangle(x, 352, 120, 44, VACIA).setStrokeStyle(1, 0x4aaa4a).setDepth(5);
            const tJ1 = this.add.text(x, 352, '', { ...F, fontSize: '13px', fill: '#111', align: 'center' }).setOrigin(0.5).setDepth(6);
            const rJ2 = this.add.rectangle(x, 402, 120, 44, VACIA).setStrokeStyle(1, 0xaa4a4a).setDepth(5);
            const tJ2 = this.add.text(x, 402, '', { ...F, fontSize: '13px', fill: '#111', align: 'center' }).setOrigin(0.5).setDepth(6);
            const tG  = this.add.text(x, 377, '', { ...F, fontSize: '13px', fill: '#ffff00', backgroundColor: '#00000099', padding: { x: 4, y: 2 } }).setOrigin(0.5).setDepth(7);
            this._slots.push({ rJ1, tJ1, rJ2, tJ2, tG });
        });

        // Mis cartas
        this.add.text(640, 463, 'TUS CARTAS', { ...F, fontSize: '14px', fill: '#aaffaa' }).setOrigin(0.5).setDepth(5);
        this._misCarts = [];
        [500, 610, 720].forEach(x => {
            const r = this.add.rectangle(x, 560, 84, 120, CARTA).setStrokeStyle(2, 0x8b6914).setDepth(5).setInteractive();
            const n = this.add.text(x, 530, '', { ...F, fontSize: '28px', fill: '#000' }).setOrigin(0.5).setDepth(6);
            const p = this.add.text(x, 562, '', { ...F, fontSize: '13px', fill: '#333' }).setOrigin(0.5).setDepth(6);
            const v = this.add.text(x, 579, '', { ...F, fontSize: '11px', fill: '#666' }).setOrigin(0.5).setDepth(6);
            const idx = this._misCarts.length;
            r.on('pointerover', () => { if (r.visible) { r.setFillStyle(0xffe8a0); r.y=552; n.y=522; p.y=554; v.y=571; }});
            r.on('pointerout',  () => { if (r.visible) { r.setFillStyle(CARTA);    r.y=560; n.y=530; p.y=562; v.y=579; }});
            r.on('pointerdown', () => this._jugarCarta(idx));
            this._misCarts.push({ r, n, p, v, carta: null });
        });
    }

    // ─── TANTEADOR: palitos estilo fósforo (idéntico al modo Solo) ──
    _redrawTally(ptsJ1, ptsJ2) {
        this._gTally.clear();

        const CX_J1 = 1134, CX_J2 = 1226;
        const HALF  = 43;
        const yMalas = 56, yBuenas = 127;

        this._drawPalitoSection(CX_J1, HALF, yMalas,  Math.min(ptsJ1, 15),     false);
        this._drawPalitoSection(CX_J1, HALF, yBuenas, Math.max(0, ptsJ1 - 15), false);
        this._drawPalitoSection(CX_J2, HALF, yMalas,  Math.min(ptsJ2, 15),     true);
        this._drawPalitoSection(CX_J2, HALF, yBuenas, Math.max(0, ptsJ2 - 15), true);
    }

    _drawPalitoSection(cx, halfW, yTop, pts, isJ2) {
        if (pts <= 0) return;

        const BS   = 20;
        const BGAP = 5;
        const SL   = 14;
        const SGAP = 5;

        const stickColor = isJ2 ? 0xd46010 : 0xc8a030;
        const headColor  = 0xcc2208;

        const fullSets  = Math.floor(pts / 5);
        const remainder = pts % 5;

        if (fullSets > 0) {
            const totalW = fullSets * BS + (fullSets - 1) * BGAP;
            let bx = cx - totalW / 2;
            for (let i = 0; i < fullSets; i++) {
                this._drawMatchstickBox(bx, yTop, BS, stickColor, headColor);
                bx += BS + BGAP;
            }
        }

        if (remainder > 0) {
            const totalW = remainder * SL + (remainder - 1) * SGAP;
            let sx = cx - totalW / 2;
            const sy = fullSets > 0 ? yTop + BS + 6 : yTop + 3;
            for (let i = 0; i < remainder; i++) {
                this._drawMatchstick(sx, sy + SL, sx + SL, sy, stickColor, headColor);
                sx += SL + SGAP;
            }
        }
    }

    _drawMatchstickBox(bx, by, BS, stickColor, headColor) {
        this._drawMatchstick(bx,      by + BS, bx,      by,      stickColor, headColor);
        this._drawMatchstick(bx,      by,      bx + BS, by,      stickColor, headColor);
        this._drawMatchstick(bx + BS, by,      bx + BS, by + BS, stickColor, headColor);
        this._drawMatchstick(bx + BS, by + BS, bx,      by + BS, stickColor, headColor);
        this._drawMatchstick(bx,      by + BS, bx + BS, by,      stickColor, headColor);
    }

    _drawMatchstick(x1, y1, x2, y2, stickColor, headColor) {
        const g = this._gTally;
        g.lineStyle(2, stickColor, 1);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.strokePath();
        g.fillStyle(headColor, 1);
        g.fillCircle(x2, y2, 3);
        g.fillStyle(stickColor, 0.7);
        g.fillCircle(x1, y1, 1.5);
    }

    // ─── SignalR ──────────────────────────────────────────────────
    _jugarCarta(i) {
        const sl = this._misCarts[i];
        if (!sl.carta) return;
        multiplayerManager.jugarCarta(sl.carta.numero, sl.carta.palo);
    }

    // ─── UI ───────────────────────────────────────────────────────
    _updateUI(data) {
        const { miRol, misManos, cantidadCartasOponente, estado: e } = data;
        this.miRol = miRol;
        const esJ1 = miRol === 'J1';

        // Scores + tally
        this._txtJ1.setText(`J1: ${e.puntosHumano}`);
        this._txtJ2.setText(`J2: ${e.puntosMaquina}`);
        this._redrawTally(e.puntosHumano, e.puntosMaquina);

        // Right panels
        this._pEnvido.setText(e.estadoEnvido || 'Todavía no se cantó envido.');
        this._pTruco.setText(e.estadoTruco   || 'Todavía no se cantó truco.');

        const miTurnoRol = esJ1 ? 'Humano' : 'Maquina';
        const pendEnv = esJ1 ? e.envidoPendienteJ1 : e.envidoPendienteJ2;
        const pendTru = esJ1 ? e.trucoPendienteJ1  : e.trucoPendienteJ2;

        // Fix: si el rival jugó primero en la baza (cartaPendiente del rival),
        // el jugador puede responder aunque turnoActual apunte al rival
        const rivalJugoEnMesa = esJ1 ? !!e.cartaPendienteJ2 : !!e.cartaPendienteJ1;
        const esMiTurno = (e.turnoActual === miTurnoRol || rivalJugoEnMesa)
            && !e.ganadorMano && !e.ganadorPartida && !pendEnv && !pendTru;

        // Portrait label
        if (e.ganadorPartida) {
            const perdiste = (esJ1 && e.ganadorPartida === 'Maquina') || (!esJ1 && e.ganadorPartida === 'Humano');
            this._lblPortrait.setText(perdiste ? '¡GANÉ! 😈' : '¡PERDÍ! 😤');
        } else if (e.ganadorMano) {
            const rivalGano = (esJ1 && e.ganadorMano === 'Maquina') || (!esJ1 && e.ganadorMano === 'Humano');
            this._lblPortrait.setText(rivalGano ? '¡Gané la mano!' : '¡Perdí la mano!');
        } else {
            this._lblPortrait.setText(esMiTurno ? '¿Qué jugás?' : 'Esperando...');
        }

        this._lblTurno.setText(
            esMiTurno  ? '⭐ Tu turno — jugá una carta o cantá'
            : pendEnv || pendTru ? '⚡ Respondé el canto del rival'
            : ''
        );

        // ── Burbuja de diálogo del rival ──
        let bubbleTxt = null;
        if (pendTru && e.estadoTruco)   bubbleTxt = e.estadoTruco;
        else if (pendEnv && e.estadoEnvido) bubbleTxt = e.estadoEnvido;

        const showBubble = !!bubbleTxt;
        this._bubbleBg.setVisible(showBubble);
        this._bubbleTxt.setVisible(showBubble);
        this._bubbleTail.setVisible(showBubble);
        if (showBubble) this._bubbleTxt.setText(bubbleTxt);

        // Oponente cards
        this._cartsOp.forEach((c, i) => { const v = i < cantidadCartasOponente; c.r.setVisible(v); c.l.setVisible(v); });

        // Bazas
        this._slots.forEach(s => {
            s.rJ1.setFillStyle(VACIA); s.tJ1.setText('');
            s.rJ2.setFillStyle(VACIA); s.tJ2.setText('');
            s.tG.setText('');
        });
        (e.bazas || []).forEach((b, i) => {
            if (i >= 3) return;
            const s = this._slots[i];
            if (b.cartaJugador) { s.tJ1.setText(`${b.cartaJugador.numero} ${PALO[b.cartaJugador.palo]||''} ${b.cartaJugador.palo}`); s.rJ1.setFillStyle(0xd4c4a0); }
            if (b.cartaMaquina)  { s.tJ2.setText(`${b.cartaMaquina.numero} ${PALO[b.cartaMaquina.palo]||''} ${b.cartaMaquina.palo}`);  s.rJ2.setFillStyle(0xd4c4a0); }
            const gan = b.ganador === 'Humano' ? '→J1' : b.ganador === 'Maquina' ? '→J2' : 'Parda';
            const col = b.ganador === 'Humano' ? '#aaffaa' : b.ganador === 'Maquina' ? '#ffaaaa' : '#ffff88';
            s.tG.setText(gan).setStyle({ fill: col });
        });
        const bazaIdx = (e.bazas || []).length;
        if (bazaIdx < 3) {
            const s = this._slots[bazaIdx];
            if (e.cartaPendienteJ1) { s.tJ1.setText(`${e.cartaPendienteJ1.numero} ${PALO[e.cartaPendienteJ1.palo]||''} ${e.cartaPendienteJ1.palo}`); s.rJ1.setFillStyle(0xffe880); }
            if (e.cartaPendienteJ2) { s.tJ2.setText(`${e.cartaPendienteJ2.numero} ${PALO[e.cartaPendienteJ2.palo]||''} ${e.cartaPendienteJ2.palo}`); s.rJ2.setFillStyle(0xffe880); }
        }

        // Mis cartas
        this._misCarts.forEach((sl, i) => {
            const carta = misManos[i];
            sl.carta = carta || null;
            const vis = !!carta && !e.ganadorMano;
            [sl.r, sl.n, sl.p, sl.v].forEach(o => o.setVisible(vis));
            if (carta) {
                sl.n.setText(String(carta.numero));
                sl.p.setText(`${PALO[carta.palo]||''} ${carta.palo}`);
                sl.v.setText(`Truco: ${carta.valorTruco}`);
            }
        });

        this._buildBtns(e, miRol, esMiTurno, pendEnv, pendTru);
    }

    _buildBtns(e, miRol, esMiTurno, pendEnv, pendTru) {
        this._btnObjs.forEach(o => o.destroy());
        this._btnObjs = [];

        // miRol es 'J1'/'J2'; el backend usa 'Humano'/'Maquina' para los roles
        const miTurnoRol  = miRol === 'J1' ? 'Humano' : 'Maquina';
        const manoEnd     = !!e.ganadorMano || !!e.ganadorPartida;
        const btns = []; // [label, color, callback | null]  — null = deshabilitado

        if (e.partidaTerminada) {
            btns.push(['Nueva partida', '#226622', () => multiplayerManager.nuevaPartida()]);

        } else if (e.ganadorMano) {
            btns.push(['Nueva mano', '#cc8800', () => multiplayerManager.nuevaMano()]);

        } else if (pendEnv) {
            // Escalación al responder envido (como en TrucoSolo)
            btns.push(['QUIERO', '#44ff44', () => multiplayerManager.responderEnvido(true)]);
            const tipoEnv = e.tipoEnvidoCantado;
            if (tipoEnv === 'Envido') {
                btns.push(['ENVIDO',       '#4488ff', () => multiplayerManager.escalarEnvido('Envido Envido')]);
                btns.push(['REAL ENVIDO',  '#ffaa00', () => multiplayerManager.escalarEnvido('Real Envido')]);
                btns.push(['FALTA ENVIDO', '#ff8800', () => multiplayerManager.escalarEnvido('Falta Envido')]);
            } else if (tipoEnv === 'EnvidoEnvido') {
                btns.push(['REAL ENVIDO',  '#ffaa00', () => multiplayerManager.escalarEnvido('Real Envido')]);
                btns.push(['FALTA ENVIDO', '#ff8800', () => multiplayerManager.escalarEnvido('Falta Envido')]);
            } else if (tipoEnv === 'RealEnvido') {
                btns.push(['FALTA ENVIDO', '#ff8800', () => multiplayerManager.escalarEnvido('Falta Envido')]);
            }
            btns.push(['NO QUIERO', '#ff4444', () => multiplayerManager.responderEnvido(false)]);

        } else if (pendTru) {
            // Envido cantable mientras se decide el truco (sin bazas jugadas)
            if (!e.envidoCantado && (e.bazas?.length ?? 0) === 0) {
                btns.push(['Envido',       '#4488ff', () => multiplayerManager.solicitarEnvido('Envido')]);
                btns.push(['Real Envido',  '#4488ff', () => multiplayerManager.solicitarEnvido('Real Envido')]);
                btns.push(['Falta Envido', '#4488ff', () => multiplayerManager.solicitarEnvido('Falta Envido')]);
            }
            btns.push(['QUIERO', '#44ff44', () => multiplayerManager.responderTruco(true)]);
            if (e.nivelTruco < 3) {
                const lbl = e.nivelTruco === 1 ? 'RETRUCO' : 'VALE 4';
                const esc = e.nivelTruco === 1 ? 'retruco' : 'valecuatro';
                btns.push([lbl, '#ffaa00', () => multiplayerManager.responderTruco(true, esc)]);
            }
            btns.push(['NO QUIERO', '#ff4444', () => multiplayerManager.responderTruco(false)]);
            btns.push(['Ir al mazo', '#556677', () => multiplayerManager.irseAlMazo()]);

        } else {
            // ── Envido — válido antes de la primera baza (deshabilitado si no es mi turno) ──
            const envidoPosible = !e.envidoCantado && (e.bazas?.length ?? 0) === 0 && !manoEnd;
            if (envidoPosible) {
                btns.push(['Envido',       '#4488ff', esMiTurno ? () => multiplayerManager.solicitarEnvido('Envido')       : null]);
                btns.push(['Real Envido',  '#4488ff', esMiTurno ? () => multiplayerManager.solicitarEnvido('Real Envido')  : null]);
                btns.push(['Falta Envido', '#4488ff', esMiTurno ? () => multiplayerManager.solicitarEnvido('Falta Envido') : null]);
            }

            // ── Truco / Retruco / Vale Cuatro ──
            if (!e.trucoCantado) {
                const ok = esMiTurno && !manoEnd;
                btns.push(['Truco', '#cc4444', ok ? () => multiplayerManager.solicitarTruco() : null]);
            } else if (e.trucoCantado && !e.trucoResuelto && e.nivelTruco < 3 && e.cantorTruco !== miTurnoRol && esMiTurno) {
                // La máquina cantó el nivel actual → puedo escalar
                const lbl = e.nivelTruco === 1 ? 'Retruco' : 'Vale Cuatro';
                btns.push([lbl, '#cc4444', () => multiplayerManager.escalarTruco()]);
            }

            if (esMiTurno && !manoEnd)
                btns.push(['Ir al mazo', '#556677', () => multiplayerManager.irseAlMazo()]);
        }

        let y = this._yBtns;
        btns.forEach(([label, color, cb]) => {
            const enabled = !!cb;
            const bg = this.add.rectangle(100, y + 17, 172, 34,
                enabled ? 0x222222 : 0x161616)
                .setStrokeStyle(1, enabled ? 0x444444 : 0x252525)
                .setDepth(3);
            const txt = this.add.text(100, y + 17, label,
                { fontFamily: FONT, fontSize: '15px', fill: enabled ? color : '#444444' })
                .setOrigin(0.5).setDepth(4);
            if (enabled) {
                bg.setInteractive();
                bg.on('pointerover', () => bg.setFillStyle(0x333333));
                bg.on('pointerout',  () => bg.setFillStyle(0x222222));
                bg.on('pointerdown', cb);
            }
            this._btnObjs.push(bg, txt);
            y += 40;
        });
    }
}
