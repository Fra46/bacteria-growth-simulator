'use client'

// =====================================================================
// components/conclusions-panel.tsx
// Panel de conclusiones dinámicas. Muestra el diagnóstico biomédico
// generado por lib/conclusions.ts, adaptando titular, color de severidad
// y desglose interpretativo a los parámetros y resultados actuales.
// =====================================================================

import type { SimulationParams, SimulationResult } from '@/lib/logistic'
import { buildConclusion, type Severity } from '@/lib/conclusions'

interface ConclusionsPanelProps {
  params: SimulationParams
  result: SimulationResult
}

// Estilos por nivel de severidad clínica.
const severityStyles: Record<
  Severity,
  { badge: string; bar: string; label: string }
> = {
  estable: {
    badge: 'bg-chart-2/15 text-foreground border-chart-2/40',
    bar: 'bg-chart-2',
    label: 'Estable',
  },
  moderado: {
    badge: 'bg-chart-3/15 text-foreground border-chart-3/40',
    bar: 'bg-chart-3',
    label: 'Moderado',
  },
  critico: {
    badge: 'bg-destructive/15 text-destructive border-destructive/40',
    bar: 'bg-destructive',
    label: 'Crítico',
  },
}

export function ConclusionsPanel({ params, result }: ConclusionsPanelProps) {
  const conclusion = buildConclusion(params, result)
  const styles = severityStyles[conclusion.severity]

  return (
    <section
      aria-label="Conclusiones dinámicas de la simulación"
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}
          >
            Severidad: {styles.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Conclusiones generadas a partir de los parámetros actuales
        </span>
      </div>

      <h3 className="text-balance text-lg font-semibold text-foreground">
        {conclusion.headline}
      </h3>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
        {conclusion.summary}
      </p>

      {/* Barra de severidad */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
          style={{
            width:
              conclusion.severity === 'critico'
                ? '100%'
                : conclusion.severity === 'moderado'
                  ? '60%'
                  : '28%',
          }}
        />
      </div>

      {/* Desglose interpretativo */}
      <dl className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {conclusion.items.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-border bg-background/50 p-4"
          >
            <dt className="text-sm font-semibold text-foreground">{item.title}</dt>
            <dd className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
              {item.body}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
