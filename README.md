# CaféVision — Clasificador de Café con IA

Sistema inteligente de clasificación de granos de café basado en visión por computadora con YOLOv8. Captura imágenes de lotes de café, analiza la calidad de los granos en tiempo real y genera recomendaciones de viabilidad para exportación.

---

## Stack Tecnológico

### 🧠 Inteligencia Artificial
- **Ultralytics YOLO** — Detección y clasificación de granos de café.
- **Computer Vision** — Análisis visual de calidad del café.
- **PyTorch** — Framework base del modelo de IA.

### ⚙️ Backend
- **FastAPI** — Construcción de la API REST.
- **Python** — Lenguaje principal del sistema.
- **SQLAlchemy** — Conexión y manejo de base de datos.
- **Uvicorn** — Servidor para ejecutar FastAPI.

### 🗄️ Base de Datos
- **PostgreSQL** — Almacenamiento de resultados y métricas.
- **Amazon RDS (Aurora)** — Hosting de la base de datos en la nube.

### ☁️ Infraestructura y Cloud
- **Amazon EC2** — Despliegue del backend, dashboard y modelo de IA.
- **Amazon RDS** — Base de datos PostgreSQL administrada.
- **Ubuntu** — Sistema operativo del servidor.

### 🎨 Frontend — Dashboard Web
- **React 18** — Construcción del dashboard interactivo.
- **Vite** — Entorno de desarrollo rápido.
- **Axios** — Consumo de la API.
- **TailwindCSS** — Estilos y diseño UI.
- **Google Fonts (Syne, DM Sans, JetBrains Mono)** — Tipografía.

### 📱 Mobile App
- **React Native (Expo SDK 54)** — App móvil multiplataforma.
- **expo-image-picker** — Captura de fotos desde cámara/galería.

### 🔄 Automatización
- **n8n** — Automatización de flujos y alertas inteligentes.
- **Telegram Bot** — Notificaciones de lotes con baja calidad.


### 📦 Control de Versiones
- **GitHub** — Gestión del repositorio y control de versiones.

---

## Arquitectura del Sistema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile App  │     │   Dashboard  │     │  Raspberry   │
│  (Expo/RN)   │     │  (React+Vite)│     │   (Fisico)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └──────────┬─────────┴─────────┬──────────┘
                  │                   │
         ┌────────▼────────┐  ┌──────▼──────┐
         │  FastAPI (EC2)  │  │  n8n (EC2)  │
         │  YOLOv8 Model   │  │ Automatizac.│
         └────────┬────────┘  └──────┬──────┘
                  │                  │
         ┌────────▼────────┐        │
         │  PostgreSQL     │◄───────┘
         │  Aurora AWS     │
         └─────────────────┘
```

---

## Estructura del Proyecto

```
clasificador-cafe/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── app.py          # Endpoints /predict, /
│   │   ├── routes/         # Rutas adicionales
│   │   ├── services/       # Lógica de negocio
│   │   └── uploads/        # Imágenes recibidas
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── dashboard/               # Web Dashboard (React + Vite)
│   ├── src/
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── mobile/                  # App Móvil (Expo)
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx   # Pantalla de escaneo
│   │   │   ├── explore.tsx # Información del proyecto
│   │   │   └── _layout.tsx
│   │   ├── _layout.tsx
│   │   └── modal.tsx
│   ├── components/
│   │   ├── coffee-bean.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── hello-wave.tsx
│   │   ├── external-link.tsx
│   │   ├── themed-text.tsx
│   │   ├── themed-view.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   └── ui/
│   │       ├── icon-symbol.tsx
│   │       ├── icon-symbol.ios.tsx
│   │       └── collapsible.tsx
│   ├── constants/theme.ts
│   ├── hooks/
│   ├── assets/images/
│   └── package.json
│
├── model/                   # Modelo de IA
│   ├── weights/
│   │   ├── best.pt         # Pesos YOLOv8 entrenados
│   │   └── best.onnx       # Exportación ONNX
│   ├── notebooks/
│   │   └── cafe_yolov8_detection.ipynb
│   └── exports/
│
├── n8n/                     # Automatización n8n
│   └── workflows/
│
├── raspberry/               # Integración física
│   ├── fastapi/             # API para Raspberry
│   └── servos/              # Control de servos
│
├── docs/                    # Documentación
└── frontend/                # Frontend alternativo
```

---

## Funcionalidades Implementadas

- ✅ Clasificación automática de granos de café con YOLOv8.
- ✅ Detección por niveles de calidad: **alta**, **media** y **baja**.
- ✅ Generación de métricas por lote (conteo, porcentajes, score).
- ✅ Historial de análisis realizados.
- ✅ Dashboard visual interactivo con resumen y filtros.
- ✅ App móvil con captura de cámara y galería.
- ✅ Almacenamiento de resultados en la nube (AWS RDS).
- ✅ API REST para integración con frontend y automatizaciones.
- ✅ Alertas automáticas a Telegram ante lotes de baja calidad (n8n).
- ✅ Integración con Raspberry Pi para control físico.

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/predict` | Clasificar imagen (multipart/form-data) |
| `GET` | `/history` | Historial de lotes analizados |
| `GET` | `/metrics` | Métricas globales |

### Ejemplo `POST /predict`

```json
{
  "filename": "lote_001.jpg",
  "total_detections": 120,
  "summary": {
    "alta": { "count": 85, "percentage": 70.83 },
    "media": { "count": 25, "percentage": 20.83 },
    "baja": { "count": 10, "percentage": 8.33 }
  },
  "detections": [
    { "class_id": 0, "class_name": "alta", "confidence": 0.95 },
    { "class_id": 1, "class_name": "baja", "confidence": 0.88 }
  ]
}
```

---

## Clasificación de Calidad

| Categoría | Score | Acción recomendada |
|-----------|-------|-------------------|
| **Exportable** | ≥ 80% | Venta a precio premium |
| **Aceptable** | 60–79% | Separar granos defectuosos manualmente |
| **Defectos moderados** | 40–59% | Revisar proceso de secado o despulpado |
| **No apto** | < 40% | Revisar proceso de beneficio |

---

## Despliegue

### Backend (AWS EC2)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.app:app --host 0.0.0.0 --port 8000
```

O con Docker:

```bash
docker-compose up -d
```

### Dashboard (AWS EC2)

```bash
cd dashboard
npm install
npm run build
npm run preview
```

### App Móvil

```bash
cd mobile
npm install
npx expo start
```

---

## Variables de Entorno / Configuración

| Componente | Variable | Valor |
|------------|----------|-------|
| API URL (Dashboard) | `API` en `App.jsx` | `http://35.172.87.68:8001` |
| API URL (Mobile) | `API_URL` en `index.tsx` | `http://35.172.87.68:8001/predict` |
| DB Host (n8n) | `DB_POSTGRESDB_HOST` | `postgres` |
| n8n UI | — | `http://localhost:5678` |

---

## Equipo de Desarrollo

| Nombre | Código |
|--------|--------|
| **Keiner Mateo Sandoval Barreto** | U00175111 |
| **Wilson Andres Suarez Mantilla** | U00173315 |
| **Juan David Contreras Bernal** | U00171346 |

---

**Universidad Autónoma de Bucaramanga — UNAB**  
Proyecto de Inteligencia Artificial — 2026
