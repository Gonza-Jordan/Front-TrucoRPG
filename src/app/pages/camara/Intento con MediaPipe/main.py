import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from collections import Counter
import math
import time

video = cv2.VideoCapture(0)
video.set(3, 1280)
video.set(4, 720)

base_options = python.BaseOptions(model_asset_path='face_landmarker.task')
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    num_faces=1,
    min_face_detection_confidence=0.5,
    min_face_presence_confidence=0.5,
    min_tracking_confidence=0.5
)

# ── helpers ──────────────────────────────────────────────────────────────────

def distancia(a, b):
    """Distancia euclidiana entre dos puntos (x, y)."""
    return math.hypot(a[0]-b[0], a[1]-b[1])

def landmark_xy(lista, idx):
    return lista[idx][1], lista[idx][2]

def apertura(lista, p_sup, p_inf, p_izq, p_der):
    """
    Calcula el Eye Aspect Ratio (EAR) de un ojo.

    Args:
        lista   : lista de landmarks con formato [id, x, y]
        p_sup   : índice del punto del párpado superior
        p_inf   : índice del punto del párpado inferior
        p_izq   : índice del extremo izquierdo del ojo
        p_der   : índice del extremo derecho del ojo

    Returns:
        float: ratio altura/ancho del ojo.
               Cercano a 0 = ojo cerrado, ~0.3 = ojo abierto.
    """
    a = distancia(landmark_xy(lista, p_sup), landmark_xy(lista, p_inf))
    b = distancia(landmark_xy(lista, p_izq), landmark_xy(lista, p_der))
    return a / b if b > 0 else 0

def etiqueta(frame, texto, y, color=(255,255,255)):
    cv2.putText(frame, texto, (30, y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

# ── thresholds ───────────────────────────────────────────────────────────────

EAR_CERRADO        = 0.18   # ojo cerrado
EAR_ABIERTO        = 0.28   # umbral para "ojos levantados"
CEJA_LEVANTADA     = 0.065  # distancia ceja-ojo normalizada
BESO_ANCHO_MAX     = 0.07   # boca fruncida (ancho pequeño)
BESO_RATIO_MAX = 0.10
BOCA_ABIERTA_MIN   = 0.04   # apertura mínima para "boca abierta"
MUECA_ASIMETRIA    = 12     # px de desplazamiento del centro de la boca
OJO_CERRADO_TIEMPO = 0.75   # segundos

# Estado para ojos cerrados prolongados
ojo_cerrado_desde = None

# Impresion de señas
ultimo_print = time.time()
seña_en_segundo_actual = None
señas_del_segundo = []
ultima_seña_impresa = None  # <-- agregás esto

# Antes del loop principal, agregás una fase de calibración de 3 segundos:
print("Calibrando... mirá a la cámara con la cara relajada.")
muestras = []
inicio = time.time()

with vision.FaceLandmarker.create_from_options(options) as face_landmarker:
  while time.time() - inicio < 3.0:
    ret, frame = video.read()
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
    results = face_landmarker.detect(mp_image)

    if results.face_landmarks:
      rostro = results.face_landmarks[0]
      altura, anchura, _ = frame.shape
      lista = [[id, int(p.x*anchura), int(p.y*altura)] for id, p in enumerate(rostro)]

      altura_cara = distancia(landmark_xy(lista, 10), landmark_xy(lista, 152))

      if len(lista) == 478:
        izq = distancia(landmark_xy(lista, 65),  landmark_xy(lista, 159)) / altura_cara
        der = distancia(landmark_xy(lista, 295), landmark_xy(lista, 386)) / altura_cara
        muestras.append((izq + der) / 2)

        cv2.putText(frame, f"Calibrando: {3 - int(time.time() - inicio)}s", (30, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 2)
        cv2.imshow('Truco Señas', frame)
        cv2.waitKey(1)

    reposo = sum(muestras) / len(muestras)
    CEJA_LEVANTADA = reposo * 1.25  # 25% por encima del reposo
    print(f"Calibrado. Reposo: {reposo:.4f} → Umbral: {CEJA_LEVANTADA:.4f}")

    while True:
      # Guarda el frame del video. ret es un booleano
      ret, frame = video.read()
      if not ret:
          break

      image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)                     # cambio de formato del color a RGB para procesar correctamente
      mp_image  = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb) # configuracion de la imagen
      results   = face_landmarker.detect(mp_image)                           # deteccion de puntos en el rostro

      if results.face_landmarks:
          rostro = results.face_landmarks[0]
          altura, anchura, _ = frame.shape

          # Construir lista de puntos
          lista = []
          for id, p in enumerate(rostro):
              lista.append([id, int(p.x * anchura), int(p.y * altura)])

          #Espera a tener todos los puntos del rostro cargados
          if len(lista) < 478:
              continue

          # ── Mediciones ───────────────────────────────────────────────

          # EAR ojo izquierdo (puntos MediaPipe: sup=159, inf=145, ext=33, int=133)
          ear_izq = apertura(lista, 159, 145, 33, 133)
          # EAR ojo derecho  (puntos MediaPipe: sup=386, inf=374, ext=362, int=263)
          ear_der = apertura(lista, 386, 374, 362, 263)

          # Cejas — distancia normalizada ceja-ojo (por el alto de la cara)
          altura_cara = distancia(landmark_xy(lista, 10), landmark_xy(lista, 152))
          dist_ceja_izq = distancia(landmark_xy(lista, 65),  landmark_xy(lista, 159)) / altura_cara
          dist_ceja_der = distancia(landmark_xy(lista, 295), landmark_xy(lista, 386)) / altura_cara

          # Boca
          ancho_boca  = distancia(landmark_xy(lista, 78), landmark_xy(lista, 308))
          apertura_boca    = distancia(landmark_xy(lista, 13), landmark_xy(lista, 14))
          ratio_boca  = apertura_boca / ancho_boca if ancho_boca > 0 else 0
          dist_17_13 = distancia(landmark_xy(lista, 17), landmark_xy(lista, 13))
          ratio_morder = dist_17_13 / altura_cara   # normalizado por tamaño de cara

          # Centro geométrico de la boca vs centro de la cara
          cx_boca  = (lista[78][1] + lista[308][1]) // 2
          cx_cara  = lista[1][1]  # punto nariz (referencia central)
          mueca_dx = cx_boca - cx_cara   # positivo = desplazado a la derecha de la imagen

          # Ancho normalizado (para beso)
          ancho_norm = ancho_boca / anchura

          # ── Detección de señas ────────────────────────────────────────

          seña = None

          # Ojos cerrados 0.75 s
          ambos_cerrados = (ear_izq < EAR_CERRADO) and (ear_der < EAR_CERRADO)
          if ambos_cerrados:
              if ojo_cerrado_desde is None:
                  ojo_cerrado_desde = time.time()
              elif time.time() - ojo_cerrado_desde >= OJO_CERRADO_TIEMPO:
                  seña = ("Ojos cerrados - Cartas bajas", (98, 194, 234))
          else:
              ojo_cerrado_desde = None

          if seña is None:
              # Guiño izquierdo (ojo izq cerrado, der abierto)
              if ear_izq < EAR_CERRADO and ear_der > EAR_CERRADO + 0.05:
                  seña = ("GUINO IZQUIERDO - As de Basto", (197, 235, 97))
              # Guiño derecho (ojo der cerrado, izq abierto)
              elif ear_der < EAR_CERRADO and ear_izq > EAR_CERRADO + 0.05:
                  seña = ("GUINO DERECHO - As de Basto", (235, 65, 104))

              # Levantar cejas (ambas alejadas del ojo)
              elif dist_ceja_izq > CEJA_LEVANTADA and dist_ceja_der > CEJA_LEVANTADA:
                  seña = ("CEJAS LEVANTADAS - As de espada", (0, 255, 180))

              # Beso / fruncir labios (boca estrecha y casi cerrada)
              elif ancho_norm < BESO_ANCHO_MAX and ratio_boca < BESO_RATIO_MAX:
                  seña = ("BESO / FRUNCIR - 2 de cualquier palo", (255, 100, 200))

              # Boca abierta
              elif ratio_boca > BOCA_ABIERTA_MIN and ancho_norm > 0.09:
                  seña = ("BOCA ABIERTA - 1 de copa u oro", (100, 255, 100))

              # Mueca derecha (boca desplazada a la derecha de la imagen)
              elif mueca_dx > MUECA_ASIMETRIA:
                  seña = ("MUECA DERECHA - 7 de espada", (200, 150, 255))

              # Mueca izquierda
              elif mueca_dx < -MUECA_ASIMETRIA:
                  seña = ("MUECA IZQUIERDA - 7 de oro", (200, 150, 255))
              # Morder labio inferior:
              # - el labio sube → dist(17, 13) se achica
              elif ratio_morder < 0.07 and ratio_boca < 0.08:
                  seña = ("MORDER LABIO", (255, 80, 150))

          # ── Visualización ─────────────────────────────────────────────

          # Círculo en punta de nariz (referencia)
          cv2.circle(frame, (lista[1][1], lista[1][2]), 4, (0, 255, 0), -1)

          # Mostrar señal detectada
          if seña:
              texto, color = seña
              cv2.rectangle(frame, (20, 20), (520, 70), (0,0,0), -1)
              etiqueta(frame, texto, 58, color)

          ahora = time.time()
          if ahora - ultimo_print >= 1.0:
              if señas_del_segundo:
                  mas_frecuente = Counter(señas_del_segundo).most_common(1)[0][0]
                  if mas_frecuente != ultima_seña_impresa:
                      print(mas_frecuente)
                      ultima_seña_impresa = mas_frecuente
              else:
                ultima_seña_impresa = None  # reset: si no hubo seña, la próxima puede repetirse
              señas_del_segundo = []
              ultimo_print = ahora

          """
          # HUD con valores en tiempo real
          cv2.putText(frame, f"EAR izq:{ear_izq:.2f}  der:{ear_der:.2f}", (30, 110),
                      cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200,200,200), 1)
          cv2.putText(frame, f"Ceja izq:{dist_ceja_izq:.3f}  der:{dist_ceja_der:.3f}", (30, 135),
                      cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200,200,200), 1)
          cv2.putText(frame, f"Boca ancho:{ancho_norm:.3f}  apertura:{ratio_boca:.3f}  mueca:{mueca_dx:+.0f}px", (30, 160),
                      cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200,200,200), 1)
          """

      cv2.imshow('Truco Señas', frame)
      if cv2.waitKey(1) == ord('q'):
          break

video.release()
cv2.destroyAllWindows()
