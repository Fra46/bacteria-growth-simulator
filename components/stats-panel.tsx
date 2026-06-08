'use client'

// =====================================================================
// components/stats-panel.tsx
// Tarjetas con las métricas clave de la simulación en tiempo real.
// =====================================================================

import { formatNumber } from '@/lib/logistic'

interface StatsPanelProps {
  currentTime: number
  maxPopulation: number
  timeTo90: number | null
}

interface Stat {
  label: string
  value: string
  sub: string
}

export function StatsPanel({ currentTime, maxPopulation, timeTo90 }: StatsPanelProps) {
  const stats: Stat[] = [
    {
      label: 'Tiempo actual',
      value: currentTime.toFixed(1),
      sub: 'unidades de tiempo',
    },
    {
      label: 'Población máxima',
      value: formatNumber(maxPopulation),
      sub: 'bacterias alcanzadas',
    },
    {
      label: 'Tiempo al 90% de K',
      value: timeTo90 !== null ? timeTo90.toFixed(1) : '—',
      sub: 'fase de saturación',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </span>
          <span className="font-mono text-2xl font-semibold text-foreground tabular-nums">
            {stat.value}
          </span>
          <span className="text-xs text-muted-foreground">{stat.sub}</span>
        </div>
      ))}
    </div>
  )
}
