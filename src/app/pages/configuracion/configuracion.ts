import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Card } from '../../components/card/card';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';
import { AudioService } from '../../services/audio.service';

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

  private audio = inject(AudioService);

  constructor(private router: Router) {}

  onVolumenChange(): void {
    this.audio.setVolumen(this.volumen);
  }

  onMusicaChange(): void {
    this.audio.setMusica(this.musica);
  }

  guardar() {
    localStorage.setItem('cfg_pantalla', String(this.pantallaCompleta));
    this.aplicarPantallaCompleta(this.pantallaCompleta);
    this.router.navigate(['/home']);
  }

  cancelar() {
    this.router.navigate(['/home']);
  }

  private aplicarPantallaCompleta(activar: boolean): void {
    if (activar) {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    } else {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      }
    }
  }
}
