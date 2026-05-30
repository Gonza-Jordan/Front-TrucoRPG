import { Component, OnInit, OnDestroy } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status';
import { SalaService } from '../../services/sala.service';

@Component({
  selector: 'app-menu-multijugador-tradicional-sala',
  imports: [Header, Footer, CommonModule, ConnectionStatusComponent],
  templateUrl: './menu-multijugador-tradicional-sala.html',
  styleUrl: './menu-multijugador-tradicional-sala.css',
})
export class MenuMultijugadorTradicionalSala implements OnInit, OnDestroy {
  mode: 'crear' | 'unirse' = 'crear';
  codigoSala = '';
  copiado = false;

  salaLista = false;
  miListo = false;
  errorMsg = '';
  cargandoConexion = true;

  private subs: Subscription[] = [];

  constructor(
    public sala: SalaService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.mode = (this.route.snapshot.queryParamMap.get('mode') as any) ?? 'crear';

    this.subs.push(
      this.sala.codigoSala$.subscribe(c => (this.codigoSala = c)),
      this.sala.salaLista$.subscribe(v => (this.salaLista = v)),
      this.sala.miListo$.subscribe(v => (this.miListo = v)),
      this.sala.juegoIniciado$.subscribe(v => {
        if (v) this.router.navigate(['/juego/multi']);
      }),
      this.sala.jugadorDesconectado$.subscribe(v => {
        if (v) {
          this.errorMsg = 'El oponente se desconectó.';
          this.salaLista = false;
          this.miListo = false;
        }
      }),
    );

    if (this.mode === 'crear') {
      try {
        await this.sala.conectar();
        await this.sala.crearSala();
      } catch {
        this.errorMsg = 'No se pudo conectar al servidor.';
      }
    }
    // mode 'unirse': la conexión y join ya ocurrieron en el menú anterior
    this.cargandoConexion = false;
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  async copiarCodigo() {
    if (!this.codigoSala) return;
    await navigator.clipboard.writeText(this.codigoSala).catch(() => {});
    this.copiado = true;
    setTimeout(() => (this.copiado = false), 2000);
  }

  async comenzar() {
    if (this.miListo) return;
    try {
      await this.sala.listoParaJugar();
    } catch {
      this.errorMsg = 'Error al comunicarse con el servidor.';
    }
  }

  async abandonar() {
    await this.sala.abandonar();
    this.router.navigate(['/menu-multijugador-tradicional']);
  }
}
