import type { SimulationParams } from './logistic'

/** Mapa de errores por campo del formulario. */
export type ValidationErrors = Partial<Record<keyof SimulationParams, string>>

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
  // Estabilidad numérica del método de Euler: r·Δt debe ser pequeño.
  if (Number.isFinite(r) && Number.isFinite(dt) && r * dt > 2) {
    errors.dt = 'r·Δt es demasiado grande; reduce Δt para mayor estabilidad.'
  }

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}
