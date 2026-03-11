'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Plus, Trash2, Save } from 'lucide-react'
import { Table, Modal, Input, EmptyState, Badge, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { ScheduleTemplate, ScheduleOverride } from '@/lib/supabase/types'

const DAY_LABELS = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
]

interface WeekDay {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

const emptyOverrideForm = {
  date_start: '',
  date_end: '',
  start_time: '',
  end_time: '',
  is_blocked: true,
  label: '',
}

export default function AdminSchedulePage() {
  const { success, error: toastError } = useToast()
  const [weekDays, setWeekDays] = useState<WeekDay[]>([])
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [overrideForm, setOverrideForm] = useState(emptyOverrideForm)
  const [overrideSaving, setOverrideSaving] = useState(false)

  const fetchData = async () => {
    try {
      const supabase = createClient()

      const { data: templates } = await supabase
        .from('schedule_templates')
        .select('*')
        .order('day_of_week', { ascending: true })

      // Build week days, filling in defaults for missing days
      const days: WeekDay[] = []
      for (let d = 0; d < 7; d++) {
        const existing = (templates ?? []).find((t) => t.day_of_week === d)
        if (existing) {
          days.push({
            id: existing.id,
            day_of_week: existing.day_of_week,
            start_time: existing.start_time,
            end_time: existing.end_time,
            is_active: existing.is_active,
          })
        } else {
          days.push({
            day_of_week: d,
            start_time: '08:00',
            end_time: '17:00',
            is_active: false,
          })
        }
      }
      setWeekDays(days)

      const { data: overridesData } = await supabase
        .from('schedule_overrides')
        .select('*')
        .order('date_start', { ascending: true })

      setOverrides(overridesData ?? [])
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateDay = (index: number, updates: Partial<WeekDay>) => {
    setWeekDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...updates } : d))
    )
  }

  const handleSaveWeek = async () => {
    setSaving(true)
    const supabase = createClient()

    for (const day of weekDays) {
      const payload = {
        day_of_week: day.day_of_week,
        start_time: day.start_time,
        end_time: day.end_time,
        is_active: day.is_active,
      }

      if (day.id) {
        await supabase
          .from('schedule_templates')
          .update(payload)
          .eq('id', day.id)
      } else {
        const { data } = await supabase
          .from('schedule_templates')
          .insert(payload)
          .select()
          .single()

        if (data) {
          setWeekDays((prev) =>
            prev.map((d) =>
              d.day_of_week === day.day_of_week ? { ...d, id: data.id } : d
            )
          )
        }
      }
    }

    setSaving(false)
    success('Wochenplan gespeichert')
  }

  const handleAddOverride = async () => {
    setOverrideSaving(true)
    const supabase = createClient()

    const payload = {
      date_start: overrideForm.date_start,
      date_end: overrideForm.date_end || null,
      start_time: overrideForm.start_time || null,
      end_time: overrideForm.end_time || null,
      is_blocked: overrideForm.is_blocked,
      label: overrideForm.label || null,
    }

    const { error } = await supabase
      .from('schedule_overrides')
      .insert(payload)

    if (error) {
      toastError('Fehler beim Erstellen')
    } else {
      success('Abweichung hinzugefügt')
      setOverrideModalOpen(false)
      setOverrideForm(emptyOverrideForm)
      fetchData()
    }
    setOverrideSaving(false)
  }

  const handleDeleteOverride = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('schedule_overrides')
      .delete()
      .eq('id', id)

    if (error) {
      toastError('Fehler beim Löschen')
    } else {
      success('Abweichung gelöscht')
      setOverrides((prev) => prev.filter((o) => o.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  const overrideColumns = [
    { key: 'date_start', label: 'Von' },
    { key: 'date_end', label: 'Bis' },
    { key: 'label', label: 'Bezeichnung' },
    { key: 'status', label: 'Status' },
    { key: 'times', label: 'Zeiten' },
    { key: 'actions', label: '' },
  ]

  const overrideTableData = overrides.map((o) => ({
    date_start: (
      <span className="text-[var(--theme-text)]">
        {new Date(o.date_start).toLocaleDateString('de-DE')}
      </span>
    ),
    date_end: (
      <span className="text-[var(--theme-textSecondary)]">
        {o.date_end ? new Date(o.date_end).toLocaleDateString('de-DE') : '-'}
      </span>
    ),
    label: (
      <span className="text-[var(--theme-text)]">{o.label ?? '-'}</span>
    ),
    status: (
      <Badge variant={o.is_blocked ? 'error' : 'success'} size="sm">
        {o.is_blocked ? 'Gesperrt' : 'Verfügbar'}
      </Badge>
    ),
    times: (
      <span className="text-sm text-[var(--theme-textSecondary)]">
        {o.start_time && o.end_time ? `${o.start_time} - ${o.end_time}` : 'Ganzer Tag'}
      </span>
    ),
    actions: (
      <button
        onClick={() => handleDeleteOverride(o.id)}
        className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
        title="Löschen"
      >
        <Trash2 size={14} />
      </button>
    ),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Terminplanung</h1>
        <p className="text-[var(--theme-textSecondary)]">Wochenplan und Abweichungen verwalten</p>
      </div>

      {/* Wochenplan */}
      <div className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[var(--theme-text)]">Wochenplan</h3>
          <button
            onClick={handleSaveWeek}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Speichern...' : 'Alle speichern'}
          </button>
        </div>

        <div className="space-y-3">
          {weekDays.map((day, i) => (
            <motion.div
              key={day.day_of_week}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                day.is_active
                  ? 'bg-[var(--theme-background)] border-[var(--theme-border)]'
                  : 'bg-[var(--theme-background)]/50 border-[var(--theme-border)]/50 opacity-60'
              }`}
            >
              <div className="w-28 shrink-0">
                <span className="text-sm font-medium text-[var(--theme-text)]">
                  {DAY_LABELS[day.day_of_week]}
                </span>
              </div>

              <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.is_active}
                  onChange={(e) => updateDay(i, { is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--theme-border)] accent-[var(--accent-primary)]"
                />
                <span className="text-xs text-[var(--theme-textSecondary)]">Aktiv</span>
              </label>

              <input
                type="time"
                value={day.start_time}
                onChange={(e) => updateDay(i, { start_time: e.target.value })}
                disabled={!day.is_active}
                className="px-3 py-2 rounded-lg text-sm bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none disabled:opacity-40"
              />
              <span className="text-[var(--theme-textTertiary)]">bis</span>
              <input
                type="time"
                value={day.end_time}
                onChange={(e) => updateDay(i, { end_time: e.target.value })}
                disabled={!day.is_active}
                className="px-3 py-2 rounded-lg text-sm bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none disabled:opacity-40"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Abweichungen */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--theme-text)]">Abweichungen</h3>
          <button
            onClick={() => {
              setOverrideForm(emptyOverrideForm)
              setOverrideModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Abweichung hinzufügen
          </button>
        </div>

        {overrides.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Keine Abweichungen"
            description="Feiertage oder Sondersperrungen hinzufügen."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Table columns={overrideColumns} data={overrideTableData} />
          </motion.div>
        )}
      </div>

      {/* Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Neue Abweichung"
      >
        <div className="space-y-4">
          <Input
            label="Startdatum"
            type="date"
            value={overrideForm.date_start}
            onChange={(e) => setOverrideForm({ ...overrideForm, date_start: e.target.value })}
          />
          <Input
            label="Enddatum (optional)"
            type="date"
            value={overrideForm.date_end}
            onChange={(e) => setOverrideForm({ ...overrideForm, date_end: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Startzeit (optional)"
              type="time"
              value={overrideForm.start_time}
              onChange={(e) => setOverrideForm({ ...overrideForm, start_time: e.target.value })}
            />
            <Input
              label="Endzeit (optional)"
              type="time"
              value={overrideForm.end_time}
              onChange={(e) => setOverrideForm({ ...overrideForm, end_time: e.target.value })}
            />
          </div>
          <Input
            label="Bezeichnung"
            value={overrideForm.label}
            onChange={(e) => setOverrideForm({ ...overrideForm, label: e.target.value })}
            placeholder="z.B. Weihnachtsferien"
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={overrideForm.is_blocked}
              onChange={(e) => setOverrideForm({ ...overrideForm, is_blocked: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--theme-border)] accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--theme-text)]">Gesperrt (keine Termine möglich)</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setOverrideModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleAddOverride}
              disabled={overrideSaving || !overrideForm.date_start}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {overrideSaving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
