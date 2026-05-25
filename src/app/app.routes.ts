import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';

export const routes: Routes = [
  { path: '', component: GameComponent },
  {
    path: 'truco-solo',
    loadComponent: () =>
      import('./truco-solo/truco-solo.component').then(m => m.TrucoSoloComponent),
  },
  { path: '**', redirectTo: '' },
];
