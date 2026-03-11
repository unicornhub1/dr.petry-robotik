'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar } from '@/components/ui'
import { Plus, Minus, Clock, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ScheduleTemplate, ScheduleOverride, Booking } from '@/lib/supabase/types'

interface StepSelectDateProps {
  selectedDate: string | null
  onSelect: (date: string) => void
  facilityCount: number
  extraDays: number
  onExtraDaysChange: (days: number) => void
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

function getBaseDuration(facilityCount: number): number {
  if (facilityCount >= 10) return 3
  if (facilityCount >= 5) return 2
  return 1
}

export default function StepSelectDate({
  selectedDate,
  onSelect,
  facilityCount,
  extraDays,
  onExtraDaysChange,
}: StepSelectDateProps) {
  const [month, setMonth] = useState(() => new Date())
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const baseDuration = getBaseDuration(facilityCount)
  const totalDuration = baseDuration + extraDays
  const maxExtraDays = 5

  useEffect(() => {
    const fetchScheduleData = async () => {
      const supabase = createClient()

      const [{ data: tmpl }, { data: ovr }, { data: bk }] = await Promise.all([
        supabase.from('schedule_templates').select('*').eq('is_active', true),
        supabase.from('schedule_overrides').select('*'),
        supabase.from('bookings').select('*'),
      ])

      setTemplates(tmpl ?? [])
      setOverrides(ovr ?? [])
      setBookings(bk ?? [])
    }

    fetchScheduleData()
  }, [])

  const { availableDates, blockedDates, bookedDates } = useMemo(() => {
    const available: string[] = []
    const blocked: string[] = []
    const booked: string[] = []

    const bookedSet = new Set(bookings.map((b) => b.date))

    // Generate dates for current and next 2 months
    const start = new Date()
    start.setDate(start.getDate() + 1) // Start from tomorrow
    const end = new Date()
    end.setMonth(end.getMonth() + 3)

    const current = new Date(start)
    while (current <= end) {
      const dateStr = toDateString(current)
      const dayOfWeek = current.getDay() // 0=Sunday, 6=Saturday

      // Check if booked
      if (bookedSet.has(dateStr)) {
        booked.push(dateStr)
        current.setDate(current.getDate() + 1)
        continue
      }

      // Check overrides
      const override = overrides.find((o) => {
        const oStart = o.date_start
        const oEnd = o.date_end || o.date_start
        return dateStr >= oStart && dateStr <= oEnd
      })

      if (override) {
        if (override.is_blocked) {
          blocked.push(dateStr)
        } else {
          available.push(dateStr)
        }
        current.setDate(current.getDate() + 1)
        continue
      }

      // Check templates
      const hasTemplate = templates.some((t) => t.day_of_week === dayOfWeek)
      if (hasTemplate) {
        available.push(dateStr)
      }

      current.setDate(current.getDate() + 1)
    }

    return { availableDates: available, blockedDates: blocked, bookedDates: booked }
  }, [templates, overrides, bookings])

  // Calculate highlighted range dates (days after selected start date)
  const { highlightedDates, rangeConflict } = useMemo(() => {
    if (!selectedDate || totalDuration <= 1) {
      return { highlightedDates: [], rangeConflict: false }
    }

    const highlighted: string[] = []
    let conflict = false
    const availableSet = new Set(availableDates)

    for (let i = 1; i < totalDuration; i++) {
      const dateStr = addDays(selectedDate, i)
      highlighted.push(dateStr)
      if (!availableSet.has(dateStr)) {
        conflict = true
      }
    }

    return { highlightedDates: highlighted, rangeConflict: conflict }
  }, [selectedDate, totalDuration, availableDates])

  const endDateStr = selectedDate
    ? addDays(selectedDate, totalDuration - 1)
    : null

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">Wunschtermin wählen</h2>
        <p className="text-sm text-[var(--theme-textSecondary)]">
          Wählen Sie den Starttermin für die Messung
        </p>
      </div>

      {/* Duration info */}
      <div className="bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-border)] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[var(--accent-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--theme-text)]">Messdauer</h3>
        </div>

        <p className="text-sm text-[var(--theme-textSecondary)]">
          Basierend auf {facilityCount} {facilityCount === 1 ? 'Anlage' : 'Anlagen'} beträgt die
          Mindestdauer <span className="font-medium text-[var(--theme-text)]">{baseDuration} {baseDuration === 1 ? 'Tag' : 'Tage'}</span>.
        </p>

        {/* Extra days control */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--theme-text)]">Zusätzliche Tage</p>
            <p className="text-xs text-[var(--theme-textTertiary)]">
              Verlängerung gegen Aufpreis möglich
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onExtraDaysChange(Math.max(0, extraDays - 1))}
              disabled={extraDays === 0}
              className="p-1.5 rounded-lg border border-[var(--theme-border)] text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold text-[var(--theme-text)] w-6 text-center">
              {extraDays}
            </span>
            <button
              onClick={() => onExtraDaysChange(Math.min(maxExtraDays, extraDays + 1))}
              disabled={extraDays >= maxExtraDays}
              className="p-1.5 rounded-lg border border-[var(--theme-border)] text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Total duration */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--theme-border)]">
          <span className="text-sm text-[var(--theme-textSecondary)]">Gesamtdauer</span>
          <span className="text-sm font-semibold text-[var(--accent-primary)]">
            {totalDuration} {totalDuration === 1 ? 'Tag' : 'Tage'}
          </span>
        </div>

        {/* Date range display */}
        {selectedDate && endDateStr && totalDuration > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--theme-border)]">
            <span className="text-sm text-[var(--theme-textSecondary)]">Zeitraum</span>
            <span className="text-sm font-medium text-[var(--theme-text)]">
              {formatDate(selectedDate)} – {formatDate(endDateStr)}
            </span>
          </div>
        )}
      </div>

      {/* Range conflict warning */}
      {rangeConflict && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
          <AlertTriangle size={16} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--theme-text)]">
            Nicht alle Tage im gewählten Zeitraum sind verfügbar. Bitte wählen Sie ein anderes Startdatum oder reduzieren Sie die Dauer.
          </p>
        </div>
      )}

      <div className="max-w-md">
        <Calendar
          availableDates={availableDates}
          blockedDates={blockedDates}
          bookedDates={bookedDates}
          selectedDate={selectedDate}
          highlightedDates={highlightedDates}
          onSelect={onSelect}
          month={month}
          onMonthChange={setMonth}
        />
      </div>
    </div>
  )
}
