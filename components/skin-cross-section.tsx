'use client'

// =====================================================================
// components/skin-cross-section.tsx
// Visualización tipo "corte transversal de piel" sobre <canvas>, inspirada
// en el esquema de las cuatro fases de formación del absceso:
//   1) Estado Normal  2) El Detonante  3) Invasión  4) El Absceso
// La escena evoluciona de forma continua según la fracción N/K, de modo
// que el usuario "ve" cómo el folículo piloso pasa del equilibrio comensal
// a la masa purulenta a medida que crece la población bacteriana.
// =====================================================================

import { useEffect, useMemo, useRef } from 'react'
import { phaseFromOccupancy } from '@/lib/conclusions'

interface SkinCrossSectionProps {
  /** Población actual mostrada (sincronizada con la animación). */
  population: number
  /** Capacidad de carga del medio. */
  K: number
}

// Bacterias predibujadas con posición determinista alrededor del folículo,
// para que aparezcan progresivamente sin "saltar" entre frames.
interface Microbe {
  angle: number
  spread: number
  size: number
  appearAt: number
}

function makeMicrobes(): Microbe[] {
  let seed = 0x1234abcd
  const rand = () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const list: Microbe[] = []
  for (let i = 0; i < 90; i++) {
    list.push({
      angle: rand() * Math.PI * 2,
      spread: rand(),
      size: 1.6 + rand() * 1.8,
      appearAt: rand(),
    })
  }
  list.sort((a, b) => a.appearAt - b.appearAt)
  return list
}

export function SkinCrossSection({ population, K }: SkinCrossSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const microbes = useMemo(() => makeMicrobes(), [])

  const fraction = K > 0 ? Math.min(1, Math.max(0, population / K)) : 0
  const phase = phaseFromOccupancy(fraction)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const W = canvas.clientWidth || 360
    const H = canvas.clientHeight || 300
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    // ---- Capas de la piel ----
    const epidermisH = H * 0.18
    // Epidermis (capa superior)
    ctx.fillStyle = 'oklch(0.86 0.04 60)'
    ctx.fillRect(0, 0, W, epidermisH)
    // Dermis (capa media-inferior)
    ctx.fillStyle = 'oklch(0.8 0.05 45)'
    ctx.fillRect(0, epidermisH, W, H - epidermisH)
    // Línea de separación de capas
    ctx.strokeStyle = 'oklch(0.7 0.06 40)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, epidermisH)
    ctx.lineTo(W, epidermisH)
    ctx.stroke()

    // ---- Folículo piloso (centro) ----
    const fx = W * 0.5
    const surfaceY = H * 0.06
    const follicleBottom = H * 0.82
    const follicleW = W * 0.05

    ctx.save()
    ctx.strokeStyle = 'oklch(0.6 0.05 40)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(fx - follicleW, surfaceY)
    ctx.lineTo(fx - follicleW * 0.7, follicleBottom)
    ctx.moveTo(fx + follicleW, surfaceY)
    ctx.lineTo(fx + follicleW * 0.7, follicleBottom)
    ctx.stroke()

    // Bulbo del folículo
    ctx.beginPath()
    ctx.fillStyle = 'oklch(0.68 0.06 40)'
    ctx.ellipse(fx, follicleBottom, follicleW * 1.5, follicleW * 1.7, 0, 0, Math.PI * 2)
    ctx.fill()

    // Tallo del pelo
    ctx.strokeStyle = 'oklch(0.4 0.03 50)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(fx, follicleBottom - follicleW)
    ctx.lineTo(fx, surfaceY - H * 0.04)
    ctx.stroke()
    ctx.restore()

    // ---- Fase 2+: El Detonante (microherida / flecha de fricción) ----
    if (fraction >= 0.15) {
      const intensity = Math.min(1, (fraction - 0.15) / 0.3)
      ctx.save()
      ctx.strokeStyle = `oklch(0.55 0.22 25 / ${0.4 + intensity * 0.5})`
      ctx.lineWidth = 2.5
      // Flecha indicando fricción/ruptura sobre la superficie
      const ax = fx - follicleW - 26
      ctx.beginPath()
      ctx.moveTo(ax - 18, surfaceY + 4)
      ctx.lineTo(ax, surfaceY + 4)
      ctx.moveTo(ax - 5, surfaceY - 1)
      ctx.lineTo(ax, surfaceY + 4)
      ctx.lineTo(ax - 5, surfaceY + 9)
      ctx.stroke()
      // Grieta en la epidermis
      ctx.strokeStyle = `oklch(0.5 0.2 28 / ${0.3 + intensity * 0.5})`
      ctx.lineWidth = 1.5 + intensity
      ctx.beginPath()
      ctx.moveTo(fx - follicleW, surfaceY + 2)
      ctx.lineTo(fx - follicleW * 0.4, epidermisH * 0.7)
      ctx.lineTo(fx - follicleW * 0.8, epidermisH)
      ctx.stroke()
      ctx.restore()
    }

    // ---- Fase 3+: Invasión (bacterias multiplicándose) ----
    if (fraction >= 0.15) {
      const visible = Math.round(Math.sqrt(fraction) * microbes.length)
      const cluster = follicleBottom - follicleW * 0.5
      const baseRadius = follicleW * (2 + fraction * 4)
      for (let i = 0; i < visible; i++) {
        const m = microbes[i]
        const rad = baseRadius * (0.3 + m.spread * 0.9)
        const mx = fx + Math.cos(m.angle) * rad
        const my = cluster + Math.sin(m.angle) * rad * 0.7
        ctx.beginPath()
        ctx.fillStyle = 'oklch(0.82 0.16 95)'
        ctx.arc(mx, my, m.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'oklch(0.6 0.14 95)'
        ctx.lineWidth = 0.6
        ctx.stroke()
      }
    }

    // ---- Fase 4: El Absceso (masa inflamada purulenta) ----
    if (fraction >= 0.45) {
      const grow = Math.min(1, (fraction - 0.45) / 0.55)
      const cx = fx
      const cy = follicleBottom - follicleW
      const R = follicleW * (3 + grow * 6)

      // Halo inflamatorio (enrojecimiento)
      ctx.beginPath()
      ctx.fillStyle = `oklch(0.6 0.2 25 / ${0.18 + grow * 0.22})`
      ctx.ellipse(cx, cy, R * 1.5, R * 1.35, 0, 0, Math.PI * 2)
      ctx.fill()

      // Cápsula del absceso
      ctx.beginPath()
      ctx.fillStyle = `oklch(0.58 0.21 26 / ${0.55 + grow * 0.35})`
      ctx.ellipse(cx, cy, R, R * 0.9, 0, 0, Math.PI * 2)
      ctx.fill()

      // Centro purulento (pus)
      ctx.beginPath()
      ctx.fillStyle = `oklch(0.88 0.13 95 / ${0.6 + grow * 0.35})`
      ctx.ellipse(cx, cy - R * 0.1, R * 0.5, R * 0.42, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [fraction, microbes])

  const pct = Math.round(fraction * 100)

  // Color del "chip" de fase según la etapa.
  const phaseStyles: Record<string, string> = {
    normal: 'bg-secondary text-secondary-foreground',
    detonante: 'bg-accent text-accent-foreground',
    invasion: 'bg-chart-3/20 text-foreground',
    absceso: 'bg-destructive/15 text-destructive',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Corte de piel: formación del absceso
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${phaseStyles[phase.key]}`}
        >
          {phase.label}
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg border border-border">
        <canvas
          ref={canvasRef}
          className="h-[300px] w-full"
          role="img"
          aria-label={`Corte transversal de piel en fase ${phase.label} con ${pct}% de ocupación`}
        />
      </div>

      {/* Leyenda de las cuatro fases */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
        <LegendDot active={phase.key === 'normal'} color="bg-secondary-foreground/50" label="Normal" />
        <LegendDot active={phase.key === 'detonante'} color="bg-chart-3" label="Detonante" />
        <LegendDot active={phase.key === 'invasion'} color="bg-chart-3" label="Invasión" />
        <LegendDot active={phase.key === 'absceso'} color="bg-destructive" label="Absceso" />
      </div>
    </div>
  )
}

function LegendDot({
  active,
  color,
  label,
}: {
  active: boolean
  color: string
  label: string
}) {
  return (
    <div
      className={`flex items-center gap-1.5 ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
    >
      <span className={`h-2 w-2 rounded-full ${color} ${active ? '' : 'opacity-40'}`} />
      {label}
    </div>
  )
}
