'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Package } from '@/lib/supabase/types'
import type { FacilityWithType } from './StepSelectFacilities'

interface StepSelectPackagesProps {
  facilities: FacilityWithType[]
  selectedFacilityIds: string[]
  packages: Package[]
  /** Map: facilityId -> packageId */
  selections: Record<string, string>
  onSelect: (facilityId: string, packageId: string) => void
}

export default function StepSelectPackages({
  facilities,
  selectedFacilityIds,
  packages,
  selections,
  onSelect,
}: StepSelectPackagesProps) {
  const selectedFacilities = facilities.filter((f) =>
    selectedFacilityIds.includes(f.id)
  )

  const gridLabels: Record<string, string> = {
    '5m': '5 m Raster',
    '10m': '10 m Raster',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">Messpaket wählen</h2>
        <p className="text-sm text-[var(--theme-textSecondary)]">
          Wählen Sie für jede Anlage ein Messpaket
        </p>
      </div>

      {selectedFacilities.map((facility, fi) => (
        <motion.div
          key={facility.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fi * 0.1 }}
          className="bg-[var(--theme-surface)] rounded-xl p-5 border border-[var(--theme-border)]"
        >
          <h3 className="text-sm font-semibold text-[var(--theme-text)] mb-3">
            {facility.name}
            <span className="font-normal text-[var(--theme-textSecondary)] ml-2">
              {facility.facility_types?.name}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packages.map((pkg) => {
              const isSelected = selections[facility.id] === pkg.id
              return (
                <button
                  key={pkg.id}
                  onClick={() => onSelect(facility.id, pkg.id)}
                  className={`
                    relative p-4 rounded-lg border text-left transition-all
                    ${isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                      : 'border-[var(--theme-border)] hover:border-[var(--accent-primary)]/30'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-[var(--theme-text)] mb-1">
                    {pkg.name}
                  </p>
                  {pkg.description && (
                    <p className="text-xs text-[var(--theme-textSecondary)] mb-2">
                      {pkg.description}
                    </p>
                  )}
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[var(--theme-surfaceHover)] text-[var(--theme-textSecondary)]">
                    {gridLabels[pkg.grid_size] || pkg.grid_size}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
