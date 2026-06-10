'use client'

import { useState } from 'react'
import { Milestone } from '@/types'
import { X, Trash2 } from 'lucide-react'

const PRESET_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#db2777', '#0891b2', '#65a30d',
]

interface Props {
  milestone?: Milestone
  onSubmit: (data: Partial<Milestone>) => void
  onDelete?: () => void
  onCancel: () => void
}

export default function MilestoneForm({ milestone, onSubmit, onDelete, onCancel }: Props) {
  const [name, setName] = useState(milestone?.name ?? '')
  const [description, setDescription] = useState(milestone?.description ?? '')
  const [startDate, setStartDate] = useState(milestone?.start_date ?? '')
  const [endDate, setEndDate] = useState(milestone?.end_date ?? '')
  const [color, setColor] = useState(milestone?.color ?? '#7c3aed')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!milestone

  async function handleSubmit() {
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    if (!startDate)    { setError('La fecha de inicio es obligatoria'); return }
    if (!endDate)      { setError('La fecha de fin es obligatoria'); return }
    if (endDate < startDate) { setError('La fecha de fin debe ser posterior al inicio'); return }

    setLoading(true)
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      start_date: startDate,
      end_date: endDate,
      color,
    })
    setLoading(false)
  }

  const inputClass = "w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">{isEdit ? 'Editar milestone' : 'Nuevo milestone'}</h2>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Nombre */}
        <div>
          <label className={labelClass}>Nombre *</label>
          <input
            autoFocus
            className={inputClass}
            placeholder="ej. MVP v1.0, Sprint 3..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            rows={2}
            placeholder="Opcional..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fecha inicio *</label>
            <input type="date" className={inputClass} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Fecha fin *</label>
            <input type="date" className={inputClass} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className={labelClass}>Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `3px solid ${c}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-7 h-7 rounded-full border border-gray-200 cursor-pointer p-0 overflow-hidden"
              title="Color personalizado"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Botones */}
        <div className="flex gap-2 pt-1">
          {isEdit && onDelete && (
            <button
              onClick={onDelete}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-9 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear milestone'}
          </button>
        </div>
      </div>
    </div>
  )
}
