import type { SimulationParams } from './logistic'

/** Mapa de errores por campo del formulario. */
export type ValidationErrors = Partial<Record<keyof SimulationParams, string>>

/** Información adicional sobre advertencias (no errores fatales). */
export interface ValidationWarnings {
  warnings: string[]
  recommendations: string[]
}

/**
 * Valida los parámetros de la simulación.
 * Devuelve un objeto con los mensajes de error por campo (vacío si todo es válido).
 */
export function validateParams(params: SimulationParams): ValidationErrors {
  const errors: ValidationErrors = {}
  const { N0, r, K, dt, tMax } = params

  if (!Number.isFinite(N0) || N0 <= 0) {
    errors.N0 = 'La población inicial debe ser mayor que 0.'
  }
  if (!Number.isFinite(r) || r <= 0) {
    errors.r = 'La tasa de crecimiento debe ser mayor que 0.'
  }
  if (!Number.isFinite(K) || K <= 0) {
    errors.K = 'La capacidad de carga debe ser mayor que 0.'
  }
  if (Number.isFinite(N0) && Number.isFinite(K) && N0 > K) {
    errors.N0 = 'N₀ no puede superar la capacidad de carga K.'
  }
  if (!Number.isFinite(dt) || dt <= 0) {
    errors.dt = 'El paso temporal debe ser mayor que 0.'
  }
  if (!Number.isFinite(tMax) || tMax <= 0) {
    errors.tMax = 'El tiempo total debe ser mayor que 0.'
  }
  if (Number.isFinite(dt) && Number.isFinite(tMax) && dt > tMax) {
    errors.dt = 'El paso Δt no puede ser mayor que el tiempo total.'
  }

  // Estabilidad numérica del método de Euler: r·Δt debe ser < 2 (idealmente < 1)
  if (Number.isFinite(r) && Number.isFinite(dt)) {
    const stabilityFactor = r * dt
    if (stabilityFactor > 2) {
      errors.dt = `Inestabilidad: r·Δt = ${stabilityFactor.toFixed(2)} > 2. Reduce Δt o r para mayor estabilidad.`
    } else if (stabilityFactor > 1 && !params.method?.includes('rk')) {
      errors.dt = `Alerta: r·Δt = ${stabilityFactor.toFixed(2)} > 1. Considera usar RK4 o reducir Δt.`
    }
  }

  return errors
}

/**
 * Genera advertencias y recomendaciones sobre los parámetros.
 */
export function validateWarnings(params: SimulationParams): ValidationWarnings {
  const warnings: string[] = []
  const recommendations: string[] = []
  const { N0, r, K, dt, tMax } = params

  // Población inicial muy pequeña
  if (N0 < 1) {
    warnings.push('Población inicial muy pequeña: puede causar imprecisión numérica.')
    recommendations.push('Considera N0 ≥ 1.')
  }

  // Población inicial muy grande comparada con K
  if (N0 > K * 0.9) {
    warnings.push('Población inicial muy cerca de K: muy poco espacio para crecimiento.')
    recommendations.push('Reduce N0 o aumenta K para ver el comportamiento dinámico completo.')
  }

  // Tasa de crecimiento muy baja
  if (r < 0.05) {
    recommendations.push('Tasa r muy baja: crecimiento muy lento. Aumenta r para ver dinámicas interesantes.')
  }

  // Tasa de crecimiento muy alta
  if (r > 2) {
    warnings.push('Tasa r muy alta: puede causar comportamiento errático en Euler.')
    recommendations.push('Usa método RK4 o reduce el paso temporal dt para mayor precisión.')
  }

  // Paso temporal muy grande
  if (dt > tMax * 0.1) {
    warnings.push('Paso temporal muy grande: baja resolución temporal.')
    recommendations.push('Reduce dt para capturar la dinámica con mayor detalle.')
  }

  // Paso temporal muy pequeño (cálculo intenso)
  if (dt < 0.01) {
    warnings.push('Paso temporal muy pequeño: esto requiere muchos pasos de cálculo.')
    recommendations.push('Considera aumentar dt ligeramente a menos que necesites máxima precisión.')
  }

  // Tiempo total muy corto
  if (tMax < 5) {
    recommendations.push('Tiempo total muy corto: consideraría aumentar tMax para ver la dinámica completa.')
  }

  // Tiempo total muy largo
  if (tMax > 500) {
    recommendations.push(
      'Tiempo total muy largo: simulación puede ser lenta. Considera reducir tMax.',
    )
  }

  // Si N0 alcanzará K muy rápido
  const doubleTimeFactor = Math.log(2) / r
  if (doubleTimeFactor < dt) {
    recommendations.push('Tiempo de duplicación muy corto: aumenta dt para eficiencia.')
  }

  // Si el crecimiento es muy lento
  if (doubleTimeFactor > tMax * 10) {
    recommendations.push(
      'Crecimiento demasiado lento: la población apenas cambiará. Aumenta r o tMax.',
    )
  }

  return { warnings, recommendations }
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Calcula el tiempo teórico de duplicación en fase exponencial.
 */
export function estimateDoublingTime(r: number): number {
  return Math.log(2) / r
}

/**
 * Calcula el tiempo aproximado para alcanzar el 90% de K.
 */
export function estimateTime90Percent(N0: number, r: number, K: number): number {
  // Inversa de la solución logística: t = ln[(K/N0 - 1) / (K/(0.9K) - 1)] / r
  const ratio90 = K / (0.9 * K) - 1
  const ratioN0 = K / N0 - 1
  return Math.log(ratioN0 / ratio90) / r
}

