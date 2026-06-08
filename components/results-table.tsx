'use client'

// =====================================================================
// components/results-table.tsx
// Tabla de resultados con muestreo para mantener legibilidad.
// =====================================================================

import { formatNumber } from '@/lib/logistic'
import type { SimulationPoint } from '@/lib/logistic'

interface ResultsTableProps {
  points: SimulationPoint[]
  K: number
}

export function ResultsTable({ points, K }: ResultsTableProps) {
  // Muestreamos como máximo ~60 filas para no saturar la tabla.
  const stride = Math.max(1, Math.ceil(points.length / 60))
  const rows = points.filter((_, i) => i % stride === 0 || i === points.length - 1)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Tabla de resultados</h3>
      <div className="max-h-[420px] overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-secondary">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Paso</th>
              <th className="px-3 py-2 font-medium">Tiempo t</th>
              <th className="px-3 py-2 font-medium">Población N(t)</th>
              <th className="px-3 py-2 font-medium">% de K</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.step} className="border-t border-border odd:bg-background even:bg-secondary/40">
                <td className="px-3 py-1.5 font-mono tabular-nums text-muted-foreground">{p.step}</td>
                <td className="px-3 py-1.5 font-mono tabular-nums text-foreground">{p.t.toFixed(2)}</td>
                <td className="px-3 py-1.5 font-mono tabular-nums text-foreground">{formatNumber(p.N)}</td>
                <td className="px-3 py-1.5 font-mono tabular-nums text-muted-foreground">
                  {((p.N / K) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Mostrando {rows.length} de {points.length} puntos calculados.
      </p>
    </div>
  )
}
