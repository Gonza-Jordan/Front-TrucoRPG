import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-boton',
  templateUrl: './boton.html',
  styleUrl: './boton.css'
})
export class Boton {
  @Input() enlace: string = '';
  @Input() tipo: 'button' | 'submit' = 'button';
  @Input() disabled: boolean = false;
  @Input() accion: () => void = () => {};

  private router = inject(Router);

  onClick() {
    if (this.enlace){
      this.router.navigate([this.enlace]);
   }

    if (this.accion) {
      this.accion();
   }
 }
}
