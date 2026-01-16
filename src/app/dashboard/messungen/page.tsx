'use client'

import { motion } from 'framer-motion'
import {
  Download,
  Filter,
  Search,
  FileText,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react'

const measurements = [
  {
    id: 'M-2025-001',
    project: 'Sportplatz Musterstadt',
    date: '15. Jan 2025, 14:30',
    points: 156,
    duration: '2.5h',
    status: 'completed',
    avgLux: 342,
  },
  {
    id: 'M-2025-002',
    project: 'Industriehalle Nord',
    date: '14. Jan 2025, 09:15',
    points: 89,
    duration: '1.5h',
    status: 'completed',
    avgLux: 520,
  },
  {
    id: 'M-2025-003',
    project: 'Parkhaus Zentrum',
    date: '13. Jan 2025, 16:00',
    points: 67,
    duration: '1.2h',
    status: 'completed',
    avgLux: 180,
  },
  {
    id: 'M-2025-004',
    project: 'Sportplatz Musterstadt',
    date: '12. Jan 2025, 11:00',
    points: 142,
    duration: '2.3h',
    status: 'completed',
    avgLux: 338,
  },
  {
    id: 'M-2025-005',
    project: 'Tennisanlage West',
    date: '11. Jan 2025, 15:45',
    points: 42,
    duration: '0.8h',
    status: 'in_progress',
    avgLux: 425,
  },
]

// Chart data
const chartData = [
  { label: 'Mo', value: 12 },
  { label: 'Di', value: 18 },
  { label: 'Mi', value: 15 },
  { label: 'Do', value: 22 },
  { label: 'Fr', value: 28 },
  { label: 'Sa', value: 8 },
  { label: 'So', value: 5 },
]

const maxValue = Math.max(...chartData.map(d => d.value))

export default function MessungenPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Messungen</h1>
          <p className="text-[var(--theme-textSecondary)]">Alle Messungen im Überblick</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Diese Woche', value: '108', sub: 'Messungen' },
          { label: 'Durchschnitt', value: '356', sub: 'Lux' },
          { label: 'Gesamtdauer', value: '24.5h', sub: 'Messzeit' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
          >
            <p className="text-sm text-[var(--theme-textSecondary)] mb-1">{stat.label}</p>
            <p
              className="text-3xl font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-[var(--theme-textTertiary)]">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h3 className="font-semibold text-[var(--theme-text)] mb-6">Messungen diese Woche</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {chartData.map((day, i) => (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full rounded-t-lg"
                style={{
                  background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))',
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.value / maxValue) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
              />
              <span className="text-xs text-[var(--theme-textSecondary)]">{day.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)]">
          <Search size={18} className="text-[var(--theme-textTertiary)]" />
          <input
            type="text"
            placeholder="Messungen suchen..."
            className="flex-1 bg-transparent text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)] outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-textSecondary)]">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Measurements List */}
      <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--theme-border)]">
                <th className="text-left text-xs font-medium text-[var(--theme-textSecondary)] p-4">ID</th>
                <th className="text-left text-xs font-medium text-[var(--theme-textSecondary)] p-4">Projekt</th>
                <th className="text-left text-xs font-medium text-[var(--theme-textSecondary)] p-4">Datum</th>
                <th className="text-left text-xs font-medium text-[var(--theme-textSecondary)] p-4">Punkte</th>
                <th className="text-left text-xs font-medium text-[var(--theme-textSecondary)] p-4">Dauer</th>
                <th className="text-left text-xs font-medium text-[var(--theme-textSecondary)] p-4">Avg. Lux</th>
                <th className="text-left text-xs font-medium text-[var(--theme-textSecondary)] p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="border-b border-[var(--theme-border)] last:border-0 hover:bg-[var(--theme-background)] transition-colors"
                >
                  <td className="p-4 text-sm font-mono text-[var(--accent-primary)]">{m.id}</td>
                  <td className="p-4 text-sm text-[var(--theme-text)] font-medium">{m.project}</td>
                  <td className="p-4 text-sm text-[var(--theme-textSecondary)]">{m.date}</td>
                  <td className="p-4 text-sm text-[var(--theme-text)]">{m.points}</td>
                  <td className="p-4 text-sm text-[var(--theme-textSecondary)]">{m.duration}</td>
                  <td className="p-4 text-sm text-[var(--theme-text)]">{m.avgLux}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {m.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {m.status === 'completed' ? 'Abgeschlossen' : 'Läuft'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="p-2 rounded-lg hover:bg-[var(--theme-surface)] text-[var(--theme-textSecondary)]">
                      <FileText size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
