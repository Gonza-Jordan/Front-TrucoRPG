export const PERSONAJES = [
    { id: 0, nombrePersonaje: 'Primero', spriteKey: 'personaje', img:'/Imagenes/avatares/personaje1.png' },
    { id: 1, nombrePersonaje: 'Segundo', spriteKey: 'personaje', img:'/Imagenes/avatares/personaje2.png'},
    { id: 2, nombrePersonaje: 'Tercero', spriteKey: 'personaje', img:'/Imagenes/avatares/personaje1.png'},
    { id: 3, nombrePersonaje: 'Cuarto', spriteKey: 'personaje', img:'/Imagenes/avatares/personaje2.png'}
];

export function personajePorId(id) {
    return PERSONAJES.find(p => p.id === id) ?? null;
}