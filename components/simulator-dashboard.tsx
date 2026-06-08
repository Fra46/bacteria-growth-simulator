'use client'

// =====================================================================
// components/simulator-dashboard.tsx
// Componente cliente principal: gestiona el estado, la validación,
// la ejecución de la simulación y la animación suave del crecimiento.
// =====================================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  runSimulation,
  DEFAULT_PARAMS,
  type SimulationParams,
  type SimulationResult,
} from '@/lib/logistic'
import { validateParams, hasErrors, type ValidationErrors } from '@/lib/validation'
import { ParameterForm } from '@/components/parameter-form'
import { GrowthChart } from '@/components/growth-chart'
import { PetriDish } from '@/components/petri-dish'
import { SkinCrossSection } from '@/components/skin-cross-section'
import { ConclusionsPanel } from '@/components/conclusions-panel'
import { StatsPanel } from '@/components/stats-panel'
import { ResultsTable } from '@/components/results-table'
import { ModelExplanation } from '@/components/model-explanation'

export function SimulatorDashboard() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [result, setResult] = useState<SimulationResult | null>(null)
  // Número de puntos visibles: impulsa la animación progresiva de la curva.
  const [visibleCount, setVisibleCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const animationRef = useRef<number | null>(null)

  // Limpieza de la animación al desmontar.
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Actualiza un parámetro y revalida en caliente.
  const handleChange = useCallback((key: keyof SimulationParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Ejecuta la simulación y lanza la animación de crecimiento.
  const handleSimulate = useCallback(() => {
    const validation = validateParams(params)
    setErrors(validation)
    if (hasErrors(validation)) return

    if (animationRef.current) cancelAnimationFrame(animationRef.current)

    const res = runSimulation(params)
    setResult(res)
    setIsRunning(true)
    setVisibleCount(1)

    const total = res.points.length
    // Avanzamos un número de puntos por frame para que dure ~2.5 s sin importar el tamaño.
    const perFrame = Math.max(1, Math.ceil(total / 150))
    let current = 1

    const animate = () => {
      current = Math.min(total, current + perFrame)
      setVisibleCount(current)
      if (current < total) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsRunning(false)
      }
    }
    animationRef.current = requestAnimationFrame(animate)
  }, [params])

  // Restablece todos los valores y limpia los resultados.
  const handleReset = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    setParams(DEFAULT_PARAMS)
    setErrors({})
    setResult(null)
    setVisibleCount(0)
    setIsRunning(false)
  }, [])

  // Subconjunto visible de puntos durante la animación.
  const visiblePoints = result ? result.points.slice(0, visibleCount) : []
  const currentTime = visiblePoints.length ? visiblePoints[visiblePoints.length - 1].t : 0
  const currentPopulation = visiblePoints.length
    ? visiblePoints[visiblePoints.length - 1].N
    : 0
  // Máximo y tiempo al 90% recalculados sobre lo ya animado, para efecto progresivo.
  const visibleMax = visiblePoints.reduce((m, p) => Math.max(m, p.N), 0)
  const visible90 =
    result && currentTime >= (result.timeTo90 ?? Number.POSITIVE_INFINITY)
      ? result.timeTo90
      : null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      {/* Columna lateral: formulario */}
      <ParameterForm
        params={params}
        errors={errors}
        isRunning={isRunning}
        onChange={handleChange}
        onSimulate={handleSimulate}
        onReset={handleReset}
      />

      {/* Columna principal: métricas, gráfica y tabla */}
      <div className="flex flex-col gap-6">
        <StatsPanel
          currentTime={currentTime}
          maxPopulation={visibleMax}
          timeTo90={visible90}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_minmax(280px,420px)]">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Curva de crecimiento N(t)
              </h3>
              {result && (
                <span className="text-xs text-muted-foreground">
                  {visibleCount} / {result.points.length} pasos
                </span>
              )}
            </div>

            {result ? (
              <GrowthChart points={visiblePoints} K={params.K} />
            ) : (
              <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-center md:h-[420px]">
                <p className="text-sm font-medium text-foreground">
                  Sin datos todavía
                </p>
                <p className="max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground">
                  Configura los parámetros y pulsa{' '}
                  <strong className="text-foreground">Simular</strong> para visualizar el
                  crecimiento de la población.
                </p>
              </div>
            )}
          </div>

          {result ? (
            <PetriDish
              population={currentPopulation}
              K={params.K}
              time={currentTime}
            />
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-5 text-center">
              <p className="max-w-[220px] text-pretty text-xs leading-relaxed text-muted-foreground">
                Aquí verás la <strong className="text-foreground">placa de Petri</strong>{' '}
                colonizándose en tiempo real durante la simulación.
              </p>
            </div>
          )}
        </div>

        {result && (
          <SkinCrossSection population={currentPopulation} K={params.K} />
        )}

        {result && !isRunning && (
          <ConclusionsPanel params={params} result={result} />
        )}

        {result && <ResultsTable points={result.points} K={params.K} />}
      </div>

      {/* Explicación a todo el ancho */}
      <div className="lg:col-span-2">
        <ModelExplanation />
      </div>
    </div>
  )
}
