import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class SalaService {
  private hub: signalR.HubConnection;

  codigoSala$ = new BehaviorSubject<string>('');
  salaLista$ = new BehaviorSubject<boolean>(false);
  miListo$ = new BehaviorSubject<boolean>(false);
  juegoIniciado$ = new BehaviorSubject<boolean>(false);
  jugadorDesconectado$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string>('');

  constructor(private auth: AuthService) {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.auth.obtenerToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hub.on('SalaLista', () => {
      this.salaLista$.next(true);
    });

    // Cuando ambos llaman ListoParaJugar el servidor emite TrucoEstado
    this.hub.on('TrucoEstado', () => {
      this.juegoIniciado$.next(true);
    });

    this.hub.on('JugadorDesconectado', () => {
      this.salaLista$.next(false);
      this.miListo$.next(false);
      this.jugadorDesconectado$.next(true);
    });
  }

  async conectar(): Promise<void> {
    if (this.hub.state !== signalR.HubConnectionState.Disconnected) return;
    await this.hub.start();
  }

  async crearSala(): Promise<string> {
    const codigo = await this.hub.invoke<string>('CrearSala');
    this.codigoSala$.next(codigo);
    return codigo;
  }

  async unirseASala(codigo: string): Promise<boolean> {
    const ok = await this.hub.invoke<boolean>('UnirseASala', codigo.toUpperCase().trim());
    if (ok) {
      this.codigoSala$.next(codigo.toUpperCase().trim());
      // El backend emite SalaLista al grupo (incluye a este jugador)
    }
    return ok;
  }

  async listoParaJugar(): Promise<void> {
    this.miListo$.next(true);
    await this.hub.invoke('ListoParaJugar');
  }

  async abandonar(): Promise<void> {
    this.reset();
    try { await this.hub.stop(); } catch { /* ignore */ }
  }

  reset(): void {
    this.codigoSala$.next('');
    this.salaLista$.next(false);
    this.miListo$.next(false);
    this.juegoIniciado$.next(false);
    this.jugadorDesconectado$.next(false);
    this.error$.next('');
  }
}
