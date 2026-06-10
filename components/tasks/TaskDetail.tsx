'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Task, TaskComment, TaskStatus, TaskPriority, Milestone } from '@/types'
import {
  formatDate, timeAgo,
  STATUS_LABELS, STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS,
} from '@/lib/utils'
import {
  Calendar, Clock, User, Flag, GitBranch,
  Pencil, Check, X, Send, Trash2,
} from 'lucide-react'

interface Props {
  task: Task
  comments: TaskComment[]
  members: any[]
  milestones: Milestone[]
  currentUserId: string
  userRole: string
  projectSlug: string
}

export default function TaskDetail({
  task: initialTask, comments: initialComments,
  members, milestones, currentUserId, userRole, projectSlug,
}: Props) {
  const [task, setTask] = useState(initialTask)
  const [comments, setComments] = useState(initialComments)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [newComment, setNewComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const canEdit = userRole !== 'viewer' &&
    (task.assigned_to === currentUserId || task.created_by === currentUserId || userRole === 'admin')

  async function saveTitle() {
    if (!title.trim()) return
    const { data } = await supabase
      .from('tasks')
      .update({ title: title.trim(), description: description.trim() || null })
      .eq('id', task.id)
      .select()
      .single()
    if (data) setTask({ ...task, ...data })
    setEditing(false)
  }

  async function updateField(field: string, value: any) {
    const { data } = await supabase
      .from('tasks')
      .update({ [field]: value })
      .eq('id', task.id)
      .select()
      .single()
    if (data) setTask({ ...task, ...data })
  }

  async function addComment() {
    if (!newComment.trim()) return
    setSavingComment(true)
    const { data } = await supabase
      .from('task_comments')
      .insert({ task_id: task.id, user_id: currentUserId, content: newComment.trim() })
      .select('*, profile:profiles!task_comments_user_id_fkey(id, full_name, avatar_url)')
      .single()
    if (data) {
      setComments(prev => [...prev, data])
      setNewComment('')
    }
    setSavingComment(false)
  }

  async function deleteComment(commentId: string) {
    await supabase.from('task_comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  async function deleteTask() {
    if (!confirm('¿Eliminar esta tarea?')) return
    await supabase.from('tasks').delete().eq('id', task.id)
    router.push(`/projects/${projectSlug}`)
  }

  const selectClass = "h-8 rounded-lg border border-gray-200 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Main */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Título */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          {editing ? (
            <div className="flex flex-col gap-3">
              <input
                autoFocus
                className="w-full text-lg font-semibold text-gray-900 border-b border-gray-200 pb-1 focus:outline-none focus:border-gray-900"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <textarea
                className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                rows={4}
                placeholder="Descripción..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={saveTitle}
                  className="inline-flex items-center gap-1.5 text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar
                </button>
                <button
                  onClick={() => { setEditing(false); setTitle(task.title); setDescription(task.description ?? '') }}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-lg font-semibold text-gray-900 leading-snug">{task.title}</h1>
                {canEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
              {task.description ? (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              ) : canEdit ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-gray-300 mt-3 hover:text-gray-500 transition-colors"
                >
                  + Agregar descripción
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Comentarios */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Comentarios {comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
          </h2>

          <div className="flex flex-col gap-4 mb-4">
            {comments.length === 0 && (
              <p className="text-sm text-gray-300 text-center py-4">Sin comentarios aún</p>
            )}
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3 group">
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-medium">
                    {initials(comment.profile?.full_name ?? '??')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">{comment.profile?.full_name}</span>
                    <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                </div>
                {comment.user_id === currentUserId && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {userRole !== 'viewer' && (
            <div className="flex gap-2 pt-3 border-t border-gray-50">
              <input
                className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && addComment()}
              />
              <button
                onClick={addComment}
                disabled={savingComment || !newComment.trim()}
                className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar de propiedades */}
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Propiedades</h2>

          <div className="flex flex-col gap-4">

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <GitBranch className="w-3.5 h-3.5" /> Estado
              </label>
              {canEdit ? (
                <select
                  className={selectClass + ' w-full'}
                  value={task.status}
                  onChange={e => updateField('status', e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              ) : (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[task.status]}`}>
                  {STATUS_LABELS[task.status]}
                </span>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Flag className="w-3.5 h-3.5" /> Prioridad
              </label>
              {canEdit ? (
                <select
                  className={selectClass + ' w-full'}
                  value={task.priority}
                  onChange={e => updateField('priority', e.target.value)}
                >
                  {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              ) : (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              )}
            </div>

            {/* Asignado */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <User className="w-3.5 h-3.5" /> Asignado a
              </label>
              {canEdit ? (
                <select
                  className={selectClass + ' w-full'}
                  value={task.assigned_to ?? ''}
                  onChange={e => updateField('assigned_to', e.target.value || null)}
                >
                  <option value="">Sin asignar</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profile?.full_name}
                    </option>
                  ))}
                </select>
              ) : task.assignee ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs">{initials(task.assignee.full_name)}</span>
                  </div>
                  <span className="text-sm text-gray-700">{task.assignee.full_name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Sin asignar</span>
              )}
            </div>

            {/* Fecha límite */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fecha límite
              </label>
              {canEdit ? (
                <input
                  type="date"
                  className={selectClass + ' w-full'}
                  value={task.due_date ?? ''}
                  onChange={e => updateField('due_date', e.target.value || null)}
                />
              ) : task.due_date ? (
                <span className="text-sm text-gray-700">{formatDate(task.due_date)}</span>
              ) : (
                <span className="text-sm text-gray-400">Sin fecha</span>
              )}
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fecha inicio
              </label>
              {canEdit ? (
                <input
                  type="date"
                  className={selectClass + ' w-full'}
                  value={task.start_date ?? ''}
                  onChange={e => updateField('start_date', e.target.value || null)}
                />
              ) : task.start_date ? (
                <span className="text-sm text-gray-700">{formatDate(task.start_date)}</span>
              ) : (
                <span className="text-sm text-gray-400">Sin fecha</span>
              )}
            </div>

            {/* Horas estimadas */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Clock className="w-3.5 h-3.5" /> Horas estimadas
              </label>
              {canEdit ? (
                <input
                  type="number"
                  min="1"
                  className={selectClass + ' w-full'}
                  value={task.estimated_hours ?? ''}
                  onChange={e => updateField('estimated_hours', e.target.value ? parseInt(e.target.value) : null)}
                />
              ) : task.estimated_hours ? (
                <span className="text-sm text-gray-700">{task.estimated_hours}h</span>
              ) : (
                <span className="text-sm text-gray-400">No estimado</span>
              )}
            </div>

            {/* Milestone */}
            {milestones.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                  <Flag className="w-3.5 h-3.5" /> Milestone
                </label>
                {canEdit ? (
                  <select
                    className={selectClass + ' w-full'}
                    value={task.milestone_id ?? ''}
                    onChange={e => updateField('milestone_id', e.target.value || null)}
                  >
                    <option value="">Sin milestone</option>
                    {milestones.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                ) : task.milestone ? (
                  <span className="text-sm text-gray-700">{task.milestone.name}</span>
                ) : (
                  <span className="text-sm text-gray-400">Sin milestone</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Info</h2>
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            <p>Creada {timeAgo(task.created_at)}</p>
            <p>Actualizada {timeAgo(task.updated_at)}</p>
          </div>
        </div>

        {/* Danger zone */}
        {(userRole === 'admin' || task.created_by === currentUserId) && (
          <button
            onClick={deleteTask}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-100 text-red-500 text-sm hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar tarea
          </button>
        )}
      </div>
    </div>
  )
}