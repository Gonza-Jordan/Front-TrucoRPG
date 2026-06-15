import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import math

# ----------------- REALIZA LA VIDEO CAPTURA ------------------#
video = cv2.VideoCapture(0)
video.set(3, 1280)
video.set(4, 720)

# ----------------- CONFIGURACIÓN NUEVA API ------------------#
base_options = python.BaseOptions(model_asset_path='face_landmarker.task')
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    num_faces=1,
    min_face_detection_confidence=0.5,
    min_face_presence_confidence=0.5,
    min_tracking_confidence=0.5
)

# ----------------- FUNCIÓN DE DIBUJO MANUAL ------------------#
def draw_face_landmarks(image, face_landmarks):
    h, w, _ = image.shape

    # Dibuja cada punto
    for lm in face_landmarks:
        x, y = int(lm.x * w), int(lm.y * h)
        cv2.circle(image, (x, y), 1, (0, 255, 0), -1)

    # Conexiones básicas del contorno facial (subset de las más visibles)
    CONTOUR_CONNECTIONS = [
        # Óvalo del rostro
        (10, 338), (338, 297), (297, 332), (332, 284), (284, 251), (251, 389),
        (389, 356), (356, 454), (454, 323), (323, 361), (361, 288), (288, 397),
        (397, 365), (365, 379), (379, 378), (378, 400), (400, 377), (377, 152),
        (152, 148), (148, 176), (176, 149), (149, 150), (150, 136), (136, 172),
        (172, 58),  (58, 132),  (132, 93),  (93, 234),  (234, 127), (127, 162),
        (162, 21),  (21, 54),   (54, 103),  (103, 67),  (67, 109),  (109, 10),
        # Ceja izquierda
        (46, 53), (53, 52), (52, 65), (65, 55), (55, 70), (70, 63), (63, 105), (105, 66), (66, 46),
        # Ceja derecha
        (276, 283), (283, 282), (282, 295), (295, 285), (285, 300), (300, 293), (293, 334), (334, 296), (296, 276),
        # Ojo izquierdo
        (33, 7), (7, 163), (163, 144), (144, 145), (145, 153), (153, 154),
        (154, 155), (155, 133), (133, 173), (173, 157), (157, 158), (158, 159),
        (159, 160), (160, 161), (161, 246), (246, 33),
        # Ojo derecho
        (362, 382), (382, 381), (381, 380), (380, 374), (374, 373), (373, 390),
        (390, 249), (249, 263), (263, 466), (466, 388), (388, 387), (387, 386),
        (386, 385), (385, 384), (384, 398), (398, 362),
        # Labios exteriores
        (61, 146), (146, 91), (91, 181), (181, 84), (84, 17), (17, 314),
        (314, 405), (405, 321), (321, 375), (375, 291), (291, 409), (409, 270),
        (270, 269), (269, 267), (267, 0), (0, 37), (37, 39), (39, 40),
        (40, 185), (185, 61),
        # Labios interiores
        (78, 95), (95, 88), (88, 178), (178, 87), (87, 14), (14, 317),
        (317, 402), (402, 318), (318, 324), (324, 308), (308, 415), (415, 310),
        (310, 311), (311, 312), (312, 13), (13, 82), (82, 81), (81, 80),
        (80, 191), (191, 78),
    ]

    for start, end in CONTOUR_CONNECTIONS:
        x1, y1 = int(face_landmarks[start].x * w), int(face_landmarks[start].y * h)
        x2, y2 = int(face_landmarks[end].x * w), int(face_landmarks[end].y * h)
        cv2.line(image, (x1, y1), (x2, y2), (0, 128, 255), 1)


# ----------------- LOOP PRINCIPAL ------------------#
with vision.FaceLandmarker.create_from_options(options) as face_landmarker:

    while True:
        ret, frame = video.read()
        if not ret:
            break

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

        results = face_landmarker.detect(mp_image)

        lista = []
        r = 5
        t = 3

        if results.face_landmarks:
            rostro = results.face_landmarks[0]

            draw_face_landmarks(frame, rostro)

            altura, ancho, _ = frame.shape

            for id, puntos in enumerate(rostro):
                x, y = int(puntos.x * ancho), int(puntos.y * altura)
                lista.append([id, x, y])

            if len(lista) == 478:  # v0.10 devuelve 478 puntos

                # Ceja Derecha
                x1, y1 = lista[65][1:]
                x2, y2 = lista[159][1:]
                longitud1 = math.hypot(x2 - x1, y2 - y1)

                # Ceja Izquierda
                x3, y3 = lista[295][1:]
                x4, y4 = lista[385][1:]
                longitud2 = math.hypot(x4 - x3, y4 - y3)

                # Boca Extremos
                x5, y5 = lista[78][1:]
                x6, y6 = lista[308][1:]
                longitud3 = math.hypot(x6 - x5, y6 - y5)

                # Boca apertura
                x7, y7 = lista[13][1:]
                x8, y8 = lista[14][1:]
                longitud4 = math.hypot(x8 - x7, y8 - y7)

                # Círculo en punto 1
                cv2.circle(frame, (lista[1][1], lista[1][2]), r, (0, 255, 0), t)

        cv2.imshow('Face Mesh', frame)
        if cv2.waitKey(1) == ord('q'):
            break

video.release()
cv2.destroyAllWindows()
