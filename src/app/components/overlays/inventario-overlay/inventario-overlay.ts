import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario-overlay.html',
  styleUrl: './inventario-overlay.css',
})
export class InventarioOverlay {
  inventarioCompleto = [
    {
      id: 1,
      nombre: 'Boleadoras de Manipulador',
      categoria: 'HABILIDADES',
      cantidad: 1,
      img: '/assets/objetos/objeto.png',
    },
    {
      id: 5,
      nombre: 'Poncho rosa',
      categoria: 'ARMARIO',
      cantidad: 1,
      img: '/assets/objetos/GotaRosa.png',
    },
    {
      id: 6,
      nombre: 'Poncho marrón',
      categoria: 'ARMARIO',
      cantidad: 1,
      img: '/assets/objetos/GotaMarron.png',
    },
  ];

  categoriaActiva: string = 'TODO';

  totalSlots: number = 12;

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
  }

  get itemsFiltrados() {
    if (this.categoriaActiva === 'TODO') {
      return this.inventarioCompleto;
    }
    return this.inventarioCompleto.filter((item) => item.categoria === this.categoriaActiva);
  }

  get slotsVacios() {
    const cantidadItemsFiltrados = this.itemsFiltrados.length;
    const faltantes = this.totalSlots - cantidadItemsFiltrados;
    return faltantes > 0 ? new Array(faltantes) : [];
  }
}
