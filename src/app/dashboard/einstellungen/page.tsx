'use client'

import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Key,
  Save,
  Camera,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui'

const settingsSections = [
  {
    id: 'profile',
    icon: User,
    title: 'Profil',
    description: 'Persönliche Informationen verwalten',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Benachrichtigungen',
    description: 'E-Mail und Push-Benachrichtigungen',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Sicherheit',
    description: 'Passwort und 2FA-Einstellungen',
  },
  {
    id: 'appearance',
    icon: Palette,
    title: 'Erscheinungsbild',
    description: 'Theme und Anzeigeoptionen',
  },
]

export default function EinstellungenPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Einstellungen</h1>
        <p className="text-[var(--theme-textSecondary)]">Verwalten Sie Ihr Konto und Ihre Präferenzen</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h2 className="font-semibold text-[var(--theme-text)] mb-6">Profil</h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-2xl font-bold">
                MP
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--theme-background)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <button className="text-sm text-[var(--accent-primary)]">Foto ändern</button>
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">Vorname</label>
              <input
                type="text"
                defaultValue="Max"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">Nachname</label>
              <input
                type="text"
                defaultValue="Petry"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">E-Mail</label>
              <input
                type="email"
                defaultValue="admin@dr-petry.de"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">Firma</label>
              <input
                type="text"
                defaultValue="IB Dr. Petry"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h2 className="font-semibold text-[var(--theme-text)] mb-6">Benachrichtigungen</h2>

        <div className="space-y-4">
          {[
            { icon: Mail, label: 'E-Mail Benachrichtigungen', desc: 'Erhalten Sie Updates per E-Mail', checked: true },
            { icon: Smartphone, label: 'Push-Benachrichtigungen', desc: 'Benachrichtigungen auf Ihrem Gerät', checked: true },
            { icon: Bell, label: 'Messung abgeschlossen', desc: 'Benachrichtigung wenn eine Messung fertig ist', checked: true },
            { icon: Bell, label: 'Roboter-Status', desc: 'Benachrichtigung bei Statusänderungen', checked: false },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-background)]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-textSecondary)]">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--theme-text)]">{item.label}</p>
                  <p className="text-xs text-[var(--theme-textSecondary)]">{item.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                <div className="w-11 h-6 bg-[var(--theme-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h2 className="font-semibold text-[var(--theme-text)] mb-6">Erscheinungsbild</h2>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-background)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-textSecondary)]">
              <Palette size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--theme-text)]">Theme</p>
              <p className="text-xs text-[var(--theme-textSecondary)]">Wechseln zwischen Hell und Dunkel</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h2 className="font-semibold text-[var(--theme-text)] mb-6">Sicherheit</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-background)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-textSecondary)]">
                <Key size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--theme-text)]">Passwort ändern</p>
                <p className="text-xs text-[var(--theme-textSecondary)]">Zuletzt geändert vor 30 Tagen</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-sm text-[var(--theme-text)]">
              Ändern
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-background)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-textSecondary)]">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--theme-text)]">Zwei-Faktor-Authentifizierung</p>
                <p className="text-xs text-[var(--theme-textSecondary)]">Zusätzliche Sicherheitsebene</p>
              </div>
            </div>
            <button
              className="px-4 py-2 rounded-lg text-white text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              }}
            >
              Aktivieren
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          }}
        >
          <Save size={18} />
          Änderungen speichern
        </button>
      </motion.div>
    </div>
  )
}
