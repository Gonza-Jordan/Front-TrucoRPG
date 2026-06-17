import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('TrucoRPG-Front');

  /** True en pantallas de juego (requieren landscape). Los menús funcionan en portrait. */
  protected readonly esRutaJuego = signal(false);

  private readonly _esTactil =
    navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  private audio = inject(AudioService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this._esTactil) {
      screen.orientation?.addEventListener('change', this._onOrientationChange);
    }

    document.addEventListener('click', this._onButtonClick);

    const rutasPartida = ['/maquina', '/juego/multi', '/jugar/solitario'];
    const rutasJuego   = ['/maquina', '/juego', '/jugar'];

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects as string;
        const enPartida = rutasPartida.some(r => url.startsWith(r));
        this.esRutaJuego.set(rutasJuego.some(r => url.startsWith(r)));
        if (enPartida) {
          this.audio.pausar();
        } else {
          this.audio.sincronizar();
        }
      });
  }

  ngOnDestroy(): void {
    screen.orientation?.removeEventListener('change', this._onOrientationChange);
    document.removeEventListener('click', this._onButtonClick);
  }

  private _onButtonClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a[routerLink], a[href]')) {
      this.audio.playButton();
    }
  };

  solicitarPantallaCompleta(): void {
    document.documentElement.requestFullscreen().catch(() => {});
  }

  private _onOrientationChange = () => {
    if (screen.orientation?.type?.includes('landscape') && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };
}