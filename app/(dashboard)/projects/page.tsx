import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProjectCard from '@/components/projects/ProjectCard'
import { Plus } from 'lucide-react'

export const revalidate = 0

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer proyectos donde el usuario es miembro
  const { data: memberships } = await supabase
    .from('project_members')
    .select('project_id, role')
    .eq('user_id', user.id)

  const projectIds = memberships?.map(m => m.project_id) ?? []

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds.length > 0 ? projectIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })

  // Contar tareas por proyecto
  const { data: taskCounts } = await supabase
    .from('tasks')
    .select('project_id')
    .in('project_id', projectIds.length > 0 ? projectIds : ['00000000-0000-0000-0000-000000000000'])

  // Contar miembros por proyecto
  const { data: memberCounts } = await supabase
    .from('project_members')
    .select('project_id')
    .in('project_id', projectIds.length > 0 ? projectIds : ['00000000-0000-0000-0000-000000000000'])

  const taskCountMap = (taskCounts ?? []).reduce((acc, t) => {
    acc[t.project_id] = (acc[t.project_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const memberCountMap = (memberCounts ?? []).reduce((acc, m) => {
    acc[m.project_id] = (acc[m.project_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Proyectos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projects?.length ?? 0} proyecto{(projects?.length ?? 0) !== 1 ? 's' : ''} activos
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </Link>
      </div>

      {/* Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              taskCount={taskCountMap[project.id] ?? 0}
              memberCount={memberCountMap[project.id] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Sin proyectos aún</h3>
          <p className="text-sm text-gray-400 mb-6">Crea tu primer proyecto para empezar</p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear proyecto
          </Link>
        </div>
      )}
    </div>
  )
}