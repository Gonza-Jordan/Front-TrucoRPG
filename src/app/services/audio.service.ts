import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private bgMusic: HTMLAudioElement | null = null;

  iniciar(): void {
    const musicaActiva = localStorage.getItem('cfg_musica') !== 'false';
    if (!musicaActiva) return;

    if (!this.bgMusic) {
      this.bgMusic = new Audio('/assets/musica/menu.mp3.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = Number(localStorage.getItem('cfg_volumen') ?? 70) / 100;
      this.bgMusic.play().catch(() => {
        document.addEventListener('click', () => this.bgMusic?.play().catch(() => {}), { once: true });
      });
    }
  }

  setVolumen(valor: number): void {
    localStorage.setItem('cfg_volumen', String(valor));
    if (this.bgMusic) this.bgMusic.volume = valor / 100;
  }

  setMusica(activa: boolean): void {
    localStorage.setItem('cfg_musica', String(activa));
    if (activa) {
      this.iniciar();
    } else {
      this.bgMusic?.pause();
      this.bgMusic = null;
    }
  }

  playButton(): void {
    const audio = new Audio('/assets/musica/buttonselect.mp3');
    audio.volume = Number(localStorage.getItem('cfg_volumen') ?? 70) / 100;
    audio.play().catch(() => {});
  }

  pausar(): void {
    this.bgMusic?.pause();
  }

  sincronizar(): void {
    const musicaActiva = localStorage.getItem('cfg_musica') !== 'false';
    if (!musicaActiva) {
      this.bgMusic?.pause();
      this.bgMusic = null;
      return;
    }
    this.iniciar();
    if (this.bgMusic)
      this.bgMusic.volume = Number(localStorage.getItem('cfg_volumen') ?? 70) / 100;
  }
}
