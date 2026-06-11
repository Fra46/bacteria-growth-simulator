// =====================================================================
// lib/storage.ts
// Gestión de almacenamiento de simulaciones en localStorage.
// Permite guardar, cargar y listar simulaciones guardadas.
// =====================================================================

import type { SimulationParams, SimulationResult } from '@/lib/logistic'

export interface SavedSimulation {
  id: string
  name: string
  timestamp: number
  params: SimulationParams
  result: SimulationResult
  notes: string
}

const STORAGE_KEY = 'bacteria-simulator-saves'

/**
 * Obtiene todas las simulaciones guardadas.
 */
export function loadAllSavedSimulations(): SavedSimulation[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    console.error('Error al cargar simulaciones guardadas')
    return []
  }
}

/**
 * Obtiene una simulación guardada por ID.
 */
export function loadSavedSimulation(id: string): SavedSimulation | null {
  const simulations = loadAllSavedSimulations()
  return simulations.find((s) => s.id === id) || null
}

/**
 * Guarda una nueva simulación o reemplaza una existente.
 */
export function saveSimulation(
  name: string,
  params: SimulationParams,
  result: SimulationResult,
  notes: string = '',
  id?: string,
): string {
  const simulations = loadAllSavedSimulations()
  const simulationId = id || `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const newSimulation: SavedSimulation = {
    id: simulationId,
    name,
    timestamp: Date.now(),
    params,
    result,
    notes,
  }

  // Reemplazar si existe, sino agregar
  const existingIndex = simulations.findIndex((s) => s.id === simulationId)
  if (existingIndex !== -1) {
    simulations[existingIndex] = newSimulation
  } else {
    simulations.push(newSimulation)
  }

  // Limitar a máximo 50 simulaciones guardadas
  if (simulations.length > 50) {
    simulations.sort((a, b) => b.timestamp - a.timestamp)
    simulations.splice(50)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations))
  return simulationId
}

/**
 * Elimina una simulación guardada.
 */
export function deleteSimulation(id: string): boolean {
  const simulations = loadAllSavedSimulations()
  const filteredSimulations = simulations.filter((s) => s.id !== id)
  
  if (filteredSimulations.length === simulations.length) return false // No encontrado
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSimulations))
  return true
}

/**
 * Elimina todas las simulaciones guardadas.
 */
export function clearAllSimulations(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Exporta simulaciones como JSON para descargar.
 */
export function exportSimulationsAsJSON(): string {
  const simulations = loadAllSavedSimulations()
  return JSON.stringify(simulations, null, 2)
}

/**
 * Exporta una simulación como CSV (solo parámetros y puntos principales).
 */
export function exportSimulationAsCSV(id: string): string | null {
  const simulation = loadSavedSimulation(id)
  if (!simulation) return null

  const { params, result } = simulation
  let csv = 'Parámetro,Valor\n'
  csv += `N0,${params.N0}\n`
  csv += `r,${params.r}\n`
  csv += `K,${params.K}\n`
  csv += `dt,${params.dt}\n`
  csv += `tMax,${params.tMax}\n`
  csv += `Método,${result.numericalMethod}\n`
  csv += `\nTiempo,Población\n`

  result.points.forEach((point) => {
    csv += `${point.t.toFixed(2)},${Math.round(point.N)}\n`
  })

  return csv
}

/**
 * Devuelve estadísticas sobre el almacenamiento.
 */
export function getStorageStats(): {
  totalSaved: number
  oldestTimestamp: number | null
  newestTimestamp: number | null
  approxSizeKB: number
} {
  const simulations = loadAllSavedSimulations()
  const data = localStorage.getItem(STORAGE_KEY)

  return {
    totalSaved: simulations.length,
    oldestTimestamp: simulations.length > 0 ? Math.min(...simulations.map((s) => s.timestamp)) : null,
    newestTimestamp: simulations.length > 0 ? Math.max(...simulations.map((s) => s.timestamp)) : null,
    approxSizeKB: data ? (data.length / 1024).toFixed(2) as unknown as number : 0,
  }
}
