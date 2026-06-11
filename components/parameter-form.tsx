'use client'

// =====================================================================
// components/parameter-form.tsx
// Formulario lateral con parámetros, presets, métodos numéricos y validación.
// =====================================================================

import { useState } from 'react'
import type { SimulationParams } from '@/lib/logistic'
import type { ValidationErrors } from '@/lib/validation'
import { validateWarnings } from '@/lib/validation'
import { PRESETS } from '@/lib/presets'
import { PARAMETER_INFO } from '@/lib/scientific-info'
import { Button } from '@/components/ui/button'
import { Math } from '@/components/math'

interface FieldConfig {
  key: keyof SimulationParams
  label: string
  symbol: string
  step: number
  hint: string
}

const FIELDS: FieldConfig[] = [
  { key: 'N0', label: 'Población inicial', symbol: 'N_0', step: 1, hint: 'Bacterias al inicio (t = 0)' },
  { key: 'r', label: 'Tasa de crecimiento', symbol: 'r', step: 0.01, hint: 'Velocidad intrínseca de reproducción' },
  { key: 'K', label: 'Capacidad de carga', symbol: 'K', step: 100, hint: 'Población máxima sostenible del medio' },
  { key: 'dt', label: 'Paso temporal', symbol: '\\Delta t', step: 0.01, hint: 'Resolución temporal' },
  { key: 'tMax', label: 'Tiempo total', symbol: 't_{max}', step: 1, hint: 'Duración total de la simulación' },
]

interface ParameterFormProps {
  params: SimulationParams
  errors: ValidationErrors
  isRunning: boolean
  onChange: (key: keyof SimulationParams, value: number | string) => void
  onSimulate: () => void
  onReset: () => void
}

export function ParameterForm({
  params,
  errors,
  isRunning,
  onChange,
  onSimulate,
  onReset,
}: ParameterFormProps) {
  const [showPresets, setShowPresets] = useState(false)
  const [showWarnings, setShowWarnings] = useState(false)
  const warnings = validateWarnings(params)

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    Object.entries(preset.params).forEach(([key, value]) => {
      onChange(key as keyof SimulationParams, value)
    })
    setShowPresets(false)
  }

  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Parámetros del modelo
        </h2>
        <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
          Ajusta los valores o carga un preset predefinido.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="text-left text-xs font-medium text-primary hover:underline"
        >
          {showPresets ? '▼' : '▶'} Escenarios predefinidos
        </button>
        {showPresets && (
          <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
            {PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="rounded border border-border/50 bg-background/50 px-2 py-1.5 text-left text-xs hover:bg-background transition-colors"
                title={preset.description}
              >
                <span className="font-medium">{preset.icon}</span>
                <div className="text-[0.7rem] text-muted-foreground">{preset.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSimulate()
        }}
      >
        {FIELDS.map((field) => {
          const error = errors[field.key]
          const info = PARAMETER_INFO[field.key]

          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.key}
                className="flex items-center justify-between text-sm font-medium text-foreground group cursor-help"
                title={info?.description}
              >
                <span className="flex items-center gap-2">
                  <Math>{field.symbol}</Math>
                  <span className="text-muted-foreground">{field.label}</span>
                </span>
              </label>
              <input
                id={field.key}
                name={field.key}
                type="number"
                inputMode="decimal"
                step={field.step}
                value={Number.isFinite(params[field.key] as number) ? (params[field.key] as number) : ''}
                onChange={(e) => onChange(field.key, Number.parseFloat(e.target.value))}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${field.key}-error` : undefined}
                className={`rounded-md border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring ${
                  error ? 'border-destructive' : 'border-input'
                }`}
              />
              {error ? (
                <p id={`${field.key}-error`} className="text-xs text-destructive">
                  {error}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              )}
            </div>
          )
        })}

        {/* Método numérico */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="method"
            className="text-sm font-medium text-foreground"
            title="Euler es rápido; RK4 es más preciso"
          >
            Método numérico
          </label>
          <select
            id="method"
            value={params.method ?? 'euler'}
            onChange={(e) => onChange('method', e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="euler">Método de Euler (rápido)</option>
            <option value="rk4">Runge-Kutta 4 (preciso)</option>
          </select>
          <p className="text-xs text-muted-foreground">
            {params.method === 'rk4'
              ? 'RK4: Mayor precisión, ~2–3× más lento'
              : 'Euler: Rápido, útil para exploración'}
          </p>
        </div>

        {/* Advertencias */}
        {(warnings.warnings.length > 0 || warnings.recommendations.length > 0) && (
          <div className="rounded border border-orange-200 bg-orange-50/50 p-3">
            <button
              type="button"
              onClick={() => setShowWarnings(!showWarnings)}
              className="w-full text-left text-xs font-medium text-orange-900 hover:underline"
            >
              {showWarnings ? '▼' : '▶'} {warnings.warnings.length + warnings.recommendations.length} recomendaciones
            </button>
            {showWarnings && (
              <div className="mt-2 space-y-1 text-xs text-orange-800">
                {warnings.warnings.map((w) => (
                  <p key={w} className="font-medium">
                    ⚠️ {w}
                  </p>
                ))}
                {warnings.recommendations.map((r) => (
                  <p key={r} className="text-orange-700">
                    💡 {r}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-1 flex flex-col gap-2">
          <Button type="submit" disabled={isRunning} className="w-full">
            {isRunning ? 'Simulando…' : 'Simular'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isRunning}
            className="w-full"
          >
            Reiniciar
          </Button>
        </div>
      </form>
    </aside>
  )
}
