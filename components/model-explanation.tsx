// =====================================================================
// components/model-explanation.tsx
// Explicación matemática del modelo logístico, el método de Euler
// y la interpretación biológica del crecimiento bacteriano.
// =====================================================================

import { MathBlock, Math } from '@/components/math'

export function ModelExplanation() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Modelo matemático */}
      <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">Modelo matemático</h3>

        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            El crecimiento logístico se describe mediante la ecuación diferencial:
          </p>
          <div className="rounded-lg bg-secondary/60 p-3 text-foreground">
            <MathBlock>{'\\frac{dN}{dt} = r\\,N\\left(1 - \\frac{N}{K}\\right)'}</MathBlock>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            donde <Math>{'N'}</Math> es la población, <Math>{'r'}</Math> la tasa de
            crecimiento intrínseca y <Math>{'K'}</Math> la capacidad de carga del medio.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Resolvemos numéricamente con el <strong className="text-foreground">Método de Euler</strong>,
            que aproxima la solución avanzando en pasos discretos <Math>{'\\Delta t'}</Math>:
          </p>
          <div className="rounded-lg bg-secondary/60 p-3 text-foreground">
            <MathBlock>
              {'N_{t+\\Delta t} = N_t + r\\,N_t\\left(1 - \\frac{N_t}{K}\\right)\\Delta t'}
            </MathBlock>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            En cada iteración se evalúa la pendiente local <Math>{'dN/dt'}</Math> y se
            proyecta la población al siguiente instante. Pasos <Math>{'\\Delta t'}</Math> más
            pequeños producen mayor precisión.
          </p>
        </div>
      </article>

      {/* Interpretación biológica */}
      <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">Interpretación biológica</h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          El crecimiento de <em>Staphylococcus aureus</em> sigue tres fases características
          que el modelo logístico reproduce con fidelidad:
        </p>

        <ol className="flex flex-col gap-3">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Fase exponencial:</strong> cuando{' '}
              <Math>{'N \\ll K'}</Math>, el término <Math>{'(1 - N/K)'}</Math> se acerca a 1
              y la población crece de forma casi exponencial: hay nutrientes abundantes y
              espacio libre.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              2
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Desaceleración:</strong> a medida que{' '}
              <Math>{'N'}</Math> se aproxima a <Math>{'K'}</Math>, la competencia por
              recursos aumenta y la velocidad de crecimiento disminuye progresivamente.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              3
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Fase estacionaria:</strong> al alcanzar{' '}
              <Math>{'N \\approx K'}</Math> el crecimiento se detiene; la curva se aplana
              porque el medio ya no sostiene más población.
            </p>
          </li>
        </ol>

        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Así, el cultivo aumenta rápidamente al inicio y luego se estabiliza al acercarse
          a la capacidad de carga <Math>{'K'}</Math>, generando la característica curva
          sigmoidea (forma de S).
        </p>
      </article>
    </section>
  )
}
