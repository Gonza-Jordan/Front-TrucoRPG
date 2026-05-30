import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('TrucoRPG-Front');

  private readonly _esTactil =
    navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  ngOnInit(): void {
    if (this._esTactil) {
      screen.orientation?.addEventListener('change', this._onOrientationChange);
    }
  }

  ngOnDestroy(): void {
    screen.orientation?.removeEventListener('change', this._onOrientationChange);
  }

  private _onOrientationChange = () => {
    if (screen.orientation?.type?.includes('landscape') && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };
}
