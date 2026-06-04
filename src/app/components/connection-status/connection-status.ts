import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connection-status.html',
  styleUrl: './connection-status.css',
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  ping: number = 0;
  status: 'good' | 'warning' | 'bad' | 'offline' = 'offline';
  isOnline: boolean = false;
  statusText: string = 'Sin conexión';
  private intervalId: any;
  private onOnlineHandler = () => {
    this.isOnline = true;
    this.statusText = 'Conectando...';
    this.measurePing();
  };
  private onOfflineHandler = () => {
    this.isOnline = false;
    this.status = 'offline';
    this.statusText = 'Sin conexión';
    this.ping = 0;
  };

  ngOnInit() {
    // Escuchar cambios inmediatos en el estado de la red
    window.addEventListener('online', this.onOnlineHandler);
    window.addEventListener('offline', this.onOfflineHandler);

    this.checkConnection();
    // Verificar conexión periódicamente
    this.intervalId = setInterval(() => {
      this.checkConnection();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.removeEventListener('online', this.onOnlineHandler);
    window.removeEventListener('offline', this.onOfflineHandler);
  }

  private checkConnection() {
    // Verificar si hay conexión a internet
    this.isOnline = navigator.onLine;

    if (!this.isOnline) {
      this.status = 'offline';
      this.statusText = 'Sin conexión';
      this.ping = 0;
      return;
    }

    // Medir el ping enviando una solicitud al servidor
    this.measurePing();
  }

  private async measurePing() {
    const url = 'https://api.ipify.org?format=json';
    const start = performance.now();
    try {
      const resp = await fetch(url, { cache: 'no-store', mode: 'cors' });
      const end = performance.now();
      if (!resp.ok) throw new Error('no response');
      this.ping = Math.round(end - start);
      this.updateStatus();
    } catch (err) {
      // Si falla el fetch puede ser bloqueo CORS o falta de ruta externa.
      this.status = 'bad';
      this.statusText = 'No se puede alcanzar el host';
      this.ping = 0;
    }
  }

  private updateStatus() {
    if (this.ping < 50) {
      this.status = 'good';
      this.statusText = 'Conexión excelente';
    } else if (this.ping < 150) {
      this.status = 'warning';
      this.statusText = 'Conexión aceptable';
    } else {
      this.status = 'bad';
      this.statusText = 'Conexión lenta';
    }
  }
}
