import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { LoginComponent } from './auth/login/login.component';
import { Home } from './pages/home/home';
import { LandingPage } from './pages/landing-page/landing-page';
import { ConfiguracionComponent } from './pages/configuracion/configuracion';
import { MenuMultijugador } from './pages/menu-multijugador/menu-multijugador';
import { MenuMultijugadorTradicional } from './pages/menu-multijugador-tradicional/menu-multijugador-tradicional';
import { MenuMultijugadorTradicionalSala } from './pages/menu-multijugador-tradicional-sala/menu-multijugador-tradicional-sala';

export const routes: Routes = [
  { path: '', component: LandingPage, data: { header: 'landing' } },
  { path: 'registro', component: RegistroComponent, data: { header: 'registro' } },
  { path: 'login', component: LoginComponent, data: { header: 'login' } },
  { path: 'home', component: Home, data: { header: 'home' } },
  { path: 'configuracion', component: ConfiguracionComponent, data: { header: 'configuracion' } },
  { path: 'juego/:modo', component: GameComponent },
  { path: 'menu-multijugador', component: MenuMultijugador, data: { header: 'menu-multijugador' } },
  { path: 'menu-multijugador-tradicional', component: MenuMultijugadorTradicional, data: { header: 'menu-multijugador-tradicional' } },
  { path: 'menu-multijugador-tradicional-sala', component: MenuMultijugadorTradicionalSala, data: { header: 'menu-multijugador-tradicional-sala' } },
  { path: '**', redirectTo: '' },
];
