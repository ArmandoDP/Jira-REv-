import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import Link from 'next/link'
import { Map, Settings } from 'lucide-react'

export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer proyecto
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) notFound()

  // Verificar membresía
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', project.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/projects')

  // Traer tareas con assignee
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url)')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })

  // Traer miembros del proyecto para asignar tareas
  const { data: members } = await supabase
    .from('project_members')
    .select('*, profile:profiles!project_members_user_id_fkey(id, full_name, email, avatar_url)')
    .eq('project_id', project.id)

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header del proyecto */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color + '20' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">{project.name}</h1>
            <p className="text-xs text-gray-400">{tasks?.length ?? 0} tareas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${slug}/roadmap`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Map className="w-4 h-4" />
            Roadmap
          </Link>
          {membership.role === 'admin' && (
            <Link
              href={`/projects/${slug}/settings`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Ajustes
            </Link>
          )}
        </div>
      </div>

      {/* Kanban */}
      <KanbanBoard
        project={project}
        initialTasks={tasks ?? []}
        members={members ?? []}
        currentUserId={user.id}
        userRole={membership.role}
      />
    </div>
  )
}