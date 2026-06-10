'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'
import { timeAgo, STATUS_LABELS } from '@/lib/utils'
import { Bell, CheckCheck } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  task_assigned:  'Tarea asignada',
  task_updated:   'Tarea actualizada',
  task_commented: 'Nuevo comentario',
  task_due_soon:  'Vence pronto',
  project_invite: 'Invitación a proyecto',
}

const TYPE_ICONS: Record<string, string> = {
  task_assigned:  '🎯',
  task_updated:   '🔄',
  task_commented: '💬',
  task_due_soon:  '⏰',
  project_invite: '📩',
}

interface Props {
  initialNotifications: Notification[]
  userId: string
}

export default function NotificationsClient({ initialNotifications, userId }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const supabase = createClient()
  const router = useRouter()

  const unread = notifications.filter(n => !n.is_read)

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function handleClick(n: Notification) {
    await markRead(n.id)
    if (n.task_id) {
      const { data: task } = await supabase
        .from('tasks')
        .select('project_id, projects(slug)')
        .eq('id', n.task_id)
        .single()
      if (task?.projects) {
        router.push(`/projects/${(task.projects as any).slug}/tasks/${n.task_id}`)
      }
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Bell className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Sin notificaciones</h3>
        <p className="text-sm text-gray-400">Aquí aparecerán tus notificaciones</p>
      </div>
    )
  }

  return (
    <div>
      {/* Acciones */}
      {unread.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        </div>
      )}

      {/* Lista agrupada por fecha */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {notifications.map((n, i) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50
              ${i !== 0 ? 'border-t border-gray-50' : ''}
              ${!n.is_read ? 'bg-blue-50/40' : ''}
            `}
          >
            {/* Icono */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5 ${!n.is_read ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {TYPE_ICONS[n.type] ?? '🔔'}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-medium ${!n.is_read ? 'text-blue-600' : 'text-gray-400'}`}>
                  {TYPE_LABELS[n.type]}
                </span>
                {!n.is_read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </div>
              <p className={`text-sm leading-snug ${!n.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {n.message}
              </p>
              {(n as any).task && (
                <p className="text-xs text-gray-400 mt-1">
                  Estado: {STATUS_LABELS[(n as any).task.status] ?? (n as any).task.status}
                </p>
              )}
            </div>

            {/* Tiempo */}
            <span className="text-xs text-gray-400 shrink-0 mt-1">{timeAgo(n.created_at)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}