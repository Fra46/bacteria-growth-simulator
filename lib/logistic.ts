// =====================================================================
// lib/logistic.ts
// Núcleo matemático de la simulación de crecimiento logístico.
// Resuelve numéricamente la EDO logística mediante el Método de Euler.
//
//   Ecuación diferencial:   dN/dt = r·N·(1 − N/K)
//   Método de Euler:        N(t+Δt) = N(t) + r·N(t)·(1 − N(t)/K)·Δt
// =====================================================================

/** Parámetros de entrada de la simulación. */
export interface SimulationParams {
  N0: number // Población inicial de bacterias
  r: number // Tasa de crecimiento intrínseca
  K: number // Capacidad de carga del medio
  dt: number // Paso temporal (Δt)
  tMax: number // Tiempo total de simulación
}

/** Un punto de la trayectoria simulada. */
export interface SimulationPoint {
  step: number // Índice de iteración
  t: number // Tiempo
  N: number // Población en ese tiempo
}

/** Resultado completo de una simulación. */
export interface SimulationResult {
  points: SimulationPoint[]
  maxPopulation: number // Población máxima alcanzada
  timeTo90: number | null // Tiempo en alcanzar el 90% de K (null si no se alcanza)
  finalPopulation: number // Población al final de la simulación
}

/**
 * Ejecuta la integración numérica del modelo logístico con el Método de Euler.
 *
 * Para cada paso se calcula la derivada local dN/dt y se avanza una cantidad Δt,
 * acumulando los resultados en un arreglo de puntos.
 */
export function runSimulation(params: SimulationParams): SimulationResult {
  const { N0, r, K, dt, tMax } = params

  const points: SimulationPoint[] = []
  const numSteps = Math.floor(tMax / dt)

  let N = N0
  let maxPopulation = N0
  let timeTo90: number | null = null
  const threshold90 = 0.9 * K // 90% de la capacidad de carga

  // Iteración del método de Euler.
  for (let i = 0; i <= numSteps; i++) {
    const t = i * dt

    // Registramos el punto actual.
    points.push({ step: i, t, N })

    // Seguimiento de la población máxima alcanzada.
    if (N > maxPopulation) maxPopulation = N

    // Primer instante en el que se supera el 90% de K.
    if (timeTo90 === null && N >= threshold90) {
      timeTo90 = t
    }

    // Cálculo de la derivada y avance de Euler hacia el siguiente paso.
    const dNdt = r * N * (1 - N / K)
    N = N + dNdt * dt

    // Evitamos valores negativos por inestabilidad numérica.
    if (N < 0) N = 0
  }

  return {
    points,
    maxPopulation,
    timeTo90,
    finalPopulation: points[points.length - 1]?.N ?? N0,
  }
}

/** Valores por defecto representativos del crecimiento de S. aureus. */
export const DEFAULT_PARAMS: SimulationParams = {
  N0: 100,
  r: 0.8,
  K: 100000,
  dt: 0.5,
  tMax: 30,
}

/** Formatea números grandes con separadores y notación compacta. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}
