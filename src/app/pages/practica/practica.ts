import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-practica',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './practica.html',
  styleUrl: './practica.css',
})
export class PracticaComponent {
  private router = inject(Router);
  jugar(): void {
    localStorage.removeItem('heroeId');
    localStorage.setItem('practicaEscenario', '1');
    this.router.navigate(['/jugar/solitario']);
  }
}
