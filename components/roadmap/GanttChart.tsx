'use client'

import { useEffect, useRef } from 'react'
import { Milestone, Task } from '@/types'

interface Props {
  milestones: Milestone[]
  tasks: Task[]
}

interface GanttTask {
  id: string
  name: string
  start: string
  end: string
  progress: number
  custom_class?: string
  dependencies?: string
}

export default function GanttChart({ milestones, tasks }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Limpiar instancia previa
    containerRef.current.innerHTML = ''

    const ganttTasks: GanttTask[] = []

    // Agregar milestones como barras principales
    milestones.forEach(m => {
      const mTasks = tasks.filter(t => t.milestone_id === m.id && t.status === 'done')
      const total = tasks.filter(t => t.milestone_id === m.id).length
      const progress = total > 0 ? Math.round((mTasks.length / total) * 100) : 0

      ganttTasks.push({
        id: `milestone-${m.id}`,
        name: `🏁 ${m.name}`,
        start: m.start_date,
        end: m.end_date,
        progress,
        custom_class: 'milestone-bar',
      })
    })

    // Agregar tareas con fechas
    tasks.forEach(t => {
      if (!t.start_date || !t.due_date) return
      const progress = t.status === 'done' ? 100
        : t.status === 'in_progress' ? 50
        : t.status === 'in_review' ? 75
        : 0

      ganttTasks.push({
        id: `task-${t.id}`,
        name: t.title,
        start: t.start_date,
        end: t.due_date,
        progress,
        dependencies: t.milestone_id ? `milestone-${t.milestone_id}` : undefined,
        custom_class: `task-${t.status}`,
      })
    })

    if (ganttTasks.length === 0) return

    // Importar frappe-gantt dinámicamente
    import('frappe-gantt').then(({ default: Gantt }) => {
      if (!containerRef.current) return
      ganttRef.current = new Gantt(containerRef.current, ganttTasks, {
        view_mode: 'Week',
        date_format: 'YYYY-MM-DD',
        language: 'es',
        popup_trigger: 'click',
        custom_popup_html: (task: any) => {
          const name = task.name.replace('🏁 ', '')
          return `
            <div style="padding:12px;min-width:180px">
              <p style="font-weight:600;font-size:13px;color:#111;margin-bottom:4px">${name}</p>
              <p style="font-size:12px;color:#888">${task.start} → ${task.end}</p>
              <div style="margin-top:8px;background:#f3f4f6;border-radius:4px;height:6px;overflow:hidden">
                <div style="height:100%;background:#111;border-radius:4px;width:${task.progress}%"></div>
              </div>
              <p style="font-size:11px;color:#aaa;margin-top:4px">${task.progress}% completado</p>
            </div>
          `
        },
      })
    })

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [milestones, tasks])

  return (
    <div className="h-full overflow-auto p-6">
      <style>{`
        .gantt .bar { fill: #1f2937; }
        .gantt .bar-progress { fill: #111827; }
        .gantt .bar-label { fill: #fff; font-size: 12px; }
        .gantt .bar-wrapper.milestone-bar .bar { fill: #7c3aed; }
        .gantt .bar-wrapper.milestone-bar .bar-progress { fill: #6d28d9; }
        .gantt .bar-wrapper.task-done .bar { fill: #16a34a; }
        .gantt .bar-wrapper.task-done .bar-progress { fill: #15803d; }
        .gantt .bar-wrapper.task-in_progress .bar { fill: #d97706; }
        .gantt .bar-wrapper.task-in_progress .bar-progress { fill: #b45309; }
        .gantt .bar-wrapper.task-in_review .bar { fill: #7c3aed; }
        .gantt .bar-wrapper.task-cancelled .bar { fill: #9ca3af; }
        .gantt .grid-header { fill: #f9fafb; }
        .gantt .grid-row { fill: transparent; }
        .gantt .grid-row:nth-child(even) { fill: #f9fafb; }
        .gantt .lower-text, .gantt .upper-text { fill: #6b7280; font-size: 11px; }
        .gantt .today-highlight { fill: #dbeafe; opacity: 0.5; }
        .gantt-container { font-family: inherit; }
        .gantt .tick { stroke: #e5e7eb; }
      `}</style>
      <div ref={containerRef} className="gantt-container" />
    </div>
  )
}
