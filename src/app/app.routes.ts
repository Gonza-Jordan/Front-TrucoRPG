import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { LoginComponent } from './auth/login/login.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

export const routes: Routes = [
  { path: '', component: GameComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: '**', redirectTo: '' },
];
