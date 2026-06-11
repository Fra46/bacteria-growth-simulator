'use client'

// =====================================================================
// components/scientific-guide.tsx
// Panel con información científica sobre el modelo, parámetros y métricas.
// Proporciona contexto educativo sobre S. aureus y simulación.
// =====================================================================

import { useState } from 'react'
import { SCIENTIFIC_CONTEXT, METRICS_INFO, PARAMETER_INFO } from '@/lib/scientific-info'

export function ScientificGuide() {
  const [activeTab, setActiveTab] = useState<'model' | 'bacteria' | 'parameters' | 'metrics'>('model')

  const tabs = [
    { id: 'model', label: '🧮 Modelo', icon: 'Ecuación' },
    { id: 'bacteria', label: '🦠 S. aureus', icon: 'Biología' },
    { id: 'parameters', label: '📊 Parámetros', icon: 'Variables' },
    { id: 'metrics', label: '📈 Métricas', icon: 'Resultados' },
  ] as const

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Información científica</h3>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-border pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto text-xs">
        {activeTab === 'model' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground">
                {SCIENTIFIC_CONTEXT.logisticModel.title}
              </h4>
              <p className="text-muted-foreground font-mono text-[0.7rem] mt-1">
                dN/dt = r·N·(1 − N/K)
              </p>
              <p className="text-muted-foreground mt-2">
                {SCIENTIFIC_CONTEXT.logisticModel.description}
              </p>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>Ventajas:</strong> {SCIENTIFIC_CONTEXT.logisticModel.advantage}
                </p>
                <p>
                  <strong>Limitaciones:</strong>{' '}
                  {SCIENTIFIC_CONTEXT.logisticModel.limitation}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <h4 className="font-semibold text-foreground">
                {SCIENTIFIC_CONTEXT.eulerMethod.name}
              </h4>
              <p className="text-muted-foreground font-mono text-[0.7rem] mt-1">
                N(t+Δt) = N(t) + f(N,t)·Δt
              </p>
              <p className="text-muted-foreground mt-2">
                {SCIENTIFIC_CONTEXT.eulerMethod.description}
              </p>
              <p className="text-muted-foreground mt-1">
                <strong>Estabilidad:</strong> {SCIENTIFIC_CONTEXT.eulerMethod.stability}
              </p>
            </div>

            <div className="border-t border-border pt-3">
              <h4 className="font-semibold text-foreground">
                {SCIENTIFIC_CONTEXT.rungeKutta4.name}
              </h4>
              <p className="text-muted-foreground mt-2">
                {SCIENTIFIC_CONTEXT.rungeKutta4.description}
              </p>
              <p className="text-muted-foreground mt-1">
                <strong>Ventaja:</strong> {SCIENTIFIC_CONTEXT.rungeKutta4.stability}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'bacteria' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground">
                {SCIENTIFIC_CONTEXT.staphylococcusAureus.name}
              </h4>
              <dl className="mt-2 space-y-1 text-muted-foreground">
                <div>
                  <dt className="font-semibold">Filo:</dt>
                  <dd>{SCIENTIFIC_CONTEXT.staphylococcusAureus.phylum}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Clasificación Gram:</dt>
                  <dd>{SCIENTIFIC_CONTEXT.staphylococcusAureus.gram}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Forma:</dt>
                  <dd>{SCIENTIFIC_CONTEXT.staphylococcusAureus.shape}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Hábitat:</dt>
                  <dd>{SCIENTIFIC_CONTEXT.staphylococcusAureus.habitat}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Patogenicidad:</dt>
                  <dd>{SCIENTIFIC_CONTEXT.staphylococcusAureus.pathogenicity}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Virulencia:</dt>
                  <dd>{SCIENTIFIC_CONTEXT.staphylococcusAureus.virulence}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Infecciones típicas:</dt>
                  <dd>{SCIENTIFIC_CONTEXT.staphylococcusAureus.typicalInfections}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'parameters' && (
          <div className="space-y-3">
            {Object.entries(PARAMETER_INFO).map(([key, info]) => (
              <div key={key} className="border-b border-border/50 pb-3 last:border-0">
                <h4 className="font-semibold text-foreground">{info.label}</h4>
                <p className="text-muted-foreground mt-1">{info.description}</p>
                <p className="text-muted-foreground/70 mt-1">
                  <strong>Contexto clínico:</strong> {info.clinical}
                </p>
                <p className="text-muted-foreground/70 mt-1">
                  <strong>Sugerencias:</strong> {info.tips}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-3">
            {Object.entries(METRICS_INFO).map(([key, info]) => (
              <div key={key} className="border-b border-border/50 pb-3 last:border-0">
                <h4 className="font-semibold text-foreground">{info.name}</h4>
                <p className="text-muted-foreground mt-1">{info.description}</p>
                <p className="text-muted-foreground/70 font-mono text-[0.7rem] mt-1">
                  {info.formula}
                </p>
                <p className="text-muted-foreground/70 mt-1">
                  <strong>Interpretación:</strong> {info.interpretation}
                </p>
                <p className="text-muted-foreground/70 mt-1">
                  <strong>Contexto clínico:</strong> {info.clinical}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded border border-border/50 bg-background/50 p-2 text-[0.7rem] text-muted-foreground">
        <p>
          💡 <strong>Tip:</strong> Pasa el cursor sobre los parámetros en el formulario para ver
          descripciones detalladas.
        </p>
      </div>
    </section>
  )
}
