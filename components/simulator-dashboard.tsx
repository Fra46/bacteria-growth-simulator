'use client'

// =====================================================================
// components/simulator-dashboard.tsx
// Componente cliente principal: gestiona el estado, la validación,
// la ejecución de la simulación y la animación suave del crecimiento.
// =====================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Chart as ChartJS } from 'chart.js'
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
import { SaveLoadPanel } from '@/components/save-load-panel'
import { ScientificGuide } from '@/components/scientific-guide'
import { Button } from '@/components/ui/button'

export function SimulatorDashboard() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [result, setResult] = useState<SimulationResult | null>(null)
  // Número de puntos visibles: impulsa la animación progresiva de la curva.
  const [visibleCount, setVisibleCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [mobileSection, setMobileSection] = useState<'form' | 'sim' | 'analysis'>('form')

  const animationRef = useRef<number | null>(null)
  const chartRef = useRef<ChartJS<'line'> | null>(null)

  // Limpieza de la animación al desmontar.
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Actualiza un parámetro y revalida en caliente.
  const handleChange = useCallback(
    (key: keyof SimulationParams, value: number | string) => {
      setParams((prev) => ({
        ...prev,
        [key]: key === 'method' ? value : Number(value),
      }))
    },
    [],
  )

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

  // Carga los parámetros de una simulación guardada.
  const handleLoadSimulation = useCallback((loadedParams: SimulationParams) => {
    setParams(loadedParams)
    setErrors({})
    setResult(null)
    setVisibleCount(0)
    setIsRunning(false)
  }, [])

  const handleDownloadChart = useCallback(() => {
    const chart = chartRef.current
    const url = chart?.toBase64Image()
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.download = 'grafica-crecimiento.png'
    link.click()
  }, [])

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

  const progressPercent = result
    ? Math.round((visibleCount / result.points.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="lg:hidden rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Navegación rápida
            </p>
            <p className="text-sm text-foreground">Cambia entre formulario, simulación y análisis.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'form', label: 'Parámetros' },
            { key: 'sim', label: 'Simulación' },
            { key: 'analysis', label: 'Resultados' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileSection(tab.key as typeof mobileSection)}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                mobileSection === tab.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
        <div className="flex flex-col gap-6">
          <ParameterForm
            params={params}
            errors={errors}
            isRunning={isRunning}
            onChange={handleChange}
            onSimulate={handleSimulate}
            onReset={handleReset}
          />
          <SaveLoadPanel params={params} result={result} onLoad={handleLoadSimulation} />
        </div>

        <div className="flex flex-col gap-6">
          <StatsPanel currentTime={currentTime} result={result} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_minmax(280px,420px)]">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Curva de crecimiento N(t)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Progreso de la animación en tiempo real.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {result && (
                    <span className="rounded-full bg-secondary/80 px-3 py-1 text-[0.7rem] font-semibold text-secondary-foreground">
                      {visibleCount} / {result.points.length} pasos
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadChart}
                    disabled={!result}
                  >
                    Descargar gráfica
                  </Button>
                </div>
              </div>

              {result && (
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {result ? (
                <GrowthChart points={visiblePoints} K={params.K} chartRef={chartRef} />
              ) : (
                <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-center md:h-[420px]">
                  <p className="text-sm font-medium text-foreground">Sin datos todavía</p>
                  <p className="max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground">
                    Configura los parámetros y pulsa{' '}
                    <strong className="text-foreground">Simular</strong> para visualizar el crecimiento.
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
                  colonizándose en tiempo real.
                </p>
              </div>
            )}
          </div>

          {result && <SkinCrossSection population={currentPopulation} K={params.K} />}
          {result && !isRunning && <ConclusionsPanel params={params} result={result} />}
          {result && <ResultsTable points={result.points} K={params.K} />}
          <ScientificGuide />
          <ModelExplanation />
        </div>
      </div>

      <div className={mobileSection === 'form' ? 'block lg:hidden' : 'hidden lg:hidden'}>
        <ParameterForm
          params={params}
          errors={errors}
          isRunning={isRunning}
          onChange={handleChange}
          onSimulate={handleSimulate}
          onReset={handleReset}
        />
        <SaveLoadPanel params={params} result={result} onLoad={handleLoadSimulation} />
      </div>

      <div className={mobileSection === 'sim' ? 'block lg:hidden' : 'hidden lg:hidden'}>
        <StatsPanel currentTime={currentTime} result={result} />
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Curva de crecimiento N(t)</h3>
              <p className="text-xs text-muted-foreground">Progreso de la animación en tiempo real.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadChart}
              disabled={!result}
            >
              Descargar gráfica
            </Button>
          </div>
          {result && (
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted/50">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
          {result ? (
            <GrowthChart points={visiblePoints} K={params.K} chartRef={chartRef} />
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-center md:h-[340px]">
              <p className="text-sm font-medium text-foreground">Sin datos todavía</p>
              <p className="max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground">
                Configura los parámetros y pulsa <strong className="text-foreground">Simular</strong>.
              </p>
            </div>
          )}
        </div>
        {result ? (
          <PetriDish population={currentPopulation} K={params.K} time={currentTime} />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-5 text-center">
            <p className="max-w-[220px] text-pretty text-xs leading-relaxed text-muted-foreground">
              Aquí verás la <strong className="text-foreground">placa de Petri</strong> colonizándose.
            </p>
          </div>
        )}
      </div>

      <div className={mobileSection === 'analysis' ? 'block lg:hidden' : 'hidden lg:hidden'}>
        {result && <SkinCrossSection population={currentPopulation} K={params.K} />}
        {result && !isRunning && <ConclusionsPanel params={params} result={result} />}
        {result && <ResultsTable points={result.points} K={params.K} />}
        <ScientificGuide />
        <ModelExplanation />
      </div>
    </div>
  )
}
