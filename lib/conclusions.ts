// =====================================================================
// lib/conclusions.ts
// Motor de conclusiones dinámicas. Interpreta los parámetros del modelo
// logístico y el resultado de la simulación para generar un diagnóstico
// biomédico contextualizado del crecimiento de Staphylococcus aureus.
// =====================================================================

import type { SimulationParams, SimulationResult } from '@/lib/logistic'
import { formatNumber } from '@/lib/logistic'

export type Severity = 'estable' | 'moderado' | 'critico'

export interface ConclusionItem {
  title: string
  body: string
}

export interface Conclusion {
  severity: Severity
  headline: string
  summary: string
  items: ConclusionItem[]
}

/**
 * Fase clínica estimada a partir de la fracción de ocupación N/K.
 * Se alinea con las cuatro etapas: equilibrio, detonante, invasión y absceso.
 */
export function phaseFromOccupancy(occupancy: number): {
  key: 'normal' | 'detonante' | 'invasion' | 'absceso'
  label: string
} {
  if (occupancy < 0.15) return { key: 'normal', label: 'Estado Normal (comensal)' }
  if (occupancy < 0.45) return { key: 'detonante', label: 'El Detonante (ruptura de barrera)' }
  if (occupancy < 0.85) return { key: 'invasion', label: 'Invasión (proliferación activa)' }
  return { key: 'absceso', label: 'Absceso (masa infecciosa)' }
}

/** Tiempo formateado en horas. */
function fmtHours(t: number | null): string {
  if (t === null || !Number.isFinite(t)) return 'no se alcanza dentro del horizonte simulado'
  return `${t.toFixed(1)} h`
}

/**
 * Genera la conclusión completa analizando r, K, N0 y los resultados de Euler.
 */
export function buildConclusion(
  params: SimulationParams,
  result: SimulationResult,
): Conclusion {
  const { N0, r, K, tMax } = params
  const { timeTo90, finalPopulation } = result

  const finalOccupancy = finalPopulation / K
  const phase = phaseFromOccupancy(finalOccupancy)
  const occupancyPct = Math.min(100, finalOccupancy * 100)

  // ---- Severidad clínica -------------------------------------------------
  // Combina cuán rápido (r y timeTo90) y cuán lejos (ocupación final) llega.
  let severity: Severity = 'estable'
  if (finalOccupancy >= 0.85 || (timeTo90 !== null && timeTo90 <= tMax * 0.5)) {
    severity = 'critico'
  } else if (finalOccupancy >= 0.45 || timeTo90 !== null) {
    severity = 'moderado'
  }

  // ---- Interpretación de la tasa de crecimiento r ------------------------
  let rText: string
  if (r < 0.3) {
    rText =
      'La tasa intrínseca r es baja, compatible con una cepa poco agresiva o condiciones poco favorables (buena higiene, baja humedad). La replicación es lenta y la respuesta inmune tiene margen para contener el foco.'
  } else if (r < 0.7) {
    rText =
      'La tasa intrínseca r es moderada: existe proliferación sostenida, típica de un microclima alterado (acumulación de sudor) pero sin agresividad extrema. La ventana de intervención preventiva aún es amplia.'
  } else {
    rText =
      'La tasa intrínseca r es alta, propia de una cepa virulenta o de un entorno de alta salinidad y humedad tras microtraumatismo. El crecimiento se acelera bruscamente y la fase exponencial es muy corta.'
  }

  // ---- Interpretación de la capacidad de carga K -------------------------
  const kText =
    `La capacidad de carga K = ${formatNumber(K)} UFC representa el límite físico del folículo/tejido antes de la ruptura del absceso. ` +
    (finalOccupancy >= 0.85
      ? 'La población satura este límite, por lo que el modelo predice formación de masa purulenta (pus) y presión sobre el tejido circundante.'
      : finalOccupancy >= 0.45
        ? 'La población se aproxima a este límite; el sustrato empieza a agotarse y la curva entra en su fase de desaceleración (punto de inflexión superado).'
        : 'La población permanece muy por debajo de este límite, manteniéndose en una fase de equilibrio cercana al estado comensal.')

  // ---- Punto de inflexión (K/2) ------------------------------------------
  // En el modelo logístico la velocidad máxima ocurre en N = K/2.
  const inflectionPoint = result.points.find((p) => p.N >= K / 2)
  const inflectionText = inflectionPoint
    ? `La velocidad de infección es máxima alrededor de t = ${inflectionPoint.t.toFixed(1)} h, cuando la población cruza N = K/2 (${formatNumber(K / 2)} UFC). Antes de ese instante la prevención es más efectiva; después, el sistema tiende inevitablemente hacia la saturación.`
    : `La población no alcanza el punto de inflexión (K/2 = ${formatNumber(K / 2)} UFC) dentro de las ${tMax} h simuladas, por lo que el foco se mantiene controlado en el periodo analizado.`

  // ---- Tiempo crítico (90% de K) -----------------------------------------
  const criticalText =
    timeTo90 !== null
      ? `El umbral crítico del 90% de K se alcanza a las ${fmtHours(timeTo90)}. Este es el tiempo estimado de formación clínica del absceso ("nacido"): a partir de aquí se esperaría enrojecimiento, exudado purulento y respuesta inflamatoria marcada.`
      : `Dentro de las ${tMax} h simuladas la carga bacteriana no alcanza el umbral crítico del 90% de K, lo que sugiere que, con estos parámetros, no se formaría un absceso clínico en ese plazo.`

  // ---- Recomendación según severidad -------------------------------------
  const recommendation =
    severity === 'critico'
      ? 'Escenario de alto riesgo: la intervención debería ser inmediata (limpieza, antisépticos y valoración clínica) idealmente antes del punto de inflexión, ya que tras él la progresión hacia el absceso es muy rápida.'
      : severity === 'moderado'
        ? 'Escenario de riesgo intermedio: conviene reforzar la higiene y vigilar la zona; existe margen para frenar la proliferación antes de que la curva supere el punto de inflexión.'
        : 'Escenario controlado: la microbiota permanece cerca del equilibrio simbiótico. Mantener las condiciones de higiene actuales debería bastar para evitar la disbiosis.'

  // ---- Titular y resumen -------------------------------------------------
  const headline =
    severity === 'critico'
      ? `Predicción crítica: absceso clínico hacia las ${fmtHours(timeTo90)}`
      : severity === 'moderado'
        ? 'Predicción moderada: proliferación significativa en curso'
        : 'Predicción estable: equilibrio comensal mantenido'

  const summary =
    `Con N₀ = ${formatNumber(N0)} UFC, r = ${r} y K = ${formatNumber(K)} UFC, el modelo logístico proyecta que la población alcanza ` +
    `${formatNumber(finalPopulation)} UFC (${occupancyPct.toFixed(0)}% de K) al final de las ${tMax} h, situándose en la fase de «${phase.label}».`

  return {
    severity,
    headline,
    summary,
    items: [
      { title: 'Tasa de crecimiento (r)', body: rText },
      { title: 'Capacidad de carga (K)', body: kText },
      { title: 'Punto de inflexión (velocidad máxima)', body: inflectionText },
      { title: 'Tiempo crítico de absceso', body: criticalText },
      { title: 'Interpretación clínica', body: recommendation },
    ],
  }
}
