import Link from 'next/link'
import { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowRight, Circle } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  active:    'Activo',
  paused:    'Pausado',
  completed: 'Completado',
  archived:  'Archivado',
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-green-600 bg-green-50',
  paused:    'text-amber-600 bg-amber-50',
  completed: 'text-blue-600 bg-blue-50',
  archived:  'text-gray-400 bg-gray-100',
}

interface ProjectCardProps {
  project: Project
  taskCount?: number
  memberCount?: number
}

export default function ProjectCard({ project, taskCount = 0, memberCount = 0 }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Color dot */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: project.color + '20' }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{project.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">/{project.slug}</p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{taskCount} tareas</span>
          <span>{memberCount} miembros</span>
          <span>Desde {formatDate(project.created_at)}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}