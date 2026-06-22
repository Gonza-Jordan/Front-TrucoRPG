import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TIENDA } from '../../../../game/data/tienda';
import { CategoriaTienda } from '../../../interfaces/categoriaTienda';
import { ObjetoTienda } from '../../../interfaces/ObjetoTienda';

@Component({
  selector: 'app-tienda-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda-overlay.html',
  styleUrls: ['./tienda-overlay.css'],
})
export class TiendaOverlayComponent {
  datos: CategoriaTienda[] = TIENDA;

  objetoActivo: ObjetoTienda | null = null;

  mostrarInfo(objeto: ObjetoTienda) {
    this.objetoActivo = objeto;
  }

  ocultarInfo() {
    this.objetoActivo = null;
  }

  comprar(objeto: ObjetoTienda) {
    console.log(`Compraste: ${objeto.nombre}`);
  }
}
