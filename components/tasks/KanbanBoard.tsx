'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Task, TaskStatus } from '@/types'
import KanbanColumn from './KanbanColumn'
import TaskForm from './TaskForm'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog',     label: 'Backlog' },
  { id: 'todo',        label: 'Por hacer' },
  { id: 'in_progress', label: 'En progreso' },
  { id: 'in_review',   label: 'En revisión' },
  { id: 'done',        label: 'Completado' },
]

interface Props {
  project: Project
  initialTasks: Task[]
  members: any[]
  currentUserId: string
  userRole: string
}

export default function KanbanBoard({ project, initialTasks, members, currentUserId, userRole }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo')
  const supabase = createClient()

  function openForm(status: TaskStatus) {
    setFormStatus(status)
    setShowForm(true)
  }

  async function handleCreateTask(data: Partial<Task>) {
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert({
        ...data,
        project_id: project.id,
        created_by: currentUserId,
        status: formStatus,
      })
      .select('*, assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url)')
      .single()

    if (!error && newTask) {
      setTasks(prev => [newTask, ...prev])
      setShowForm(false)
    }
  }

  async function handleMoveTask(taskId: string, newStatus: TaskStatus) {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    )
    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
  }

  async function handleDeleteTask(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  async function handleUpdateTask(taskId: string, updates: Partial<Task>) {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, ...updates } : t)
    )
    await supabase.from('tasks').update(updates).eq('id', taskId)
  }

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex gap-4 h-full" style={{ minWidth: `${COLUMNS.length * 280}px` }}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter(t => t.status === col.id)}
            members={members}
            userRole={userRole}
            onAddTask={() => openForm(col.id)}
            onMoveTask={handleMoveTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            projectSlug={project.slug}
          />
        ))}
      </div>

      {/* Modal crear tarea */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <TaskForm
              members={members}
              defaultStatus={formStatus}
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}