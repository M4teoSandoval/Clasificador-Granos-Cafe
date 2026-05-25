from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import shutil
import os
from collections import Counter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Clasificador de Café API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelo
model = YOLO("../../model/weights/best.pt")
print("ESTE APP.PY SI SE ESTA EJECUTANDO")

# Carpeta uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Información de clases
CLASS_INFO = {
    0: {
        "name": "alta",
    },
    1: {
        "name": "baja",
    },
    2: {
        "name": "media",
    }
}

@app.get("/")
def root():
    return {
        "TEST": "NUEVO CODIGO"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Guardar imagen
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Inferencia
    results = model(file_path)

    detections = []
    class_counter = Counter()

    # Procesar detecciones
    for r in results:
        for box in r.boxes:

            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            # Filtrar baja confianza
            if confidence < 0.4:
                continue

            class_info = CLASS_INFO.get(class_id)

            detections.append({
                "class_id": class_id,
                "class_name": class_info["name"],
                "confidence": round(confidence, 2)
            })

            class_counter[class_info["name"]] += 1

    total = sum(class_counter.values())

    summary = {}

    if total > 0:
        for class_name, count in class_counter.items():
            summary[class_name] = {
                "count": count,
                "percentage": round((count / total) * 100, 2)
            }

    return {
        "filename": file.filename,
        "total_detections": total,
        "summary": summary,
        "detections": detections
    }