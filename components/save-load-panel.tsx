'use client'

// =====================================================================
// components/save-load-panel.tsx
// Panel para guardar, cargar y gestionar simulaciones guardadas.
// Usa localStorage para persistencia.
// =====================================================================

import { useEffect, useState } from 'react'
import type { SimulationParams, SimulationResult } from '@/lib/logistic'
import {
  loadAllSavedSimulations,
  saveSimulation,
  deleteSimulation,
  exportSimulationAsCSV,
  type SavedSimulation,
} from '@/lib/storage'
import { Button } from '@/components/ui/button'

interface SaveLoadPanelProps {
  params: SimulationParams
  result: SimulationResult | null
  onLoad: (params: SimulationParams) => void
}

export function SaveLoadPanel({ params, result, onLoad }: SaveLoadPanelProps) {
  const [saved, setSaved] = useState<SavedSimulation[]>([])
  const [showSave, setShowSave] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveNotes, setSaveNotes] = useState('')

  useEffect(() => {
    setSaved(loadAllSavedSimulations())
  }, [])

  const handleSave = () => {
    if (!result || !saveName.trim()) return

    saveSimulation(saveName, params, result, saveNotes)
    setSaved(loadAllSavedSimulations())
    setSaveName('')
    setSaveNotes('')
    setShowSave(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta simulación?')) {
      deleteSimulation(id)
      setSaved(loadAllSavedSimulations())
    }
  }

  const handleExport = (id: string) => {
    const csv = exportSimulationAsCSV(id)
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `simulacion_${id}.csv`)
      link.click()
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Gestión de simulaciones</h3>
        <span className="text-xs text-muted-foreground">
          {saved.length} guardadas
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!result}
          onClick={() => setShowSave(!showSave)}
          className="flex-1"
        >
          💾 Guardar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowLoad(!showLoad)}
          className="flex-1"
        >
          📂 Cargar ({saved.length})
        </Button>
      </div>

      {/* Formulario de guardado */}
      {showSave && result && (
        <div className="space-y-2 rounded border border-border/50 bg-background/50 p-3">
          <input
            type="text"
            placeholder="Nombre de la simulación"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground"
          />
          <textarea
            placeholder="Notas opcionales..."
            value={saveNotes}
            onChange={(e) => setSaveNotes(e.target.value)}
            className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="flex-1"
            >
              Guardar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSave(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de simulaciones guardadas */}
      {showLoad && saved.length > 0 && (
        <div className="max-h-[300px] space-y-2 overflow-auto rounded border border-border/50 bg-background/50 p-3">
          {saved.map((sim) => (
            <div
              key={sim.id}
              className="flex items-start justify-between rounded border border-border/30 bg-card/50 p-2"
            >
              <div className="flex-1 text-xs">
                <p className="font-medium text-foreground">{sim.name}</p>
                <p className="text-muted-foreground">
                  {new Date(sim.timestamp).toLocaleDateString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {sim.notes && (
                  <p className="mt-1 text-muted-foreground italic">{sim.notes}</p>
                )}
              </div>
              <div className="ml-2 flex gap-1">
                <button
                  onClick={() => onLoad(sim.params)}
                  className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                  title="Cargar esta simulación"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleExport(sim.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                  title="Exportar como CSV"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleDelete(sim.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showLoad && saved.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No hay simulaciones guardadas aún
        </p>
      )}
    </div>
  )
}
