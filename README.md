# Simulador de crecimiento bacteriano

![Status](https://img.shields.io/badge/status-development-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2.0-38B2AC.svg)

Una aplicación web educativa en **Next.js** que simula el crecimiento poblacional de *Staphylococcus aureus* usando el modelo logístico y el método de Euler.

## Tabla de contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Deploy / Producción](#deploy--producción)
- [Contribuir](#contribuir)
- [Temas recomendados](#temas-recomendados)

## Descripción

Esta app permite configurar parámetros científicos como población inicial, tasa de crecimiento, capacidad de carga, paso temporal y tiempo total. Ofrece resultados numéricos y visuales con un dashboard interactivo y gráficos de evolución.

Ideal para demostraciones de modelos matemáticos, experimentos educativos y visualización de dinámicas de población.

## Características

- Simulación del modelo logístico de crecimiento bacteriano
- Control de parámetros en tiempo real
- Visualización de la curva `N(t)` y estados del sistema
- Componentes reutilizables basados en el diseño de `shadcn`
- Integración de gráficos con `Chart.js`
- Renderizado de fórmulas matemáticas con `KaTeX`

## Tecnologías

- Next.js 16.2.6
- React 19
- TypeScript 5.7.3
- Tailwind CSS 4.2.0
- Chart.js 4.5.1
- react-chartjs-2 5.3.1
- KaTeX 0.17.0
- Shadcn UI 4.8.0

## Instalación

1. Clona el repositorio:

```bash
git clone <REPO_URL>
cd bacteria-growth-simulator
```

2. Instala dependencias:

```bash
npm install
```

> Nota: el proyecto incluye `pnpm-lock.yaml`, pero en este entorno no se usó `pnpm`. `npm install` funciona correctamente.

## Ejecución

Arranca el servidor de desarrollo:

```bash
npm run dev
```

Abre en el navegador:

```text
http://localhost:3000
```

### Si hay conflicto en el puerto 3000

Si `localhost:3000` está ocupado o muestra otra aplicación, abre:

```text
http://127.0.0.1:3000
```

O inicia en un puerto alternativo:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

## Estructura del proyecto

```text
.
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── conclusions-panel.tsx
│   ├── growth-chart.tsx
│   ├── math.tsx
│   ├── model-explanation.tsx
│   ├── parameter-form.tsx
│   ├── petri-dish.tsx
│   ├── results-table.tsx
│   ├── simulator-dashboard.tsx
│   ├── skin-cross-section.tsx
│   ├── stats-panel.tsx
│   └── ui/
│       └── button.tsx
├── lib/
│   ├── conclusions.ts
│   ├── logistic.ts
│   ├── utils.ts
│   └── validation.ts
├── public/
├── package.json
├── pnpm-lock.yaml
├── next.config.mjs
├── postcss.config.mjs
└── tsconfig.json
```

## Deploy / Producción

Para compilar y servir la aplicación en modo producción:

```bash
npm run build
npm run start
```

## Contribuir

1. Crea una rama nueva:

```bash
git checkout -b feature/mi-cambio
```

2. Realiza tus cambios.
3. Instala nuevas dependencias si las necesitas.
4. Prueba localmente con:

```bash
npm run dev
```

5. Envía un pull request con una descripción clara del propósito.
