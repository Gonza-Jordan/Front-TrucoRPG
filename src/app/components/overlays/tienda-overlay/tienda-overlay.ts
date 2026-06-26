import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CategoriaTienda } from '../../../interfaces/categoriaTienda';
import { ObjetoTienda } from '../../../interfaces/ObjetoTienda';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tienda-overlay',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './tienda-overlay.html',
  styleUrls: ['./tienda-overlay.css'],
})
export class TiendaOverlayComponent implements OnInit {
  private http = inject(HttpClient);

  datos: CategoriaTienda[] = [];
  objetoActivo: ObjetoTienda | null = null;

  ngOnInit() {
    this.cargarTienda();
  }

  cargarTienda() {
    this.http.get<CategoriaTienda[]>(`${environment.apiUrl}/api/Tienda`).subscribe({
      next: (res) => {
        this.datos = res;
      },
      error: (err) => console.error('Error al cargar la tienda', err),
    });
  }

  mostrarInfo(objeto: ObjetoTienda) {
    this.objetoActivo = objeto;
  }

  ocultarInfo() {
    this.objetoActivo = null;
  }

  comprar(objeto: ObjetoTienda) {
    console.log(`Compraste: ${objeto.nombre} (mentira no compraste nada jeje :P)`);
  }
}
