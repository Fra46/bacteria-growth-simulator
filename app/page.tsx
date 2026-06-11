// =====================================================================
// app/page.tsx
// Página principal del simulador de crecimiento logístico de
// Staphylococcus aureus. Renderiza el encabezado y el dashboard.
// =====================================================================

import { SimulatorDashboard } from '@/components/simulator-dashboard'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* Encabezado científico */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Modelo de crecimiento logístico · Método de Euler
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="space-y-3">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Simulador de crecimiento de <em className="not-italic text-primary">Staphylococcus aureus</em>
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              Simulación numérica de la dinámica poblacional bacteriana mediante la ecuación
              diferencial logística, resuelta paso a paso con el método de Euler.
            </p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
        <SimulatorDashboard />
      </div>

      {/* Pie de página */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-5 md:px-8">
          <p className="text-xs text-muted-foreground">
            Aplicación científica educativa · Modelo logístico dN/dt = rN(1 − N/K)
          </p>
        </div>
      </footer>
    </main>
  )
}
