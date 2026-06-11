// =====================================================================
// lib/scientific-info.ts
// Información científica y contexto educativo sobre parámetros y métricas.
// Proporciona explicaciones técnicas y clínicas para tooltips.
// =====================================================================

export const PARAMETER_INFO = {
  N0: {
    label: 'Población inicial (N₀)',
    description: 'Cantidad de bacterias al inicio de la simulación (t = 0).',
    units: 'UFC (Unidades Formadoras de Colonias)',
    clinical:
      'En infecciones de piel, típicamente 100-1000 UFC por folículo. En heridas quirúrgicas puede variar de 10 a 10⁶ UFC.',
    tips: 'Valores más pequeños (~10-100) modelan inoculaciones reducidas; valores más grandes (~10³-10⁴) modelan infecciones establecidas.',
    range: { min: 1, max: 100000, default: 100 },
  },

  r: {
    label: 'Tasa de crecimiento intrínseca (r)',
    description:
      'Capacidad de reproducción de la población por unidad de tiempo. Determina la velocidad de duplicación en fase exponencial.',
    units: 'h⁻¹ (inverso de horas)',
    clinical:
      'S. aureus típicamente: r ≈ 0.5–1.0 h⁻¹. MRSA puede tener r ligeramente menor (adaptación a estrés). En biofilm, r ≈ 0.1–0.3 h⁻¹.',
    tips:
      'r = 0.5 → tiempo de duplicación ≈ 1.4 h. r = 0.8 → ≈ 0.87 h. r = 1.5 → ≈ 0.46 h. Aumenta r para simular cepas agresivas.',
    range: { min: 0.01, max: 3, default: 0.8 },
  },

  K: {
    label: 'Capacidad de carga (K)',
    description:
      'Población máxima sostenible del medio. Representa limitaciones de recursos (espacio, nutrientes, O₂).',
    units: 'UFC',
    clinical:
      'Folículo piloso: K ≈ 10⁴–10⁵. Herida quirúrgica pequeña: K ≈ 10⁵–10⁶. Absceso: K ≈ 10⁶–10⁷. Biofilm en catéter: K ≈ 10⁷–10⁸.',
    tips:
      'Reduce K para modelar ambientes cerrados (folículos, quistes). Aumenta K para espacios abiertos (heridas abiertas, superficies)',
    range: { min: 1000, max: 10000000, default: 100000 },
  },

  dt: {
    label: 'Paso temporal (Δt)',
    description:
      'Resolución del método numérico. Pasos más pequeños = mayor precisión pero más cálculos.',
    units: 'horas',
    clinical: 'No tiene interpretación clínica directa; es un parámetro técnico de simulación.',
    tips:
      'Δt = 0.5 h es buen balance entre velocidad y precisión. Si r·Δt > 1, aumenta precisión usando RK4 o reduciendo Δt.',
    range: { min: 0.01, max: 2, default: 0.5 },
  },

  tMax: {
    label: 'Tiempo total de simulación (tₘₐₓ)',
    description: 'Duración total del período simulado desde t = 0 hasta tₘₐₓ.',
    units: 'horas',
    clinical:
      '24–48 h: seguimiento de infecciones de piel. 5–10 días: infecciones más profundas. 30+ días: infecciones crónicas o biofilm.',
    tips: 'Si deseas ver saturación, asegúrate que tMax sea lo suficientemente grande. Regla práctica: tMax ≥ 5 × (tiempo al 90% de K).',
    range: { min: 1, max: 500, default: 30 },
  },

  method: {
    label: 'Método numérico',
    description:
      'Algoritmo de integración. Euler es rápido; Runge-Kutta 4 es más preciso para parámetros agresivos.',
    units: 'Escolha: "euler" o "rk4"',
    clinical: 'No afecta directamente; elije según precisión deseada.',
    tips:
      'Usa Euler para exploración rápida. Usa RK4 cuando r·Δt > 1 o necesitas máxima precisión.',
    range: { min: null, max: null, default: 'euler' },
  },
}

export const METRICS_INFO = {
  doublingTime: {
    name: 'Tiempo de duplicación',
    description: 'Tiempo en el que la población se duplica (primero desde N₀ → 2N₀).',
    formula: 'tₐ = ln(2) / r',
    interpretation:
      'Indicador de agresividad. Duplicación rápida (~<1 h) indica alta virulencia.',
    clinical: 'En laboratorio: S. aureus típicamente 0.8–1.5 h. MRSA puede ser 1–2 h.',
  },

  maxGrowthRate: {
    name: 'Máxima velocidad de crecimiento',
    description: 'Máximo valor de dN/dt durante la simulación. Ocurre en N = K/2 (inflexión).',
    formula: 'dNdt_máx = r·K / 4',
    interpretation:
      'Cuanto mayor, más agresivo el crecimiento. En transición exponencial↔plateau.',
    clinical: 'Crítico para estimar cuándo la infección se vuelve clínicamente significativa.',
  },

  inflectionPoint: {
    name: 'Punto de inflexión',
    description: 'Momento cuando N = K/2, donde la velocidad de crecimiento es máxima.',
    formula: 'N* = K/2',
    interpretation:
      'Antes de este punto: crecimiento acelerado. Después: deceleración. Ventana crítica de intervención.',
    clinical: 'Intervención preventiva es más efectiva ANTES del punto de inflexión.',
  },

  timeTo90: {
    name: 'Tiempo al 90% de K',
    description: 'Primera vez que la población alcanza 0.9·K. Umbral de saturación clínica.',
    formula: 'Resuelto numéricamente de: N(t) = 0.9·K',
    interpretation: 'Por encima de este umbral, el sistema tiende inevitable a formación de masa.',
    clinical: 'En piel: corresponde a inicio de síntomas visibles (enrojecimiento, exudado).',
  },

  phase: {
    name: 'Régimen de crecimiento',
    description: 'Clasificación de la dinámica: exponencial, sigmoidea o estacionaria.',
    types: {
      exponential:
        'Crecimiento rápido sin límites aparentes. Ocupación N/K < 30%. Caracterizado por duplicación regular.',
      sigmoid:
        'Transición entre exponencial y plateau. Ocupación 30–80%. Curva S-shaped característica del modelo logístico.',
      stationary:
        'Saturación. Ocupación > 80%. La población ha alcanzado o está muy cerca de K. Velocidad de crecimiento ≈ 0.',
    },
    clinical: 'Define la "fase clínica": cambio en régimen indica progresión de la infección.',
  },
}

export const SCIENTIFIC_CONTEXT = {
  logisticModel: {
    title: 'Modelo Logístico',
    equation: 'dN/dt = r·N·(1 − N/K)',
    description:
      'Ecuación diferencial que describe crecimiento poblacional con limitación de recursos.',
    advantage: 'Simple, realista para muchas poblaciones bacterianas, solución analítica conocida.',
    limitation:
      'No captura retrasos, fluctuaciones estocásticas, ni adaptación de la cepa a lo largo del tiempo.',
  },

  staphylococcusAureus: {
    name: 'Staphylococcus aureus',
    phylum: 'Firmicutes',
    gram: 'Gram-positiva',
    shape: 'Cocos (esférica)',
    habitat: 'Comensal habitual de piel humana (~30% de población)',
    pathogenicity: 'Oportunista: causa infecciones cuando hay barrera dañada o inmunidad baja',
    virulence:
      'Produce toxinas, coagulasa, adhesinas. MRSA (Multi-Resistant S. aureus) es resistente a β-lactámicos.',
    typicalInfections: 'Folliculitis, forúnculos, abscesos, impétigo, heridas infectadas',
  },

  eulerMethod: {
    name: 'Método de Euler',
    description: 'Aproximación numérica de primer orden para EDOs. Simple y rápido.',
    formula: 'N(t+Δt) = N(t) + f(N,t)·Δt',
    stability: 'Estable cuando r·Δt < 1 (idealmente < 2 para logística)',
    tradeoff: 'Rápido pero menos preciso. Requiere pasos pequeños para precisión.',
  },

  rungeKutta4: {
    name: 'Método Runge-Kutta de orden 4 (RK4)',
    description: 'Aproximación numérica de 4º orden. Muy precisa.',
    formula:
      'Usa 4 evaluaciones de la función por paso: k1, k2=(k1+k2)/2·Δt, k3, k4. Promedia ponderado.',
    stability: 'Más estable; tolera pasos más grandes que Euler.',
    tradeoff: 'Más preciso pero ~2–3× más lento computacionalmente. Recomendado para r·Δt > 1.',
  },

  clinicalThreshold: {
    value: '90% de K',
    meaning:
      'Umbral estimado donde la infección es clínicamente observable (enrojecimiento, dolor, exudado).',
    biology:
      'Por debajo: microinfección asintomática. Por encima: síntomas y respuesta inmune marcada.',
    intervention: 'Ventana ideal de intervención (antibióticos, limpieza, drenaje) es ANTES de este umbral.',
  },
}

export function getParameterTip(paramKey: string): string {
  const info = PARAMETER_INFO[paramKey as keyof typeof PARAMETER_INFO]
  return info
    ? `${info.description} (${info.units}). ${info.tips}`
    : 'Parámetro de simulación'
}

export function getMetricExplanation(metricKey: string): string {
  const info = METRICS_INFO[metricKey as keyof typeof METRICS_INFO]
  return info
    ? `${info.name}: ${info.description}`
    : 'Métrica de simulación'
}
