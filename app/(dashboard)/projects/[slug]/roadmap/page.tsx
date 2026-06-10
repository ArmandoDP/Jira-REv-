import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RoadmapClient from './RoadmapClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) notFound()

  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', project.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/projects')

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', project.id)
    .order('start_date', { ascending: true })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', project.id)
    .not('start_date', 'is', null)
    .not('due_date', 'is', null)
    .order('start_date', { ascending: true })

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tablero
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: project.color + '20' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
            </div>
            <h1 className="font-semibold text-gray-900 text-sm">{project.name} — Roadmap</h1>
          </div>
        </div>
      </div>

      {/* Gantt */}
      <RoadmapClient
        project={project}
        initialMilestones={milestones ?? []}
        initialTasks={tasks ?? []}
        userRole={membership.role}
      />
    </div>
  )
}