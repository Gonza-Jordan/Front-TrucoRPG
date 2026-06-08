import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// La API BarcodeDetector aún no está en los tipos del DOM de TypeScript.
declare const BarcodeDetector: any;

/**
 * Escáner de QR reutilizable. Abre la cámara del dispositivo y, al detectar un QR,
 * emite el código de sala (6 caracteres) por `codigoLeido`.
 *
 * El QR generado por la app codifica una URL del tipo `.../unirse?code=ABC123`,
 * pero el escáner también acepta un QR que contenga el código de sala "pelado".
 *
 * Usa la API nativa `BarcodeDetector` (Chrome/Edge/Android). Si el navegador no la
 * soporta, muestra un aviso para que el usuario ingrese el código a mano.
 */
@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.css',
})
export class QrScannerComponent implements OnInit, OnDestroy {
  /** Emite el código de sala detectado (mayúsculas, sin espacios). */
  @Output() codigoLeido = new EventEmitter<string>();
  /** Emite cuando el usuario cierra el escáner sin leer nada. */
  @Output() cerrado = new EventEmitter<void>();

  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;

  estado: 'iniciando' | 'escaneando' | 'sin-soporte' | 'sin-permiso' | 'error' = 'iniciando';
  mensajeError = '';

  private stream: MediaStream | null = null;
  private detector: any = null;
  private rafId: any = null;
  private detenido = false;

  async ngOnInit(): Promise<void> {
    if (typeof BarcodeDetector === 'undefined') {
      this.estado = 'sin-soporte';
      return;
    }

    try {
      const formatos: string[] = await BarcodeDetector.getSupportedFormats();
      if (!formatos.includes('qr_code')) {
        this.estado = 'sin-soporte';
        return;
      }
      this.detector = new BarcodeDetector({ formats: ['qr_code'] });
    } catch {
      this.estado = 'sin-soporte';
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
    } catch (e: any) {
      this.estado = e?.name === 'NotAllowedError' ? 'sin-permiso' : 'error';
      this.mensajeError =
        this.estado === 'sin-permiso'
          ? 'Permití el acceso a la cámara para escanear el QR.'
          : 'No se pudo abrir la cámara.';
      return;
    }

    const video = this.videoRef.nativeElement;
    video.srcObject = this.stream;
    video.setAttribute('playsinline', 'true');
    await video.play().catch(() => {});

    this.estado = 'escaneando';
    this.escanear();
  }

  ngOnDestroy(): void {
    this.detener();
  }

  cerrar(): void {
    this.detener();
    this.cerrado.emit();
  }

  private escanear = async (): Promise<void> => {
    if (this.detenido || !this.detector) return;

    const video = this.videoRef.nativeElement;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      try {
        const codigos = await this.detector.detect(video);
        if (codigos && codigos.length > 0) {
          const crudo = (codigos[0].rawValue ?? '').toString();
          const codigo = this.extraerCodigo(crudo);
          if (codigo) {
            this.detener();
            this.codigoLeido.emit(codigo);
            return;
          }
        }
      } catch {
        // Detección puntual fallida: seguimos intentando en el próximo frame.
      }
    }

    this.rafId = requestAnimationFrame(this.escanear);
  };

  /**
   * Obtiene el código de sala a partir del contenido del QR.
   * Acepta tanto una URL `...?code=ABC123` como el código "pelado".
   */
  private extraerCodigo(crudo: string): string | null {
    const texto = crudo.trim();
    if (!texto) return null;

    // 1) Intentar leer el parámetro ?code= de una URL.
    try {
      const url = new URL(texto);
      const param = url.searchParams.get('code') ?? url.searchParams.get('codigo');
      if (param) return param.toUpperCase().trim();
    } catch {
      // No era una URL válida; seguimos con el texto crudo.
    }

    // 2) Tomar los caracteres alfanuméricos (códigos de 6 caracteres).
    const limpio = texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return limpio.length >= 4 ? limpio.slice(-6) : null;
  }

  private detener(): void {
    this.detenido = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
}
