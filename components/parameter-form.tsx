'use client'

// =====================================================================
// components/parameter-form.tsx
// Formulario lateral para introducir los parámetros de la simulación.
// Incluye validación visual por campo.
// =====================================================================

import type { SimulationParams } from '@/lib/logistic'
import type { ValidationErrors } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Math } from '@/components/math'

interface FieldConfig {
  key: keyof SimulationParams
  label: string
  symbol: string
  step: number
  hint: string
}

// Configuración declarativa de cada campo del formulario.
const FIELDS: FieldConfig[] = [
  { key: 'N0', label: 'Población inicial', symbol: 'N_0', step: 1, hint: 'Bacterias al inicio (t = 0)' },
  { key: 'r', label: 'Tasa de crecimiento', symbol: 'r', step: 0.01, hint: 'Velocidad intrínseca de reproducción' },
  { key: 'K', label: 'Capacidad de carga', symbol: 'K', step: 100, hint: 'Población máxima sostenible del medio' },
  { key: 'dt', label: 'Paso temporal', symbol: '\\Delta t', step: 0.01, hint: 'Resolución del método de Euler' },
  { key: 'tMax', label: 'Tiempo total', symbol: 't_{max}', step: 1, hint: 'Duración total de la simulación' },
]

interface ParameterFormProps {
  params: SimulationParams
  errors: ValidationErrors
  isRunning: boolean
  onChange: (key: keyof SimulationParams, value: number) => void
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
  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Parámetros del modelo
        </h2>
        <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
          Ajusta los valores y ejecuta la simulación logística.
        </p>
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
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.key}
                className="flex items-center justify-between text-sm font-medium text-foreground"
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
                value={Number.isFinite(params[field.key]) ? params[field.key] : ''}
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
