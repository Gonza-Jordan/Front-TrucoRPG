export const HABILIDADES = [
    {
        id: 'manipulador',
        nombre: 'Manipulador',
        pasiva: '10% más de probabilidad de recibir cartas de valor alto al repartir.',
        activa: 'Cada 3 manos: reemplazá 1 carta por otra del mazo (nunca de menor valor).',
    },
    {
        id: 'timbero',
        nombre: 'Timbero',
        pasiva: 'Al inicio de cada mano: 20% cara (+1 pt), 80% cruz (sin bonus).',
        activa: 'Antes de jugar: apostá. Si ganás la mano, duplicás puntos; si perdés, rival +2.',
    },
    {
        id: 'fanfarron',
        nombre: 'Fanfarrón',
        pasiva: 'En empate de envido, ganás vos (no gana la mano).',
        activa: 'Tu próximo envido o truco aceptado vale +1 punto extra.',
    },
    {
        id: 'mentiroso',
        nombre: 'Mentiroso',
        pasiva: 'El rival no ve cuándo tenés la habilidad activa disponible.',
        activa: 'Cada 2 manos: al inicio, revelás 1 carta aleatoria del rival.',
    }
];

export function habilidadPorId(id) {
    return HABILIDADES.find(h => h.id === id) ?? null;
}

const CLASE_HEROE_POR_HABILIDAD = {
    manipulador: 0,
    timbero: 1,
    fanfarron: 2,
    mentiroso: 3,
};

export function claseHeroePorHabilidadId(id) {
    return CLASE_HEROE_POR_HABILIDAD[id] ?? null;
}