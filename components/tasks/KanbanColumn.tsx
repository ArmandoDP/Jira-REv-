'use client'

import { Task, TaskStatus } from '@/types'
import TaskCard from './TaskCard'
import { Plus } from 'lucide-react'

const COLUMN_COLORS: Record<TaskStatus, string> = {
  backlog:     'bg-gray-100 text-gray-500',
  todo:        'bg-blue-50 text-blue-600',
  in_progress: 'bg-amber-50 text-amber-600',
  in_review:   'bg-purple-50 text-purple-600',
  done:        'bg-green-50 text-green-600',
  cancelled:   'bg-red-50 text-red-500',
}

const STATUSES: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done']

interface Props {
  column: { id: TaskStatus; label: string }
  tasks: Task[]
  members: any[]
  userRole: string
  onAddTask: () => void
  onMoveTask: (taskId: string, status: TaskStatus) => void
  onDeleteTask: (taskId: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  projectSlug: string
}

export default function KanbanColumn({
  column, tasks, members, userRole,
  onAddTask, onMoveTask, onDeleteTask, onUpdateTask, projectSlug
}: Props) {
  return (
    <div className="flex flex-col w-70 shrink-0" style={{ width: '272px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${COLUMN_COLORS[column.id]}`}>
            {column.label}
          </span>
          <span className="text-xs text-gray-400 font-medium">{tasks.length}</span>
        </div>
        {userRole !== 'viewer' && (
          <button
            onClick={onAddTask}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pb-4">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            statuses={STATUSES}
            userRole={userRole}
            onMove={onMoveTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
            projectSlug={projectSlug}
          />
        ))}

        {tasks.length === 0 && (
          <div
            className="border-2 border-dashed border-gray-100 rounded-xl p-4 text-center cursor-pointer hover:border-gray-200 transition-colors"
            onClick={userRole !== 'viewer' ? onAddTask : undefined}
          >
            <p className="text-xs text-gray-300">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  )
}