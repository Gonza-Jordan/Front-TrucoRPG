import { Component,inject,signal } from '@angular/core';
import { RouterModule,ActivatedRoute,NavigationEnd,Router } from '@angular/router';
import { filter } from 'rxjs';
import { Boton } from '../boton/boton';

@Component({
  selector: 'app-header',
  imports: [RouterModule, Boton],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  headerType = signal('');

  constructor() {
    // Leer la ruta actual inmediatamente (cubre refresh y navegación directa)
    this.actualizarTipo();

    // Escuchar navegaciones futuras
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.actualizarTipo());
  }

  private actualizarTipo(): void {
    let currentRoute = this.router.routerState.root;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const data = currentRoute.snapshot.data;
    this.headerType.set(data['header'] || 'default');
  }

}