'use client'

// =====================================================================
// components/petri-dish.tsx
// Visualización tipo "placa de Petri" sobre <canvas>. Representa la
// población bacteriana como colonias/puntos que aparecen y se densifican
// a medida que avanza la simulación. No es una gráfica: es una vista
// espacial cualitativa del proceso de crecimiento.
//
// Para evitar dibujar 100.000 puntos, mapeamos la fracción N/K a una
// cantidad de "colonias" visibles con una escala perceptual (sqrt), y
// modulamos el tamaño y la opacidad de cada colonia según la densidad.
// =====================================================================

import { useEffect, useMemo, useRef } from 'react'

interface PetriDishProps {
  /** Población actual mostrada (sincronizada con la animación). */
  population: number
  /** Capacidad de carga del medio. */
  K: number
  /** Tiempo actual de la simulación (para la etiqueta). */
  time: number
}

// Número máximo de colonias dibujadas cuando N = K.
const MAX_COLONIES = 520

// Posición y semilla fijas por colonia: generadas una sola vez para que
// las colonias no "salten" entre frames, solo aparezcan progresivamente.
interface Colony {
  x: number // 0..1 dentro del círculo
  y: number // 0..1 dentro del círculo
  r: number // radio base relativo
  hueShift: number
  appearAt: number // umbral [0..1] de fracción a partir del cual aparece
}

function makeColonies(): Colony[] {
  const colonies: Colony[] = []
  // Generador pseudoaleatorio determinista (mulberry32) para estabilidad.
  let seed = 0x9e3779b9
  const rand = () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  for (let i = 0; i < MAX_COLONIES; i++) {
    // Distribución uniforme dentro de un disco.
    const angle = rand() * Math.PI * 2
    const radius = Math.sqrt(rand()) // raíz para densidad uniforme
    colonies.push({
      x: 0.5 + Math.cos(angle) * radius * 0.5,
      y: 0.5 + Math.sin(angle) * radius * 0.5,
      r: 0.6 + rand() * 0.9,
      hueShift: rand() * 26 - 13,
      appearAt: rand(), // cada colonia tiene su propio umbral de aparición
    })
  }
  // Ordenamos por umbral para que el llenado sea coherente.
  colonies.sort((a, b) => a.appearAt - b.appearAt)
  return colonies
}

export function PetriDish({ population, K, time }: PetriDishProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colonies = useMemo(() => makeColonies(), [])

  // Fracción de ocupación (0..1).
  const fraction = K > 0 ? Math.min(1, Math.max(0, population / K)) : 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resolución física (devicePixelRatio) para nitidez.
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const cssSize = canvas.clientWidth || 360
    canvas.width = cssSize * dpr
    canvas.height = cssSize * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const size = cssSize
    const cx = size / 2
    const cy = size / 2
    const dishR = size * 0.46

    ctx.clearRect(0, 0, size, size)

    // ---- Medio de cultivo (fondo del disco) ----
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, dishR, 0, Math.PI * 2)
    ctx.clip()

    // Color del agar: vira de claro a más saturado según densidad.
    const agarLight = 96 - fraction * 14
    ctx.fillStyle = `hsl(168 42% ${agarLight}%)`
    ctx.fillRect(0, 0, size, size)

    // ---- Colonias ----
    // Cuántas colonias mostrar: escala perceptual (sqrt) para que el
    // crecimiento se sienta vivo incluso con poblaciones pequeñas.
    const visibleCount = Math.round(Math.sqrt(fraction) * colonies.length)

    for (let i = 0; i < visibleCount; i++) {
      const c = colonies[i]
      const px = cx + (c.x - 0.5) * dishR * 2
      const py = cy + (c.y - 0.5) * dishR * 2

      // El tamaño crece levemente con la densidad global.
      const baseR = c.r * (1.6 + fraction * 2.4)
      const hue = 172 + c.hueShift
      const light = 38 - fraction * 8

      // Halo translúcido.
      ctx.beginPath()
      ctx.fillStyle = `hsla(${hue} 55% ${light + 18}% / 0.25)`
      ctx.arc(px, py, baseR * 2.1, 0, Math.PI * 2)
      ctx.fill()

      // Núcleo de la colonia.
      ctx.beginPath()
      ctx.fillStyle = `hsl(${hue} 60% ${light}%)`
      ctx.arc(px, py, baseR, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // ---- Borde de la placa ----
    ctx.beginPath()
    ctx.arc(cx, cy, dishR, 0, Math.PI * 2)
    ctx.lineWidth = 6
    ctx.strokeStyle = 'hsl(168 16% 78%)'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, dishR - 4, 0, Math.PI * 2)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = 'hsl(168 20% 88%)'
    ctx.stroke()
  }, [fraction, colonies])

  const pct = Math.round(fraction * 100)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Colonización del medio
        </h3>
        <span className="text-xs text-muted-foreground">t = {time.toFixed(1)}</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative aspect-square w-full max-w-[360px]">
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            role="img"
            aria-label={`Placa de Petri con ${pct}% de ocupación del medio de cultivo`}
          />
        </div>

        {/* Barra de ocupación del medio */}
        <div className="w-full max-w-[360px]">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Ocupación del medio</span>
            <span className="font-medium text-foreground">{pct}% de K</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
