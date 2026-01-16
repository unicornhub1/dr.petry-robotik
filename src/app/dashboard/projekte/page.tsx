'use client'

import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

const projects = [
  {
    id: 1,
    name: 'Sportplatz Musterstadt',
    location: 'Musterstadt, Bayern',
    status: 'active',
    progress: 75,
    measurements: 156,
    lastUpdate: 'Vor 2 Stunden',
    dueDate: '15. Feb 2025',
  },
  {
    id: 2,
    name: 'Industriehalle Nord',
    location: 'München, Bayern',
    status: 'completed',
    progress: 100,
    measurements: 89,
    lastUpdate: 'Gestern',
    dueDate: '10. Jan 2025',
  },
  {
    id: 3,
    name: 'Parkhaus Zentrum',
    location: 'Augsburg, Bayern',
    status: 'active',
    progress: 45,
    measurements: 67,
    lastUpdate: 'Vor 5 Stunden',
    dueDate: '20. Feb 2025',
  },
  {
    id: 4,
    name: 'Bürokomplex Süd',
    location: 'Nürnberg, Bayern',
    status: 'pending',
    progress: 0,
    measurements: 0,
    lastUpdate: 'Geplant',
    dueDate: '01. Mär 2025',
  },
  {
    id: 5,
    name: 'Tennisanlage West',
    location: 'Regensburg, Bayern',
    status: 'active',
    progress: 30,
    measurements: 42,
    lastUpdate: 'Vor 1 Tag',
    dueDate: '28. Feb 2025',
  },
  {
    id: 6,
    name: 'Logistikzentrum Ost',
    location: 'Passau, Bayern',
    status: 'completed',
    progress: 100,
    measurements: 234,
    lastUpdate: 'Vor 3 Tagen',
    dueDate: '05. Jan 2025',
  },
]

const statusConfig = {
  active: { label: 'Aktiv', color: 'bg-emerald-500', icon: Clock },
  completed: { label: 'Abgeschlossen', color: 'bg-blue-500', icon: CheckCircle },
  pending: { label: 'Geplant', color: 'bg-amber-500', icon: AlertCircle },
}

export default function ProjektePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Projekte</h1>
          <p className="text-[var(--theme-textSecondary)]">{projects.length} Projekte insgesamt</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          }}
        >
          <Plus size={18} />
          Neues Projekt
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)]">
          <Search size={18} className="text-[var(--theme-textTertiary)]" />
          <input
            type="text"
            placeholder="Projekte suchen..."
            className="flex-1 bg-transparent text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)] outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-textSecondary)]">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project, i) => {
          const status = statusConfig[project.status as keyof typeof statusConfig]
          const StatusIcon = status.icon

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative p-[1px] rounded-2xl overflow-hidden"
              style={{ isolation: 'isolate' }}
            >
              {/* Gradient Border on Hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                }}
              />

              <div className="relative z-10 bg-[var(--theme-surface)] rounded-2xl p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span className="text-xs text-[var(--theme-textSecondary)]">{status.label}</span>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-[var(--theme-background)] text-[var(--theme-textSecondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <h3 className="font-semibold text-[var(--theme-text)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                  {project.name}
                </h3>

                <div className="flex items-center gap-2 text-sm text-[var(--theme-textSecondary)] mb-4">
                  <MapPin size={14} />
                  {project.location}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--theme-textSecondary)]">Fortschritt</span>
                    <span className="text-[var(--theme-text)] font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--theme-background)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--theme-textSecondary)]">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {project.dueDate}
                  </div>
                  <span>{project.measurements} Messungen</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
