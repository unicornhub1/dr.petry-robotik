'use client'

import { motion } from 'framer-motion'
import {
  Bot,
  Battery,
  Wifi,
  MapPin,
  Clock,
  Thermometer,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Activity,
} from 'lucide-react'

const robotStats = [
  { icon: Battery, label: 'Akku', value: '87%', status: 'good' },
  { icon: Wifi, label: 'Signal', value: '5G', status: 'good' },
  { icon: Thermometer, label: 'Temperatur', value: '24°C', status: 'good' },
  { icon: Gauge, label: 'Geschwindigkeit', value: '0.5 m/s', status: 'normal' },
]

const recentActivity = [
  { time: '14:32', action: 'Messpunkt 156 erfasst', type: 'measurement' },
  { time: '14:30', action: 'Position aktualisiert', type: 'position' },
  { time: '14:28', action: 'Messpunkt 155 erfasst', type: 'measurement' },
  { time: '14:25', action: 'Hindernis erkannt & umfahren', type: 'navigation' },
  { time: '14:22', action: 'Messpunkt 154 erfasst', type: 'measurement' },
  { time: '14:20', action: 'Messung gestartet', type: 'system' },
]

export default function RoboterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Roboter</h1>
          <p className="text-[var(--theme-textSecondary)]">MR-1 Steuerung & Status</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium">Online & Aktiv</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Robot Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative p-[1px] rounded-2xl overflow-hidden"
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Robot Image */}
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src="/Bilder/iloveimg-compressed/unnamed.jpg"
                  alt="Messroboter MR-1"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-xl font-bold">MR-1</p>
                  <p className="text-white/70 text-sm">Messroboter</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {robotStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="p-4 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]"
                  >
                    <div className="flex items-center gap-2 text-[var(--theme-textSecondary)] mb-2">
                      <stat.icon size={16} />
                      <span className="text-xs">{stat.label}</span>
                    </div>
                    <div className="text-xl font-bold text-[var(--theme-text)]">{stat.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-[var(--theme-border)]">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                }}
              >
                <Pause size={18} />
                Pausieren
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)]">
                <RotateCcw size={18} />
                Zurück zur Basis
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)]">
                <Settings size={18} />
                Einstellungen
              </button>
            </div>
          </div>
        </motion.div>

        {/* Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-[var(--accent-primary)]" />
            <h3 className="font-semibold text-[var(--theme-text)]">Live-Aktivität</h3>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="text-xs text-[var(--theme-textTertiary)] w-12 shrink-0">{activity.time}</span>
                <div className="flex-1">
                  <p className="text-sm text-[var(--theme-text)]">{activity.action}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[var(--accent-primary)]" />
            <h3 className="font-semibold text-[var(--theme-text)]">Live-Position</h3>
          </div>
          <span className="text-sm text-[var(--theme-textSecondary)]">48.1351, 11.5820</span>
        </div>
        <div className="h-64 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="mx-auto mb-2 text-[var(--theme-textTertiary)]" />
            <p className="text-[var(--theme-textSecondary)]">Karte wird geladen...</p>
            <p className="text-xs text-[var(--theme-textTertiary)]">Sportplatz Musterstadt</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
