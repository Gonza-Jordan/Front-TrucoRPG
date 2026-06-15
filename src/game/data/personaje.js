export const PERSONAJES = [
    { id: 0, nombrePersonaje: 'Primero', spriteKey: 'personaje' },
    { id: 1, nombrePersonaje: 'Segundo', spriteKey: 'personaje' },
    { id: 2, nombrePersonaje: 'Tercero', spriteKey: 'personaje' },
    { id: 3, nombrePersonaje: 'Cuarto', spriteKey: 'personaje' }
];

export function personajePorId(id) {
    return PERSONAJES.find(p => p.id === id) ?? null;
}