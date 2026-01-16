'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  FolderOpen,
  Clock,
  CheckCircle,
  Bot,
  MapPin,
  Battery,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Play,
  Calendar,
  FileText,
} from 'lucide-react'

// Stats Data
const stats = [
  {
    label: 'Aktive Projekte',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: FolderOpen,
  },
  {
    label: 'Messungen gesamt',
    value: '1,847',
    change: '+156',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    label: 'Messstunden',
    value: '342h',
    change: '+28h',
    trend: 'up',
    icon: Clock,
  },
  {
    label: 'Abgeschlossen',
    value: '98.2%',
    change: '+1.2%',
    trend: 'up',
    icon: CheckCircle,
  },
]

// Recent Projects
const recentProjects = [
  {
    id: 1,
    name: 'Sportplatz Musterstadt',
    status: 'active',
    progress: 75,
    lastMeasurement: 'Vor 2 Stunden',
    measurements: 156,
  },
  {
    id: 2,
    name: 'Industriehalle Nord',
    status: 'completed',
    progress: 100,
    lastMeasurement: 'Gestern',
    measurements: 89,
  },
  {
    id: 3,
    name: 'Parkhaus Zentrum',
    status: 'active',
    progress: 45,
    lastMeasurement: 'Vor 5 Stunden',
    measurements: 67,
  },
  {
    id: 4,
    name: 'Bürokomplex Süd',
    status: 'pending',
    progress: 0,
    lastMeasurement: 'Geplant',
    measurements: 0,
  },
]

// Chart data (simplified visual)
const chartData = [65, 78, 82, 90, 85, 75, 88, 92, 80, 70, 85, 95, 88, 82, 79, 86, 91, 84, 77, 89, 93, 87, 81, 76]

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative p-[1px] rounded-2xl overflow-hidden group"
      style={{ isolation: 'isolate' }}
    >
      {/* Gradient Border */}
      <div
        className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
        }}
      />

      <div className="relative z-10 bg-[var(--theme-surface)] rounded-2xl p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            }}
          >
            <stat.icon size={24} className="text-white" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {stat.change}
          </div>
        </div>

        <div
          className="text-3xl font-bold mb-1"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {stat.value}
        </div>
        <div className="text-sm text-[var(--theme-textSecondary)]">{stat.label}</div>
      </div>
    </motion.div>
  )
}

function ProjectCard({ project, index }: { project: typeof recentProjects[0]; index: number }) {
  const statusColors = {
    active: 'bg-emerald-500',
    completed: 'bg-blue-500',
    pending: 'bg-amber-500',
  }

  const statusLabels = {
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    pending: 'Geplant',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="group p-5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--accent-primary)]/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[var(--theme-text)] group-hover:text-[var(--accent-primary)] transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${statusColors[project.status as keyof typeof statusColors]}`} />
            <span className="text-xs text-[var(--theme-textSecondary)]">
              {statusLabels[project.status as keyof typeof statusLabels]}
            </span>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-[var(--theme-surface)] text-[var(--theme-textSecondary)] opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[var(--theme-textSecondary)]">Fortschritt</span>
          <span className="text-[var(--theme-text)] font-medium">{project.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--theme-surface)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--theme-textSecondary)]">
        <span>{project.measurements} Messpunkte</span>
        <span>{project.lastMeasurement}</span>
      </div>
    </motion.div>
  )
}

function RobotStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative p-[1px] rounded-2xl overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      {/* Animated Border */}
      <div
        className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-100"
        style={{
          background: `conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            transparent 320deg,
            var(--accent-primary) 340deg,
            transparent 360deg
          )`,
        }}
      />

      <div className="relative z-10 bg-[var(--theme-surface)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[var(--theme-text)]">Roboter Status</h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Online
          </div>
        </div>

        {/* Robot Image */}
        <div className="relative mb-6 rounded-xl overflow-hidden">
          <img
            src="/Bilder/iloveimg-compressed/unnamed.jpg"
            alt="Messroboter MR-1"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-semibold">MR-1</p>
            <p className="text-white/70 text-sm">Sportplatz Musterstadt</p>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <div className="flex items-center gap-2 text-[var(--theme-textSecondary)] mb-2">
              <Battery size={16} />
              <span className="text-xs">Akku</span>
            </div>
            <div className="text-xl font-bold text-[var(--theme-text)]">87%</div>
            <div className="h-1.5 rounded-full bg-[var(--theme-surface)] mt-2 overflow-hidden">
              <div className="h-full w-[87%] rounded-full bg-emerald-500" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <div className="flex items-center gap-2 text-[var(--theme-textSecondary)] mb-2">
              <Wifi size={16} />
              <span className="text-xs">Signal</span>
            </div>
            <div className="text-xl font-bold text-[var(--theme-text)]">5G</div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 rounded-sm ${i <= 4 ? 'bg-emerald-500' : 'bg-[var(--theme-border)]'}`}
                  style={{ height: `${i * 4 + 4}px` }}
                />
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <div className="flex items-center gap-2 text-[var(--theme-textSecondary)] mb-2">
              <MapPin size={16} />
              <span className="text-xs">Position</span>
            </div>
            <div className="text-sm font-medium text-[var(--theme-text)]">48.1351, 11.5820</div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <div className="flex items-center gap-2 text-[var(--theme-textSecondary)] mb-2">
              <Clock size={16} />
              <span className="text-xs">Laufzeit</span>
            </div>
            <div className="text-xl font-bold text-[var(--theme-text)]">4.5h</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            }}
          >
            <Play size={18} />
            Messung starten
          </button>
          <button className="px-4 py-3 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--accent-primary)]/30 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function ChartCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-[var(--theme-text)]">Messaktivität</h3>
          <p className="text-sm text-[var(--theme-textSecondary)]">Letzte 24 Stunden</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg text-sm bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-textSecondary)]">
            Tag
          </button>
          <button className="px-3 py-1.5 rounded-lg text-sm text-[var(--theme-textSecondary)] hover:bg-[var(--theme-background)]">
            Woche
          </button>
          <button className="px-3 py-1.5 rounded-lg text-sm text-[var(--theme-textSecondary)] hover:bg-[var(--theme-background)]">
            Monat
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1 h-48">
        {chartData.map((height, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              background: i === chartData.length - 1
                ? 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))'
                : 'var(--theme-border)',
            }}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: 0.5 + i * 0.02, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4 text-xs text-[var(--theme-textTertiary)]">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </motion.div>
  )
}

function QuickActions() {
  const actions = [
    { icon: Play, label: 'Neue Messung', color: 'primary' },
    { icon: FolderOpen, label: 'Neues Projekt', color: 'secondary' },
    { icon: FileText, label: 'Report erstellen', color: 'secondary' },
    { icon: Calendar, label: 'Termin planen', color: 'secondary' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
    >
      <h3 className="font-semibold text-[var(--theme-text)] mb-4">Schnellaktionen</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <button
            key={action.label}
            className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
              action.color === 'primary'
                ? 'text-white'
                : 'bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--accent-primary)]/30'
            }`}
            style={action.color === 'primary' ? {
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            } : undefined}
          >
            <action.icon size={20} />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Dashboard</h1>
        <p className="text-[var(--theme-textSecondary)]">Willkommen zurück, Max</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Projects & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--theme-text)]">Aktuelle Projekte</h3>
              <button className="text-sm text-[var(--accent-primary)] hover:underline">
                Alle anzeigen
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          </div>

          {/* Chart */}
          <ChartCard />
        </div>

        {/* Right Column - Robot & Quick Actions */}
        <div className="space-y-6">
          <RobotStatusCard />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
