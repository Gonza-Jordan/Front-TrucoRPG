import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';

interface Habilidad {
  nombre: string;
  texto: string;
  tag?: string;
  nota?: string;
}

interface FaseOponente {
  rango: string;
  titulo: string;
  texto: string;
}

interface Oponente {
  id: string;
  nombre: string;
  apodo: string;
  icono: string;
  imagen: string;
  intro: string;
  habilidades?: Habilidad[];
  fases?: FaseOponente[];
}

@Component({
  selector: 'app-oponentes',
  imports: [RouterLink, PageWrapper],
  templateUrl: './oponentes.html',
  styleUrl: './oponentes.css',
})
export class Oponentes {
  oponenteActivo = signal(0);
  animando = signal(false);

  readonly oponentes: Oponente[] = [
    {
      id: 'nahuelito',
      nombre: 'Nahuelito',
      apodo: 'El que nada entre brumas',
      icono: '🌊',
      imagen: '/assets/oponentes/nahuelito.png',
      intro:
        'Emerge de las aguas frías del sur. Nadie le vio la cara completa, pero todos coinciden en algo: las cartas, cerca de él, dejan de ser lo que parecen.',
      habilidades: [
        {
          nombre: 'Salpicadura',
          texto:
            'Cada 2 manos, Nahuelito salpica el mazo y cambia los palos de tus cartas (por ejemplo, una Espada puede transformarse en Copa). Tu jerarquía y tu Envido pueden verse alterados sin previo aviso.',
          tag: 'HABILIDAD',
          nota: 'Revisá tus cartas después de cada salpicadura: lo que tenías puede no ser lo que tenés.',
        },
      ],
    },
    {
      id: 'pombero',
      nombre: 'El Pombero',
      apodo: 'El dueño del monte',
      icono: '🌲',
      imagen: '/assets/oponentes/pomberito.png',
      intro:
        'Silbidos en el monte, pasos que no se ven. El Pombero conoce tus cartas antes que vos mismo las olvides.',
      habilidades: [
        {
          nombre: 'Travesura del monte',
          texto:
            'Al repartir la mano, el Pombero te deja ver tus 3 cartas durante 5 segundos. Pasado ese tiempo, da vuelta 1 carta al azar, que permanece oculta (boca abajo) durante toda la ronda.',
          tag: 'HABILIDAD',
          nota: 'Memorizá bien tu mano en esos 5 segundos: vas a jugar a ciegas con una de tus cartas.',
        },
      ],
    },
    {
      id: 'lobizon',
      nombre: 'El Lobizón',
      apodo: 'El séptimo hijo',
      icono: '🐺',
      imagen: '/assets/oponentes/lobizon.png',
      intro:
        'Bajo la luna llena cambia de forma. Su aullido no es solo una advertencia: es una sentencia para quien lo escuche en plena partida.',
      habilidades: [
        {
          nombre: 'Aullido',
          texto:
            'Al aullar, el Lobizón te manda directamente al mazo. No hay truco, no hay envido: la mano termina ahí mismo para vos.',
          tag: 'HABILIDAD',
          nota: 'No hay forma de bloquear el aullido. Solo queda esperar que no te toque a vos.',
        },
      ],
    },
    {
      id: 'luzmala',
      nombre: 'La Luz Mala',
      apodo: 'El alma errante',
      icono: '👻',
      imagen: '/assets/oponentes/luzmala.png',
      intro:
        'Un resplandor pálido que aparece en los campos de noche. Dicen que es un alma en pena buscando algo que perdió... o una carta que vos vas a perder.',
      habilidades: [
        {
          nombre: 'Destello',
          texto:
            'Cada 2 rondas, la Luz Mala destella y te obliga a jugar una carta al azar de tu mano, sin que puedas elegir cuál.',
          tag: 'HABILIDAD',
          nota: 'Guardá tu mejor carta con cuidado: el destello no respeta tu estrategia.',
        },
      ],
    },
    {
      id: 'mandinga',
      nombre: 'El Mandinga',
      apodo: 'El que viene a cobrar',
      icono: '😈',
      imagen: '/assets/oponentes/mandinga.png',
      intro:
        'No hay tahúr que se compare. El Diablo en persona se sienta a la mesa, y a medida que el marcador sube, también lo hace su sed de almas y de tantos.',
      fases: [
        {
          rango: '0 – 5 PTS',
          titulo: 'Fase I — El Pacto',
          texto:
            'Cada 3 manos pesa una maldición sobre la mesa: si el Diablo gana esa mano, se lleva el doble de puntos. Si la gana el héroe, no suma nada.',
        },
        {
          rango: '5+ PTS',
          titulo: 'Fase II — El Engaño',
          texto:
            'El Diablo te deja ver las 3 cartas repartidas durante 5 segundos. Pasado ese tiempo, las da vuelta y no podés volver a verlas hasta el momento en que las jugués.',
        },
        {
          rango: 'FASE FINAL',
          titulo: 'Fase III — El Espejo',
          texto:
            'Cada cierta cantidad de manos, el Mandinga copia el valor de tu última carta jugada más alta, usándola como si fuera propia.',
        },
      ],
    },
  ];

  get oponente(): Oponente {
    return this.oponentes[this.oponenteActivo()];
  }

  seleccionar(i: number): void {
    if (this.animando() || i === this.oponenteActivo()) return;
    this.animando.set(true);
    setTimeout(() => {
      this.oponenteActivo.set(i);
      this.animando.set(false);
    }, 260);
  }

  anterior(): void {
    const prev = this.oponenteActivo() - 1;
    if (prev >= 0) this.seleccionar(prev);
  }

  siguiente(): void {
    const next = this.oponenteActivo() + 1;
    if (next < this.oponentes.length) this.seleccionar(next);
  }

  tagCss(tag?: string): string {
    if (!tag) return '';
    return 'tag-' + tag
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-');
  }
}
