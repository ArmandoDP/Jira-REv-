export type UserRole = 'admin' | 'member'
export type ProjectMemberRole = 'admin' | 'dev' | 'viewer'
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type NotificationType = 'task_assigned' | 'task_updated' | 'task_commented' | 'task_due_soon' | 'project_invite'

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  status: ProjectStatus
  created_by: string
  created_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: ProjectMemberRole
  joined_at: string
  profile?: Profile
}

export interface Milestone {
  id: string
  project_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  project_id: string
  milestone_id: string | null
  assigned_to: string | null
  created_by: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  start_date: string | null
  due_date: string | null
  estimated_hours: number | null
  created_at: string
  updated_at: string
  assignee?: Profile
  milestone?: Milestone
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  task_id: string | null
  type: NotificationType
  message: string
  is_read: boolean
  email_sent: boolean
  created_at: string
  task?: Task
}