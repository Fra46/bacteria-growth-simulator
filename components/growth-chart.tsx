'use client'

// =====================================================================
// components/growth-chart.tsx
// Gráfica dinámica del crecimiento poblacional usando Chart.js.
// Dibuja la curva N(t) junto a la línea de capacidad de carga K.
// =====================================================================

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { SimulationPoint } from '@/lib/logistic'

// Registro de los módulos de Chart.js que utilizamos.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface GrowthChartProps {
  points: SimulationPoint[] // Puntos visibles (animación progresiva)
  K: number // Capacidad de carga (línea de referencia)
}

export function GrowthChart({ points, K }: GrowthChartProps) {
  // Construcción de los datos del gráfico de forma memoizada.
  const data = useMemo(() => {
    return {
      labels: points.map((p) => p.t.toFixed(1)),
      datasets: [
        {
          label: 'Población N(t)',
          data: points.map((p) => p.N),
          borderColor: 'oklch(0.52 0.11 200)',
          backgroundColor: 'oklch(0.52 0.11 200 / 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Capacidad de carga K',
          data: points.map(() => K),
          borderColor: 'oklch(0.65 0.15 50)',
          borderWidth: 1.5,
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
        },
      ],
    }
  }, [points, K])

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 as const }, // La animación la controla el avance de puntos.
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } },
        },
        tooltip: {
          callbacks: {
            title: (items: { label: string }[]) => `t = ${items[0]?.label}`,
            label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
              `${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString('es-ES')}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Tiempo (t)' },
          ticks: { maxTicksLimit: 12 },
          grid: { color: 'oklch(0.9 0.01 240 / 0.5)' },
        },
        y: {
          title: { display: true, text: 'Población (N)' },
          beginAtZero: true,
          grid: { color: 'oklch(0.9 0.01 240 / 0.5)' },
        },
      },
    }),
    [],
  )

  return (
    <div className="h-[360px] w-full md:h-[420px]">
      <Line data={data} options={options} aria-label="Gráfica de crecimiento poblacional" />
    </div>
  )
}
