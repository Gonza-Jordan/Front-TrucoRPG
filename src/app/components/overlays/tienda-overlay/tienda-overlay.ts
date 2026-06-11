// src/app/components/overlays/tienda-overlay/tienda-overlay.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tienda-overlay',
  standalone: true,
  imports: [], // Aquí van otros subcomponentes o módulos si los necesitás
  templateUrl: './tienda-overlay.html',
  styleUrls: ['./tienda-overlay.css']
})
export class TiendaOverlayComponent {
  @Input() datos: any; 

  itemsTienda = [
    { id: 1, nombre: 'Poción de Vida', precio: 50 },
    { id: 2, nombre: 'Espada de Madera', precio: 150 }
  ];

  comprarItem(item: any) {
    console.log(`Compraste: ${item.nombre}`);
  }
}