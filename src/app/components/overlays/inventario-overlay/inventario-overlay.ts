import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoriaService } from '../../../services/historia/historia-service';
import { INVENTARIO } from '../../../../game/data/inventario';

@Component({
  selector: 'app-inventario-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario-overlay.html',
  styleUrl: './inventario-overlay.css',
})
export class InventarioOverlay {

  inventarioCompleto = INVENTARIO;

  categoriaActiva: string = 'TODO';
  totalSlots: number = 12;

  constructor(private historiaService: HistoriaService) {}

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
  }

  seleccionarItem(item: any) {
    if (item.categoria === 'ARMARIO' && item.spriteKey) {
      const quiereEquipar = confirm(`¿Querés equipar ${item.nombre}?`);
      if (quiereEquipar) {
        this.historiaService.equiparSkinDesdeArmario(item.spriteKey);
      }
    }
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