'use client'

// =====================================================================
// components/stats-panel.tsx
// Tarjetas con métricas clave de la simulación en tiempo real.
// Incluye nuevas métricas: tiempo de duplicación, velocidad máxima, fase.
// =====================================================================

import { formatNumber } from '@/lib/logistic'
import type { SimulationResult } from '@/lib/logistic'

interface StatsPanelProps {
  currentTime: number
  result: SimulationResult | null
}

interface Stat {
  label: string
  value: string
  sub: string
  icon?: string
}

export function StatsPanel({ currentTime, result }: StatsPanelProps) {
  if (!result) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-card/50 p-4 shadow-sm"
          >
            <div className="h-3 w-12 bg-muted rounded mb-2" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  const phaseEmoji = {
    exponential: '📈',
    sigmoid: '📊',
    stationary: '⏸️',
  }

  const stats: Stat[] = [
    {
      label: 'Tiempo actual',
      value: currentTime.toFixed(1),
      sub: 'horas',
      icon: '⏱️',
    },
    {
      label: 'Población actual',
      value: formatNumber(result.points[result.points.length - 1]?.N ?? 0),
      sub: 'UFC',
      icon: '🦠',
    },
    {
      label: 'Población máxima',
      value: formatNumber(result.maxPopulation),
      sub: 'UFC alcanzadas',
      icon: '📈',
    },
    {
      label: 'Tiempo de duplicación',
      value: result.doublingTime !== null ? result.doublingTime.toFixed(2) : '—',
      sub: 'horas (fase exponencial)',
      icon: '⏰',
    },
    {
      label: 'Velocidad máxima',
      value: formatNumber(result.maxGrowthRate),
      sub: 'UFC/h en t = ' + result.maxGrowthTime.toFixed(1) + ' h',
      icon: '⚡',
    },
    {
      label: 'Punto de inflexión',
      value: result.inflectionPoint ? formatNumber(result.inflectionPoint.N) : '—',
      sub: 'N = K/2 en t = ' + (result.inflectionPoint?.t.toFixed(1) ?? '—') + ' h',
      icon: '🔄',
    },
    {
      label: 'Tiempo al 90% de K',
      value: result.timeTo90 !== null ? result.timeTo90.toFixed(1) : '—',
      sub: 'fase de saturación',
      icon: '⚠️',
    },
    {
      label: 'Régimen actual',
      value:
        result.phase === 'exponential'
          ? 'Exponencial'
          : result.phase === 'sigmoid'
            ? 'Sigmoidea'
            : 'Estacionaria',
      sub: 'fase de crecimiento',
      icon: phaseEmoji[result.phase],
    },
    {
      label: 'Método numérico',
      value: result.numericalMethod === 'rk4' ? 'RK4' : 'Euler',
      sub: 'precisión: ' + (result.numericalMethod === 'rk4' ? 'Alta' : 'Estándar'),
      icon: '🔬',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            {stat.icon && <span>{stat.icon}</span>}
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
