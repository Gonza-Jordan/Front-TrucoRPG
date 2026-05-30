import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Card } from '../../components/card/card';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, PageWrapper],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent {
  volumen = Number(localStorage.getItem('cfg_volumen') ?? 70);
  musica  = localStorage.getItem('cfg_musica') !== 'false';
  pantallaCompleta = localStorage.getItem('cfg_pantalla') === 'true';

  constructor(private router: Router) {}

  guardar() {
    localStorage.setItem('cfg_volumen', String(this.volumen));
    localStorage.setItem('cfg_musica',  String(this.musica));
    localStorage.setItem('cfg_pantalla', String(this.pantallaCompleta));
    this.router.navigate(['/home']);
  }

  cancelar() {
    this.router.navigate(['/home']);
  }
}
