// =====================================================================
// lib/presets.ts
// Escenarios predefinidos para simulaciones de S. aureus.
// Cada preset representa un contexto clínico o ambiental distinto.
// =====================================================================

import type { SimulationParams } from '@/lib/logistic'

export interface SimulationPreset {
  id: string
  name: string
  description: string
  category: 'clinical' | 'laboratory' | 'environmental'
  icon: string
  params: SimulationParams
  notes: string // Explicación científica
}

export const PRESETS: SimulationPreset[] = [
  {
    id: 'default',
    name: 'Crecimiento típico de S. aureus',
    description: 'Parámetros estándar en condiciones óptimas de laboratorio',
    category: 'laboratory',
    icon: '🧪',
    params: {
      N0: 100,
      r: 0.8,
      K: 100000,
      dt: 0.5,
      tMax: 30,
      method: 'euler',
    },
    notes:
      'S. aureus con tasa de crecimiento moderada en caldo nutritivo con buena aireación. Tiempo de duplicación teórico ~1 hora.',
  },

  {
    id: 'slow-growth',
    name: 'Crecimiento lento (baja agresividad)',
    description: 'Cepa poco virulenta o entorno hostil',
    category: 'clinical',
    icon: '🐌',
    params: {
      N0: 50,
      r: 0.2,
      K: 50000,
      dt: 0.5,
      tMax: 50,
      method: 'euler',
    },
    notes:
      'Representa una infección controlada por el sistema inmune, o una cepa de baja virulencia. La población permanece en equilibrio. Tiempo de duplicación ~3.5 horas.',
  },

  {
    id: 'rapid-growth',
    name: 'Crecimiento rápido (alta virulencia)',
    description: 'Cepa altamente virulenta o condiciones óptimas',
    category: 'clinical',
    icon: '⚡',
    params: {
      N0: 100,
      r: 1.5,
      K: 250000,
      dt: 0.25,
      tMax: 20,
      method: 'rk4',
    },
    notes:
      'Simulación de una cepa de alta virulencia (ej. MRSA) con buena disponibilidad de nutrientes. Formación rápida de absceso. Tiempo de duplicación ~30 minutos.',
  },

  {
    id: 'skin-infection',
    name: 'Infección de piel (folliculitis)',
    description: 'Simulación de una infección superficial en epidermis',
    category: 'clinical',
    icon: '🔴',
    params: {
      N0: 500,
      r: 0.6,
      K: 30000,
      dt: 0.5,
      tMax: 40,
      method: 'euler',
    },
    notes:
      'Infección folicular superficial. Capacidad de carga limitada por volumen del folículo piloso (~30k UFC). Saturación en 20-25 horas.',
  },

  {
    id: 'surgical-wound',
    name: 'Herida quirúrgica (post-operatoria)',
    description: 'Contaminación en sitio quirúrgico con buena perfusión',
    category: 'clinical',
    icon: '🩹',
    params: {
      N0: 10,
      r: 0.5,
      K: 500000,
      dt: 0.5,
      tMax: 60,
      method: 'euler',
    },
    notes:
      'Inoculación pequeña en tejido con gran volumen disponible. Crecimiento lento pero sostenido si no hay intervención. Alcanza criticidad (~90% K) en 40-50 horas.',
  },

  {
    id: 'biofilm',
    name: 'Formación de biopelícula',
    description: 'Crecimiento protegido en matriz extracelular',
    category: 'laboratory',
    icon: '🧬',
    params: {
      N0: 1000,
      r: 0.3,
      K: 1000000,
      dt: 1.0,
      tMax: 120,
      method: 'euler',
    },
    notes:
      'Crecimiento lento pero con capacidad de carga muy alta por formación de matriz. Menos susceptible a antibióticos. Puede alcanzar saturación en 80-100 horas.',
  },

  {
    id: 'clinical-threshold',
    name: 'Carga bacteriana clínica (análisis)',
    description: 'Dinámicas que alcanzan el umbral clínico de síntomas',
    category: 'clinical',
    icon: '⚠️',
    params: {
      N0: 100,
      r: 0.75,
      K: 100000,
      dt: 0.4,
      tMax: 35,
      method: 'euler',
    },
    notes:
      'Parámetros ajustados para ver el cruce del 90% de K (umbral de síntomas clínicos) alrededor de 15-18 horas. Útil para análisis de ventana de intervención.',
  },

  {
    id: 'immune-response',
    name: 'Respuesta inmune (freno bacteriano)',
    description: 'Capacidad de carga limitada por respuesta del hospedero',
    category: 'clinical',
    icon: '🛡️',
    params: {
      N0: 1000,
      r: 0.4,
      K: 10000,
      dt: 0.5,
      tMax: 50,
      method: 'euler',
    },
    notes:
      'La capacidad de carga se reduce por acción inmune (citoquinas, neutrófilos). La población crece lentamente pero es controlada. Saturación limitada a ~10k UFC.',
  },

  {
    id: 'precision-rk4',
    name: 'Análisis de precisión (Runge-Kutta)',
    description: 'Comparación de métodos numéricos con paso fino',
    category: 'laboratory',
    icon: '🔬',
    params: {
      N0: 100,
      r: 0.8,
      K: 100000,
      dt: 0.1,
      tMax: 30,
      method: 'rk4',
    },
    notes:
      'Método RK4 con paso temporal muy fino (dt=0.1) para máxima precisión. Compara vs. Euler para validación numérica. Computacionalmente más costoso.',
  },
]

export function getPresetById(id: string): SimulationPreset | undefined {
  return PRESETS.find((p) => p.id === id)
}

export function getPresetsByCategory(
  category: 'clinical' | 'laboratory' | 'environmental',
): SimulationPreset[] {
  return PRESETS.filter((p) => p.category === category)
}
