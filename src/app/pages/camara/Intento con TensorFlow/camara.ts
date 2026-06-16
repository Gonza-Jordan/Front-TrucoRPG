import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { FaceLandmarksDetector, Face } from '@tensorflow-models/face-landmarks-detection';

@Component({
  standalone: true,
  selector: 'app-camara',
  imports: [RouterLink],
  templateUrl: './camara.html',
  styleUrls: ['./camara.css'],
})
export class Camara implements AfterViewInit, OnDestroy {

  // Este componente es un prototipo de detección de gestos faciales usando TensorFlow.js y MediaPipe Face Mesh.
  // Detecta gestos como cejas levantadas, guiños, boca torcida, labios mordidos/fruncidos, y ojos cerrados.
  // Cada gesto se mapea a una "seña" de Truco (As de Espada, As de Basto, Siete de Espada, Siete de Oro, Tres, Dos, Cartas bajas).
  // Se implementan mecanismos de estabilidad temporal para evitar falsos positivos (ej. requerir que un guiño se mantenga por 700ms).
  // El componente también incluye calibración automática al iniciar la cámara para adaptarse a diferentes rostros y condiciones de iluminación.

  @ViewChild('videoElement', { static: false }) videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;

  cameraOn = false;
  cameraStatus = 'Cámara apagada';
  expressionLabel = 'Ninguna';
  expressionTranslation = '...';


  private detector?: FaceLandmarksDetector;
  private rafId?: number;
  private stream?: MediaStream;
  private baselineInitialized = false;
  private baselineMouthWidth = 0;
  private baselineMouthHeight = 0;
  private baselineBrowEyeDistance = 0;
  private baselineEyeOpen = 0; // normalized
  private winkStartTimestamp?: number;
  private frameCounter = 0;
  private lastLoggedGesture: string | null = null;
  private faceFound = false;
  private pendingLabel: string | null = null;
  private pendingLabelStart?: number;

  ngAfterViewInit() {
    // Listo para iniciar cuando el usuario presione el botón.
  }

  //PRIMERO DEFINIMOS QUE ES UN GUIÑO IZQUIEDO

  async toggleCamera() {
    if (this.cameraOn) {
      this.stopCamera();
      return;
    }
    await this.startCamera();

  }

  async GuiñoIzquierdo() {
    const eyeBlinkLeft = 0.9; // Simulación de un valor de parpadeo del ojo izquierdo
    const eyeBlinkRight = 0.1; // Simulación de un valor de parpadeo del ojo derecho
      if (
      eyeBlinkLeft > 0.8 &&
      eyeBlinkRight < 0.2
    ) {
      console.log("Guiño izquierdo");
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  private async startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraStatus = 'Este navegador no soporta cámara.';
      return;
    }

    this.cameraStatus = 'Solicitando acceso a la cámara...';

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const video = this.videoRef?.nativeElement;
      if (!video) {
        this.cameraStatus = 'No se encontró el elemento de video.';
        return;
      }

      video.srcObject = this.stream;
      await video.play();

      // Esperar a que el video tenga dimensiones válidas antes de crear el detector
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
          resolve();
          return;
        }
        const onLoaded = () => {
          video.removeEventListener('loadeddata', onLoaded);
          resolve();
        };
        video.addEventListener('loadeddata', onLoaded);
        // Fallback por si el evento no se dispara
        setTimeout(() => resolve(), 1200);
      });

      // Inicializar tamaño del canvas con las dimensiones del video
      if (this.canvasRef?.nativeElement) {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      await tf.ready();
      // Try to use WebGL backend for better performance and detection reliability
      try {
        await tf.setBackend && (await tf.setBackend('webgl'));
        await tf.ready();
      } catch (e) {
        // ignore webgl backend failures silently
      }

      this.detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          maxFaces: 1,
          refineLandmarks: false,
        }
      );

      // calibrar baseline para evitar falsos positivos (muestra ~30 frames ~1s)
      try {
        await this.calibrateBaseline();
      } catch (e) {
        // ignore calibration failures
      }

      this.cameraOn = true;
      this.cameraStatus = 'Cámara activa. Detectando...';
      this.runDetection();
    } catch (error) {
      console.error(error);
      this.cameraStatus = 'Error al iniciar la cámara.';
    }
  }

  private stopCamera() {
    this.cameraOn = false;
    this.cameraStatus = 'Cámara apagada';
    this.expressionLabel = 'Ninguna';
    this.expressionTranslation = '...';
    this.baselineInitialized = false;
    this.winkStartTimestamp = undefined;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
    }

    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.pause();
      this.videoRef.nativeElement.srcObject = null;
    }
  }

  private async calibrateBaseline() {
    if (!this.detector || !this.videoRef?.nativeElement || !this.canvasRef?.nativeElement) return;
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const samples = 30;
    let sumMouthWidth = 0;
    let sumMouthHeight = 0;
    let sumBrowEye = 0;
    let sumEyeOpenNorm = 0;
    let valid = 0;

    for (let i = 0; i < samples; i++) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const faces = await this.detector.estimateFaces(this.canvasRef!.nativeElement, { flipHorizontal: true });
        if (faces && faces.length > 0) {
          const face = faces[0];
          const get = (index: number) => face.keypoints[index];
          const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
          const mouthLeft = get(61);
          const mouthRight = get(291);
          const mouthTop = get(13);
          const mouthBottom = get(14);
          const mouthWidth = distance(mouthLeft, mouthRight);
          const mouthHeight = distance(mouthTop, mouthBottom);
          const leftBrow = get(70);
          const rightBrow = get(300);
          const leftEyeCenter = { x: (get(33).x + get(133).x) / 2, y: (get(159).y + get(145).y) / 2 };
          const rightEyeCenter = { x: (get(362).x + get(263).x) / 2, y: (get(386).y + get(374).y) / 2 };
          const browEyeDistance = (distance(leftBrow, leftEyeCenter) + distance(rightBrow, rightEyeCenter)) / 2;
          const leftEyeTop = get(159);
          const leftEyeBottom = get(145);
          const rightEyeTop = get(386);
          const rightEyeBottom = get(374);
          const leftEyeHeight = distance(leftEyeTop, leftEyeBottom);
          const rightEyeHeight = distance(rightEyeTop, rightEyeBottom);
          const faceWidth = distance(get(33), get(263));

          sumMouthWidth += mouthWidth;
          sumMouthHeight += mouthHeight;
          sumBrowEye += browEyeDistance;
          sumEyeOpenNorm += (leftEyeHeight + rightEyeHeight) / 2 / Math.max(faceWidth, 1);
          valid++;
        }
      } catch (e) {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 33));
    }

    if (valid > 0) {
      this.baselineMouthWidth = sumMouthWidth / valid;
      this.baselineMouthHeight = sumMouthHeight / valid;
      this.baselineBrowEyeDistance = sumBrowEye / valid;
      this.baselineEyeOpen = sumEyeOpenNorm / valid;
      this.baselineInitialized = true;
    }
  }

  private runDetection = async () => {
    if (!this.cameraOn || !this.detector || !this.videoRef?.nativeElement || !this.canvasRef?.nativeElement) {
      return;
    }

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const faces = await this.detector.estimateFaces(video, { flipHorizontal: true });
      this.frameCounter = (this.frameCounter + 1) % 120;

      if (faces.length === 0) {
        // Intento alternativo: usar el canvas como entrada (a veces mejora en algunos navegadores)
        if (this.frameCounter % 30 === 0) {
          try {
            const facesCanvas = await this.detector.estimateFaces(this.canvasRef!.nativeElement, { flipHorizontal: true });
            if (facesCanvas.length > 0) {
              this.cameraStatus = 'Rostro detectado (canvas)';
              this.drawFace(ctx, facesCanvas[0]);
              this.updateExpression(facesCanvas[0]);
              this.rafId = requestAnimationFrame(this.runDetection);
              return;
            }
          } catch (innerErr) {
            // silent fallback failure
          }
        }

        this.cameraStatus = 'Buscando rostro...';
        // don't clear a previously confirmed seña; keep it until a new one is confirmed
        this.faceFound = false;
      } else {
        // primer frame donde se detecta un rostro: marcar encontrado y mostrar 'Ninguna'
        if (!this.faceFound) {
          this.faceFound = true;
          this.expressionLabel = 'Ninguna';
          this.expressionTranslation = '...';
        }
        this.cameraStatus = 'Rostro detectado';
        this.drawFace(ctx, faces[0]);
        this.updateExpression(faces[0]);
      }
    } catch (err) {
      // keep UI state but avoid noisy console output
      this.cameraStatus = 'Error detectando rostro.';
    }

    // Log solamente cuando surge una seña concreta (evita flood de logs)
    const currentGesture = this.expressionLabel || '';
    if (currentGesture !== 'Neutral' && currentGesture !== 'Ninguna') {
      if (this.lastLoggedGesture !== currentGesture) {
        console.log('Seña detectada:', currentGesture, '->', this.expressionTranslation || '');
        this.lastLoggedGesture = currentGesture;
      }
    } else {
      this.lastLoggedGesture = null;
    }

    // Log solamente cuando surge una seña concreta (evita flood de logs)
    if (this.frameCounter === 0) {
      // frameCounter rolls; check a separate probe counter
      if (!('mediapipeProbe' in (this as any))) (this as any).mediapipeProbe = 0;
      (this as any).mediapipeProbe += 1;
      if ((this as any).mediapipeProbe === 8) { // tras ~8*120 frames cycles (~a while)
          try {
          // intentar reinicializar con mediapipe si las detecciones no aparecen
          const newDetector = await faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            {
              runtime: 'mediapipe',
              solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
              maxFaces: 1,
              refineLandmarks: true,
            } as any
          );
          if (newDetector) {
            this.detector = newDetector;
            console.debug('Recreated detector with mediapipe runtime');
          }
        } catch (e) {
          console.warn('Failed to create mediapipe runtime detector', e);
        }
      }
    }

    this.rafId = requestAnimationFrame(this.runDetection);
  };

    private drawFace(ctx: CanvasRenderingContext2D, face: Face) {
    ctx.strokeStyle = 'rgba(65, 44, 158, 0.8)';
    ctx.lineWidth = 2;
    for (const point of face.keypoints) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(65, 44, 158, 0.8)';
      ctx.fill();
    }
  }

  private updateExpression(face: Face) {
    const keypoints = face.keypoints;
    const get = (index: number) => keypoints[index];
    const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const mouthLeft = get(61);
    const mouthRight = get(291);
    const mouthTop = get(13);
    const mouthBottom = get(14);
    const lipCenter = { x: (mouthLeft.x + mouthRight.x) / 2, y: (mouthTop.y + mouthBottom.y) / 2 };
    const mouthWidth = distance(mouthLeft, mouthRight);
    const mouthHeight = distance(mouthTop, mouthBottom);
    const mouthOpenRatio = mouthHeight / Math.max(mouthWidth, 1);

    const leftEyeTop = get(159);
    const leftEyeBottom = get(145);
    const rightEyeTop = get(386);
    const rightEyeBottom = get(374);
    const leftEyeHeight = distance(leftEyeTop, leftEyeBottom);
    const rightEyeHeight = distance(rightEyeTop, rightEyeBottom);

    const leftBrow = get(70);
    const rightBrow = get(300);
    const leftEyeCenter = { x: (get(33).x + get(133).x) / 2, y: (get(159).y + get(145).y) / 2 };
    const rightEyeCenter = { x: (get(362).x + get(263).x) / 2, y: (get(386).y + get(374).y) / 2 };
    const browEyeDistance = (distance(leftBrow, leftEyeCenter) + distance(rightBrow, rightEyeCenter)) / 2;

    const faceWidth = distance(get(33), get(263));
    const faceCenterX = (get(33).x + get(263).x) / 2;
    const mouthOffsetX = (mouthLeft.x + mouthRight.x) / 2 - faceCenterX;
    const mouthShiftRatio = mouthOffsetX / Math.max(faceWidth, 1);
    const noseTip = get(1);
    const leftNoseDist = Math.abs(noseTip.x - get(33).x);
    const rightNoseDist = Math.abs(get(263).x - noseTip.x);
    const headYawRatio = Math.abs(leftNoseDist - rightNoseDist) / Math.max(faceWidth, 1);
    const headTurned = headYawRatio > 0.08;

    if (!this.baselineInitialized) {
      this.baselineMouthWidth = mouthWidth;
      this.baselineMouthHeight = mouthHeight;
      this.baselineBrowEyeDistance = browEyeDistance;
      // store a normalized eye-open baseline relative to face width
      this.baselineEyeOpen = (leftEyeHeight + rightEyeHeight) / 2 / Math.max(faceWidth, 1);
      this.baselineInitialized = true;
    }
    const eyebrowRaised = browEyeDistance > this.baselineBrowEyeDistance * 1.12;
    const strongAsymmetry = Math.abs(mouthShiftRatio) > 0.05;
    const mouthShiftRight = !headTurned && mouthShiftRatio > 0.06 && strongAsymmetry;
    const mouthShiftLeft = !headTurned && mouthShiftRatio < -0.06 && strongAsymmetry;

    // Normalize eye heights by face width to avoid absolute pixel thresholds
    const leftEyeOpenNorm = leftEyeHeight / Math.max(faceWidth, 1);
    const rightEyeOpenNorm = rightEyeHeight / Math.max(faceWidth, 1);
    const avgEyeOpen = (leftEyeOpenNorm + rightEyeOpenNorm) / 2;

    const eyeClosedThreshold = Math.max(this.baselineEyeOpen * 0.6, 0.012); // don't go below absolute floor
    const eyeOpenThreshold = Math.max(this.baselineEyeOpen * 0.9, 0.018);

    const leftEyeClosed = leftEyeOpenNorm < eyeClosedThreshold;
    const rightEyeClosed = rightEyeOpenNorm < eyeClosedThreshold;
    const eyesClosed = leftEyeClosed && rightEyeClosed;
    const wink = (leftEyeClosed && !rightEyeClosed) || (rightEyeClosed && !leftEyeClosed);

    // lip gestures should require eyes not strongly squinted to avoid interference
    const lipsAllowed = avgEyeOpen > (this.baselineEyeOpen * 0.5);

    const lipBite = lipsAllowed && mouthOpenRatio < 0.035 && mouthWidth < this.baselineMouthWidth * 0.8;
    const lipPurse = lipsAllowed && mouthWidth < this.baselineMouthWidth * 0.80 && mouthOpenRatio < 0.06;

    const now = performance.now();

    // Wink: requiere 700ms para confirmar
    if (wink) {
      if (!this.winkStartTimestamp) this.winkStartTimestamp = now;
      const winkTime = now - this.winkStartTimestamp;
      if (winkTime >= 700) {
        this.commitPendingLabel('As de Basto', 'Guiño detectado - Segunda carta más alta');
        return;
      }
      // transient, don't commit
      return;
    }
    this.winkStartTimestamp = undefined;

    // Ojos cerrados: requerir estabilidad 500ms
    if (eyesClosed) {
      if (!this.pendingLabel || this.pendingLabel !== 'Cartas bajas') {
        this.pendingLabel = 'Cartas bajas';
        this.pendingLabelStart = now;
      }
      if (this.pendingLabelStart && now - this.pendingLabelStart >= 700) {
        this.commitPendingLabel('Cartas bajas', 'Cierra ambos ojos - cartas de valor bajo');
      }
      return;
    }

    // Reset pending if a different condition appears
    if (this.pendingLabel && this.pendingLabel !== 'Cartas bajas') {
      this.pendingLabel = null;
      this.pendingLabelStart = undefined;
    }

    // Ceja levantada
    if (eyebrowRaised) {
      this.commitPendingLabel('As de Espada', 'Cejas levantadas - carta más alta');
      return;
    }

    if (mouthShiftRight && strongAsymmetry) {
      this.commitPendingLabel('Siete de Espada', 'Mueca hacia la derecha - tercera carta más alta');
      return;
    }

    if (mouthShiftLeft && strongAsymmetry) {
      this.commitPendingLabel('Siete de Oro', 'Mueca hacia la izquierda - cuarta carta más alta');
      return;
    }

    if (lipBite) {
      this.commitPendingLabel('Tres', 'Morder labio inferior - cualquier 3');
      return;
    }

    if (lipPurse) {
      this.commitPendingLabel('Dos', 'Labios fruncidos - cualquier 2');
      return;
    }

    // No new seña detected; do not clear a previously confirmed seña. Keep neutral as placeholder until a seña is detected.
    return;
  }

  private commitPendingLabel(label: string, translation: string) {
    // If same as current confirmed, do nothing
    if (this.expressionLabel === label) return;
    this.expressionLabel = label;
    this.expressionTranslation = translation;
    // log once (throttled by lastLoggedGesture)
    if (this.lastLoggedGesture !== label) {
      console.log('Seña detectada:', label, '->', translation);
      this.lastLoggedGesture = label;
    }
    // clear pending
    this.pendingLabel = null;
    this.pendingLabelStart = undefined;
  }



}

/*





  private async startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraStatus = 'Este navegador no soporta cámara.';
      return;
    }

    this.cameraStatus = 'Solicitando acceso a la cámara...';

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const video = this.videoRef?.nativeElement;
      if (!video) {
        this.cameraStatus = 'No se encontró el elemento de video.';
        return;
      }

      video.srcObject = this.stream;
      await video.play();

      // Esperar a que el video tenga dimensiones válidas antes de crear el detector
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
          resolve();
          return;
        }
        const onLoaded = () => {
          video.removeEventListener('loadeddata', onLoaded);
          resolve();
        };
        video.addEventListener('loadeddata', onLoaded);
        // Fallback por si el evento no se dispara
        setTimeout(() => resolve(), 1200);
      });

      // Inicializar tamaño del canvas con las dimensiones del video
      if (this.canvasRef?.nativeElement) {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      await tf.ready();
      // Try to use WebGL backend for better performance and detection reliability
      try {
        await tf.setBackend && (await tf.setBackend('webgl'));
        await tf.ready();
      } catch (e) {
        // ignore webgl backend failures silently
      }

      this.detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          maxFaces: 1,
          refineLandmarks: false,
        }
      );

      // calibrar baseline para evitar falsos positivos (muestra ~30 frames ~1s)
      try {
        await this.calibrateBaseline();
      } catch (e) {
        // ignore calibration failures
      }

      this.cameraOn = true;
      this.cameraStatus = 'Cámara activa. Detectando...';
      this.runDetection();
    } catch (error) {
      console.error(error);
      this.cameraStatus = 'Error al iniciar la cámara.';
    }
  }












  */
