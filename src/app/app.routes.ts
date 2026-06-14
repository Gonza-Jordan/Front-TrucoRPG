import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { LoginComponent } from './auth/login/login.component';
import { Home } from './pages/home/home';
import { Camara } from './pages/camara/camara';
import { LandingPage } from './pages/landing-page/landing-page';
import { ConfiguracionComponent } from './pages/configuracion/configuracion';
import { MenuMultijugador } from './pages/menu-multijugador/menu-multijugador';
import { MenuMultijugadorTradicional } from './pages/menu-multijugador-tradicional/menu-multijugador-tradicional';
import { MenuMultijugadorTradicionalSala } from './pages/menu-multijugador-tradicional-sala/menu-multijugador-tradicional-sala';
import { MenuMultijugadorTipo } from './pages/menu-multijugador-tipo/menu-multijugador-tipo';
import { Menu2v2EquiposComponent } from './pages/menu-2v2-equipos/menu-2v2-equipos';
import { TrucoSoloComponent } from '../game/truco-solo/truco-solo.component';
import { TrucoMultiComponent } from '../game/truco-multi/truco-multi.component';
import { TrucoMulti2v2Component } from '../game/truco-2v2/truco-2v2.component';
import { TrucoSolo2v2Component } from '../game/truco-solo-2v2/truco-solo-2v2.component';
import { SeleccionPersonaje } from './pages/seleccion-personaje/seleccion-personaje';
import { PartidaSoloComponent } from './components/juego/partida-solo/partida-solo';
import { Tutorial } from './pages/tutorial/tutorial';
import { ReglasTruco } from './pages/reglas-truco/reglas-truco';
import { ValoresCarta } from './pages/valores-carta/valores-carta';
import { Historia } from './components/juego/historia/historia';
import { PracticaComponent } from './pages/practica/practica';
import { UnirseQrComponent } from './pages/unirse-qr/unirse-qr';
import { SeleccionPersonajeHistoria } from './pages/seleccion-personaje-historia/seleccion-personaje-historia';

export const routes: Routes = [
  { path: '', component: LandingPage, data: { header: 'landing' } },
  { path: 'registro', component: RegistroComponent, data: { header: 'registro' } },
  { path: 'login', component: LoginComponent, data: { header: 'login' } },
  { path: 'home', component: Home, data: { header: 'home' } },
  { path: 'camara', component: Camara, data: { header: 'camara' } },
  { path: 'configuracion', component: ConfiguracionComponent, data: { header: 'configuracion' } },
  { path: 'tutorial', component: Tutorial, data: { header: 'tutorial' }},
  { path: 'reglas-truco', component: ReglasTruco, data: { header: 'reglas-truco' }},
  { path: 'valores-carta', component: ValoresCarta, data: { header: 'valores-carta' }},

  { path: 'maquina', component: TrucoSoloComponent },
  { path: 'juego/multi', component: TrucoMultiComponent },
  { path: 'juego/2v2-multi', component: TrucoMulti2v2Component },
  { path: 'juego/:modo', component: GameComponent },
  { path: 'menu-multijugador', component: MenuMultijugador, data: { header: 'home' } },
  { path: 'menu-multijugador-tipo', component: MenuMultijugadorTipo, data: { header: 'home' } },
  { path: 'menu-multijugador-tradicional', component: MenuMultijugadorTradicional, data: { header: 'home' } },
  { path: 'menu-multijugador-tradicional-sala', component: MenuMultijugadorTradicionalSala, data: { header: 'home' } },
  { path: 'menu-2v2-equipos', component: Menu2v2EquiposComponent, data: { header: 'home' } },
  { path: 'seleccion-personaje', component: SeleccionPersonaje, data: { header: 'home' } },
  { path: 'partidaSolo/configuracion', component: PartidaSoloComponent , data: { header: 'home' } },
  { path: 'practica', component: PracticaComponent, data: { header: 'home' } },
  { path: 'jugar/solitario', component: TrucoSoloComponent },
  { path: 'historia', component: Historia, data: { header: 'home' } },
  { path: 'jugar/solitario-2v2', component: TrucoSolo2v2Component },
  { path: 'unirse', component: UnirseQrComponent, data: { header: 'home' } },
  { path: 'seleccion-personaje-historia', component: SeleccionPersonajeHistoria, data: { header: 'home' } },
  { path: '**', redirectTo: '' },
];
