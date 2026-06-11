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
  method?: NumericalMethod // Método numérico (por defecto: 'euler')
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
  doublingTime: number | null // Tiempo de duplicación en fase exponencial
  maxGrowthRate: number // Máxima velocidad de crecimiento (dN/dt)
  maxGrowthTime: number // Tiempo en el que ocurre máxima velocidad
  inflectionPoint: SimulationPoint | null // Punto N = K/2 donde velocidad es máxima
  phase: 'exponential' | 'sigmoid' | 'stationary' // Régimen de la simulación
  numericalMethod: 'euler' | 'rk4' // Método usado
}

export type NumericalMethod = 'euler' | 'rk4'

/**
 * Ejecuta la integración numérica del modelo logístico.
 * Soporta Método de Euler (rápido) y Runge-Kutta 4 (preciso).
 */
export function runSimulation(params: SimulationParams): SimulationResult {
  const { N0, r, K, dt, tMax } = params
  const method = params.method ?? 'euler'

  const result =
    method === 'rk4'
      ? runSimulationRK4(N0, r, K, dt, tMax)
      : runSimulationEuler(N0, r, K, dt, tMax)

  return {
    ...result,
    numericalMethod: method,
  }
}

/**
 * Método de Euler: N(t+Δt) = N(t) + r·N(t)·(1 − N(t)/K)·Δt
 */
function runSimulationEuler(
  N0: number,
  r: number,
  K: number,
  dt: number,
  tMax: number,
): Omit<SimulationResult, 'numericalMethod'> {
  const points: SimulationPoint[] = []
  const numSteps = Math.floor(tMax / dt)

  let N = N0
  let maxPopulation = N0
  let timeTo90: number | null = null
  let maxGrowthRate = 0
  let maxGrowthTime = 0
  let inflectionPoint: SimulationPoint | null = null
  const threshold90 = 0.9 * K
  let doublingTime: number | null = null
  let foundDoubling = false

  for (let i = 0; i <= numSteps; i++) {
    const t = i * dt
    points.push({ step: i, t, N })

    if (N > maxPopulation) maxPopulation = N
    if (timeTo90 === null && N >= threshold90) timeTo90 = t

    const dNdt = r * N * (1 - N / K)

    // Detectar maxima velocidad de crecimiento
    if (dNdt > maxGrowthRate) {
      maxGrowthRate = dNdt
      maxGrowthTime = t
    }

    // Detectar punto de inflexion (N cruza K/2)
    if (inflectionPoint === null && N >= K / 2) {
      inflectionPoint = { step: i, t, N }
    }

    // Tiempo de duplicacion: primer momento donde N ≥ 2·N0
    if (!foundDoubling && N >= 2 * N0) {
      doublingTime = t
      foundDoubling = true
    }

    N = N + dNdt * dt
    if (N < 0) N = 0
  }

  const finalOccupancy = N / K
  const phase: 'exponential' | 'sigmoid' | 'stationary' = detectPhase(
    finalOccupancy,
    doublingTime,
    tMax,
  )

  return {
    points,
    maxPopulation,
    timeTo90,
    finalPopulation: points[points.length - 1]?.N ?? N0,
    doublingTime,
    maxGrowthRate,
    maxGrowthTime,
    inflectionPoint,
    phase,
  }
}

/**
 * Runge-Kutta de orden 4: más preciso pero más lento.
 */
function runSimulationRK4(
  N0: number,
  r: number,
  K: number,
  dt: number,
  tMax: number,
): Omit<SimulationResult, 'numericalMethod'> {
  const points: SimulationPoint[] = []
  const numSteps = Math.floor(tMax / dt)

  let N = N0
  let maxPopulation = N0
  let timeTo90: number | null = null
  let maxGrowthRate = 0
  let maxGrowthTime = 0
  let inflectionPoint: SimulationPoint | null = null
  const threshold90 = 0.9 * K
  let doublingTime: number | null = null
  let foundDoubling = false

  const dNdt = (population: number) => r * population * (1 - population / K)

  for (let i = 0; i <= numSteps; i++) {
    const t = i * dt
    points.push({ step: i, t, N })

    if (N > maxPopulation) maxPopulation = N
    if (timeTo90 === null && N >= threshold90) timeTo90 = t

    const k1 = dNdt(N)
    const k2 = dNdt(N + (dt * k1) / 2)
    const k3 = dNdt(N + (dt * k2) / 2)
    const k4 = dNdt(N + dt * k3)

    const derivativeAtMid = (k1 + 2 * k2 + 2 * k3 + k4) / 6

    if (derivativeAtMid > maxGrowthRate) {
      maxGrowthRate = derivativeAtMid
      maxGrowthTime = t
    }

    if (inflectionPoint === null && N >= K / 2) {
      inflectionPoint = { step: i, t, N }
    }

    if (!foundDoubling && N >= 2 * N0) {
      doublingTime = t
      foundDoubling = true
    }

    N = N + (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6
    if (N < 0) N = 0
  }

  const finalOccupancy = N / K
  const phase: 'exponential' | 'sigmoid' | 'stationary' = detectPhase(
    finalOccupancy,
    doublingTime,
    tMax,
  )

  return {
    points,
    maxPopulation,
    timeTo90,
    finalPopulation: points[points.length - 1]?.N ?? N0,
    doublingTime,
    maxGrowthRate,
    maxGrowthTime,
    inflectionPoint,
    phase,
  }
}

/**
 * Detecta el régimen de crecimiento basado en ocupación final y tiempo de duplicación.
 */
function detectPhase(
  occupancy: number,
  doublingTime: number | null,
  tMax: number,
): 'exponential' | 'sigmoid' | 'stationary' {
  if (occupancy < 0.3 && doublingTime !== null && doublingTime < tMax * 0.2) {
    return 'exponential'
  }
  if (occupancy >= 0.3 && occupancy < 0.8) {
    return 'sigmoid'
  }
  return 'stationary'
}

/** Valores por defecto representativos del crecimiento de S. aureus. */
export const DEFAULT_PARAMS: SimulationParams = {
  N0: 100,
  r: 0.8,
  K: 100000,
  dt: 0.5,
  tMax: 30,
  method: 'euler',
}

/** Formatea números grandes con separadores y notación compacta. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}
