'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskStatus, TaskPriority } from '@/types'
import { formatDate, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils'
import { MoreHorizontal, Calendar, Clock, ChevronRight, Trash2 } from 'lucide-react'

interface Props {
  task: Task
  statuses: TaskStatus[]
  userRole: string
  onMove: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  projectSlug: string
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog:     'Backlog',
  todo:        'Por hacer',
  in_progress: 'En progreso',
  in_review:   'En revisión',
  done:        'Completado',
  cancelled:   'Cancelado',
}

export default function TaskCard({ task, statuses, userRole, onMove, onDelete, onUpdate, projectSlug }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 hover:border-gray-200 hover:shadow-sm transition-all group">
      {/* Priority + menu */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>

        {userRole !== 'viewer' && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 text-sm">
                  <p className="px-3 py-1.5 text-xs text-gray-400 font-medium">Mover a</p>
                  {statuses.filter(s => s !== task.status).map(s => (
                    <button
                      key={s}
                      onClick={() => { onMove(task.id, s); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                    >
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        router.push(`/projects/${projectSlug}/tasks/${task.id}`)
                        setMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                    >
                      Ver detalle
                    </button>
                    <button
                      onClick={() => { onDelete(task.id); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <p
        className="text-sm font-medium text-gray-900 mb-2 leading-snug cursor-pointer hover:text-gray-600"
        onClick={() => router.push(`/projects/${projectSlug}/tasks/${task.id}`)}
      >
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {/* Due date */}
        {task.due_date ? (
          <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            <Calendar className="w-3 h-3" />
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span />
        )}

        {/* Assignee avatar */}
        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center"
            title={task.assignee.full_name}
          >
            <span className="text-white text-xs font-medium">
              {task.assignee.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
        )}
      </div>

      {/* Estimated hours */}
      {task.estimated_hours && (
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-300">{task.estimated_hours}h estimadas</span>
        </div>
      )}
    </div>
  )
}