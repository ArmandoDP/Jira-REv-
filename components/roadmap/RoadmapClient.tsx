'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Milestone, Task } from '@/types'
import GanttChart from '@/components/roadmap/GanttChart'
import MilestoneForm from '@/components/roadmap/MilestoneForm'
import { Plus, Milestone as MilestoneIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  project: Project
  initialMilestones: Milestone[]
  initialTasks: Task[]
  userRole: string
}

export default function RoadmapClient({ project, initialMilestones, initialTasks, userRole }: Props) {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [tasks] = useState(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const supabase = createClient()

  async function handleCreateMilestone(data: Partial<Milestone>) {
    const { data: created } = await supabase
      .from('milestones')
      .insert({ ...data, project_id: project.id })
      .select()
      .single()
    if (created) {
      setMilestones(prev => [...prev, created].sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ))
    }
    setShowForm(false)
  }

  async function handleUpdateMilestone(data: Partial<Milestone>) {
    if (!editingMilestone) return
    const { data: updated } = await supabase
      .from('milestones')
      .update(data)
      .eq('id', editingMilestone.id)
      .select()
      .single()
    if (updated) {
      setMilestones(prev => prev.map(m => m.id === updated.id ? updated : m))
    }
    setEditingMilestone(null)
  }

  async function handleDeleteMilestone(id: string) {
    if (!confirm('¿Eliminar este milestone? Las tareas asociadas quedarán sin milestone.')) return
    await supabase.from('milestones').delete().eq('id', id)
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  const hasDates = milestones.length > 0 || tasks.length > 0

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Panel izquierdo — lista de milestones */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Milestones</span>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowForm(true)}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {milestones.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <MilestoneIcon className="w-6 h-6 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Sin milestones</p>
              {userRole === 'admin' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs text-gray-500 hover:text-gray-900 mt-1 underline"
                >
                  Crear uno
                </button>
              )}
            </div>
          ) : (
            milestones.map(m => {
              const mTasks = tasks.filter(t => t.milestone_id === m.id)
              const doneTasks = mTasks.filter(t => t.status === 'done')
              const progress = mTasks.length > 0
                ? Math.round((doneTasks.length / mTasks.length) * 100)
                : 0

              return (
                <div
                  key={m.id}
                  className="group px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                  onClick={() => userRole === 'admin' && setEditingMilestone(m)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-sm font-medium text-gray-800 truncate">{m.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {formatDate(m.start_date)} → {formatDate(m.end_date)}
                  </p>
                  {mTasks.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{doneTasks.length}/{mTasks.length} tareas</span>
                        <span className="text-xs text-gray-400">{progress}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: m.color }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Panel derecho — Gantt */}
      <div className="flex-1 overflow-hidden">
        {hasDates ? (
          <GanttChart milestones={milestones} tasks={tasks} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MilestoneIcon className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Sin datos para mostrar</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Crea milestones o agrega fechas de inicio y fin a tus tareas para ver el roadmap
            </p>
          </div>
        )}
      </div>

      {/* Modal crear milestone */}
      {(showForm || editingMilestone) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <MilestoneForm
              milestone={editingMilestone ?? undefined}
              onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone}
              onDelete={editingMilestone ? () => handleDeleteMilestone(editingMilestone.id) : undefined}
              onCancel={() => { setShowForm(false); setEditingMilestone(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}