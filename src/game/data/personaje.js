export const PERSONAJES = [
    { id: 0, nombrePersonaje: 'Primero', spriteKey: 'nene-hacha' },
    { id: 1, nombrePersonaje: 'Segundo', spriteKey: 'nena-hacha' },
    { id: 2, nombrePersonaje: 'Tercero', spriteKey: 'nene-arco' },
    { id: 3, nombrePersonaje: 'Cuarto', spriteKey: 'nena-arco' }
];

export function personajePorId(id) {
    return PERSONAJES.find(p => p.id === id) ?? null;
}