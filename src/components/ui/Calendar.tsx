'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  availableDates: string[]
  blockedDates: string[]
  bookedDates: string[]
  selectedDate: string | null
  highlightedDates?: string[]
  onSelect: (date: string) => void
  month: Date
  onMonthChange: (date: Date) => void
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

// Monday = 0
function getWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

export default function Calendar({
  availableDates,
  blockedDates,
  bookedDates,
  selectedDate,
  highlightedDates = [],
  onSelect,
  month,
  onMonthChange,
}: CalendarProps) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  const days = getDaysInMonth(year, monthIndex)
  const firstDayOffset = getWeekdayIndex(days[0])

  const prevMonth = () => {
    onMonthChange(new Date(year, monthIndex - 1, 1))
  }
  const nextMonth = () => {
    onMonthChange(new Date(year, monthIndex + 1, 1))
  }

  const getDayStyle = (dateStr: string) => {
    if (dateStr === selectedDate) {
      return {
        bg: 'bg-[var(--color-warning)]',
        text: 'text-white',
        label: 'Ausgewählt',
        clickable: true,
      }
    }
    if (highlightedDates.includes(dateStr)) {
      return {
        bg: 'bg-[var(--color-warning)]/40',
        text: 'text-[var(--theme-text)]',
        label: 'Messungszeitraum',
        clickable: false,
      }
    }
    if (bookedDates.includes(dateStr)) {
      return {
        bg: 'bg-[var(--color-info)]/20',
        text: 'text-[var(--color-info)]',
        label: 'Gebucht',
        clickable: false,
      }
    }
    if (blockedDates.includes(dateStr)) {
      return {
        bg: 'bg-[var(--theme-surfaceHover)]',
        text: 'text-[var(--theme-textTertiary)]',
        label: 'Gesperrt',
        clickable: false,
      }
    }
    if (availableDates.includes(dateStr)) {
      return {
        bg: 'bg-[var(--color-success)]/15 hover:bg-[var(--color-success)]/30',
        text: 'text-[var(--color-success)]',
        label: 'Verfügbar',
        clickable: true,
      }
    }
    return {
      bg: '',
      text: 'text-[var(--theme-textTertiary)]',
      label: '',
      clickable: false,
    }
  }

  return (
    <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--radius-xl)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-[var(--radius-md)] text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surfaceHover)] transition-colors duration-[var(--transition-fast)]"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm font-semibold text-[var(--theme-text)]">
          {MONTHS[monthIndex]} {year}
        </span>

        <button
          onClick={nextMonth}
          className="p-1.5 rounded-[var(--radius-md)] text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surfaceHover)] transition-colors duration-[var(--transition-fast)]"
          aria-label="Nächster Monat"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium text-[var(--theme-textTertiary)] py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = toDateString(day)
          const style = getDayStyle(dateStr)

          return (
            <motion.button
              key={dateStr}
              onClick={() => style.clickable && onSelect(dateStr)}
              disabled={!style.clickable}
              whileHover={style.clickable ? { scale: 1.08 } : undefined}
              whileTap={style.clickable ? { scale: 0.95 } : undefined}
              transition={{ duration: 0.1 }}
              title={style.label || undefined}
              className={`
                aspect-square flex items-center justify-center text-xs rounded-[var(--radius-md)]
                transition-colors duration-[var(--transition-fast)]
                ${style.bg} ${style.text}
                ${style.clickable ? 'cursor-pointer' : 'cursor-default'}
                ${!style.bg && !style.clickable ? 'opacity-40' : ''}
              `}
            >
              {day.getDate()}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--theme-border)]">
        {[
          { color: 'bg-[var(--color-success)]/15', label: 'Verfügbar', text: 'text-[var(--color-success)]' },
          { color: 'bg-[var(--theme-surfaceHover)]', label: 'Gesperrt', text: 'text-[var(--theme-textTertiary)]' },
          { color: 'bg-[var(--color-info)]/20', label: 'Gebucht', text: 'text-[var(--color-info)]' },
          { color: 'bg-[var(--color-warning)]', label: 'Ausgewählt', text: 'text-white' },
          ...(highlightedDates.length > 0
            ? [{ color: 'bg-[var(--color-warning)]/40', label: 'Messzeitraum', text: 'text-[var(--theme-text)]' }]
            : []),
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-xs text-[var(--theme-textTertiary)]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
