'use client'

import { useState } from 'react'
import { Task, TaskStatus, TaskPriority } from '@/types'
import { X } from 'lucide-react'

interface Props {
  members: any[]
  defaultStatus?: TaskStatus
  onSubmit: (data: Partial<Task>) => void
  onCancel: () => void
}

export default function TaskForm({ members, defaultStatus = 'todo', onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }
    setLoading(true)
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      estimated_hours: estimatedHours ? parseInt(estimatedHours) : null,
      status: defaultStatus,
    })
    setLoading(false)
  }

  const inputClass = "w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Nueva tarea</h2>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Título */}
        <div>
          <label className={labelClass}>Título *</label>
          <input
            className={inputClass}
            placeholder="¿Qué hay que hacer?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        {/* Descripción */}
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            placeholder="Detalles opcionales..."
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Prioridad + Asignado */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Prioridad</label>
            <select
              className={inputClass}
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Asignar a</label>
            <select
              className={inputClass}
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profile?.full_name ?? m.user_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha + Horas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fecha límite</label>
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Horas estimadas</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              min="1"
              value={estimatedHours}
              onChange={e => setEstimatedHours(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Botones */}
        <div className="flex gap-2 pt-1">
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
            {loading ? 'Creando...' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  )
}