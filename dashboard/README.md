# CaféVision Dashboard

Dashboard web profesional para el sistema de clasificación de granos de café con YOLOv8.

## Instalación

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Build para producción

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  App.jsx      # Componente principal con todo el dashboard
  index.css    # Estilos globales + Tailwind
  main.jsx     # Entry point
```

## API

El dashboard se conecta a: `http://35.172.87.68:8001/predict`

- **POST /predict** — Envía imagen, recibe clasificación del lote
- **GET /history** — Historial de análisis (si el backend lo expone)

## Features

- Drag & drop de imágenes
- Análisis en tiempo real con YOLOv8
- Quality Score (EXPORTABLE / MEDIO / BAJO)
- Historial de lotes con galería
- Dashboard con KPIs
- Dark mode elegante
