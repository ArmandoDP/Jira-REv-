import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TaskDetail from '@/components/tasks/TaskDetail'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0

interface Props {
  params: Promise<{ slug: string; taskId: string }>
}

export default async function TaskPage({ params }: Props) {
  const { slug, taskId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url), milestone:milestones(*)')
    .eq('id', taskId)
    .single()

  if (!task) notFound()

  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', task.project_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/projects')

  const { data: comments } = await supabase
    .from('task_comments')
    .select('*, profile:profiles!task_comments_user_id_fkey(id, full_name, avatar_url)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  const { data: members } = await supabase
    .from('project_members')
    .select('*, profile:profiles!project_members_user_id_fkey(id, full_name, email, avatar_url)')
    .eq('project_id', task.project_id)

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', task.project_id)

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/projects/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al tablero
      </Link>

      <TaskDetail
        task={task}
        comments={comments ?? []}
        members={members ?? []}
        milestones={milestones ?? []}
        currentUserId={user.id}
        userRole={membership.role}
        projectSlug={slug}
      />
    </div>
  )
}