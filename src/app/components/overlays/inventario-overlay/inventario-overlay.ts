import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inventario-overlay',
  imports: [],
  templateUrl: './inventario-overlay.html',
  styleUrl: './inventario-overlay.css',
})
export class InventarioOverlay {
  @Input() datos: any;

}
