'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Plus } from 'lucide-react'
import type { Facility, FacilityType } from '@/lib/supabase/types'

export interface FacilityWithType extends Facility {
  facility_types: Pick<FacilityType, 'name'> | null
}

interface StepSelectFacilitiesProps {
  facilities: FacilityWithType[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export default function StepSelectFacilities({
  facilities,
  selectedIds,
  onToggle,
}: StepSelectFacilitiesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Anlagen auswählen</h2>
          <p className="text-sm text-[var(--theme-textSecondary)]">
            Wählen Sie die Sportanlagen für Ihren Messauftrag
          </p>
        </div>
        <Link
          href="/dashboard/facilities/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors"
        >
          <Plus size={16} />
          Neue Anlage anlegen
        </Link>
      </div>

      {facilities.length === 0 ? (
        <div className="py-12 text-center">
          <MapPin size={32} className="mx-auto text-[var(--theme-textTertiary)] mb-3" />
          <p className="text-sm text-[var(--theme-textSecondary)]">
            Sie haben noch keine Anlagen angelegt.
          </p>
          <Link
            href="/dashboard/facilities/new"
            className="inline-block mt-3 text-sm text-[var(--accent-primary)] hover:underline"
          >
            Erste Anlage anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {facilities.map((facility, i) => {
            const isSelected = selectedIds.includes(facility.id)
            return (
              <motion.button
                key={facility.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onToggle(facility.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all
                  ${isSelected
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                    : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--accent-primary)]/30'
                  }
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                    ${isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]'
                      : 'border-[var(--theme-border)]'
                    }
                  `}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--theme-text)]">{facility.name}</p>
                  <p className="text-xs text-[var(--theme-textSecondary)] mt-0.5">
                    {facility.facility_types?.name ?? 'Unbekannt'}
                    {facility.address ? ` · ${facility.address}` : ''}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      <p className="text-xs text-[var(--theme-textTertiary)]">
        {selectedIds.length} Anlage{selectedIds.length !== 1 ? 'n' : ''} ausgewählt
        {selectedIds.length > 3 && ' (Individualanfrage ab 4 Anlagen)'}
      </p>
    </div>
  )
}
