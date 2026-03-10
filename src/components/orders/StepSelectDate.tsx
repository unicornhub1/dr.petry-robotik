'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { ScheduleTemplate, ScheduleOverride, Booking } from '@/lib/supabase/types'

interface StepSelectDateProps {
  selectedDate: string | null
  onSelect: (date: string) => void
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function StepSelectDate({
  selectedDate,
  onSelect,
}: StepSelectDateProps) {
  const [month, setMonth] = useState(() => new Date())
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">Wunschtermin waehlen</h2>
        <p className="text-sm text-[var(--theme-textSecondary)]">
          Waehlen Sie einen verfuegbaren Termin fuer die Messung
        </p>
      </div>

      <div className="max-w-md">
        <Calendar
          availableDates={availableDates}
          blockedDates={blockedDates}
          bookedDates={bookedDates}
          selectedDate={selectedDate}
          onSelect={onSelect}
          month={month}
          onMonthChange={setMonth}
        />
      </div>
    </div>
  )
}
