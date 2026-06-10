import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotificationsClient from '../notifications/NotificationsClient'

export const revalidate = 0

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, task:tasks(id, title, status, project_id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Notificaciones</h1>
        <p className="text-sm text-gray-500 mt-1">
          {notifications?.filter(n => !n.is_read).length ?? 0} sin leer
        </p>
      </div>
      <NotificationsClient
        initialNotifications={notifications ?? []}
        userId={user.id}
      />
    </div>
  )
}