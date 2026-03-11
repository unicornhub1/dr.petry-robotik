'use client'

import { motion } from 'framer-motion'
import { MapPin, Package as PackageIcon, Calendar, FileText, Clock } from 'lucide-react'
import { PriceDisplay, Button } from '@/components/ui'
import type { Package } from '@/lib/supabase/types'
import type { FacilityWithType } from './StepSelectFacilities'

interface StepSummaryProps {
  facilities: FacilityWithType[]
  selectedFacilityIds: string[]
  packageSelections: Record<string, string>
  packages: Package[]
  selectedDate: string | null
  totalPrice: number
  discountPercent: number
  durationDays: number
  durationSurcharge: number
  isIndividual: boolean
  notes: string
  isApproved: boolean
  agbAccepted: boolean
  onAgbChange: (accepted: boolean) => void
  onSubmit: () => void
  submitting: boolean
}

export default function StepSummary({
  facilities,
  selectedFacilityIds,
  packageSelections,
  packages,
  selectedDate,
  totalPrice,
  discountPercent,
  durationDays,
  durationSurcharge,
  isIndividual,
  notes,
  isApproved,
  agbAccepted,
  onAgbChange,
  onSubmit,
  submitting,
}: StepSummaryProps) {
  const selectedFacilities = facilities.filter((f) =>
    selectedFacilityIds.includes(f.id)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">Zusammenfassung</h2>
        <p className="text-sm text-[var(--theme-textSecondary)]">
          Prüfen Sie Ihre Angaben vor dem Absenden
        </p>
      </div>

      {/* Facilities + Packages */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--theme-surface)] rounded-xl p-5 border border-[var(--theme-border)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-[var(--theme-textSecondary)]" />
          <h3 className="text-sm font-semibold text-[var(--theme-text)]">Anlagen &amp; Pakete</h3>
        </div>
        <div className="space-y-2">
          {selectedFacilities.map((facility) => {
            const pkgId = packageSelections[facility.id]
            const pkg = packages.find((p) => p.id === pkgId)
            return (
              <div
                key={facility.id}
                className="flex items-center justify-between py-2 border-b border-[var(--theme-border)] last:border-0"
              >
                <div>
                  <p className="text-sm text-[var(--theme-text)]">{facility.name}</p>
                  <p className="text-xs text-[var(--theme-textSecondary)]">
                    {pkg?.name ?? 'Kein Paket'}
                  </p>
                </div>
                {!isIndividual && pkg && (
                  <PriceDisplay priceInCents={pkg.base_price} isApproved={isApproved} className="text-sm" />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Date + Duration */}
      {!isIndividual && selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--theme-surface)] rounded-xl p-5 border border-[var(--theme-border)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-[var(--theme-textSecondary)]" />
            <h3 className="text-sm font-semibold text-[var(--theme-text)]">Wunschtermin</h3>
          </div>
          <div className="space-y-2">
            {durationDays > 1 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--theme-textSecondary)]">Startdatum</span>
                  <span className="text-sm text-[var(--theme-text)]">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('de-DE', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--theme-textSecondary)]">Enddatum</span>
                  <span className="text-sm text-[var(--theme-text)]">
                    {(() => {
                      const endDate = new Date(selectedDate + 'T00:00:00')
                      endDate.setDate(endDate.getDate() + durationDays - 1)
                      return endDate.toLocaleDateString('de-DE', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--theme-border)]">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[var(--accent-primary)]" />
                    <span className="text-sm font-medium text-[var(--theme-text)]">Messdauer</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--accent-primary)]">
                    {durationDays} Tage
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--theme-text)]">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('de-DE', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Notes */}
      {notes && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--theme-surface)] rounded-xl p-5 border border-[var(--theme-border)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-[var(--theme-textSecondary)]" />
            <h3 className="text-sm font-semibold text-[var(--theme-text)]">Anmerkungen</h3>
          </div>
          <p className="text-sm text-[var(--theme-textSecondary)]">{notes}</p>
        </motion.div>
      )}

      {/* Price */}
      {!isIndividual && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--theme-surface)] rounded-xl p-5 border border-[var(--theme-border)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--theme-text)]">Gesamtpreis</h3>
              {discountPercent > 0 && (
                <p className="text-xs text-[var(--color-success)]">
                  inkl. {discountPercent}% Mengenrabatt
                </p>
              )}
              {durationSurcharge > 0 && (
                <p className="text-xs text-[var(--color-warning)]">
                  inkl. Verlängerungsaufpreis
                </p>
              )}
            </div>
            <PriceDisplay priceInCents={totalPrice} isApproved={isApproved} className="text-xl font-bold" />
          </div>
        </motion.div>
      )}

      {isIndividual && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--accent-primary)]/5 rounded-xl p-5 border border-[var(--accent-primary)]/20"
        >
          <p className="text-sm text-[var(--theme-text)]">
            Dies ist eine Individualanfrage. Wir erstellen Ihnen ein individuelles Angebot.
          </p>
        </motion.div>
      )}

      {/* AGB Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agbAccepted}
          onChange={(e) => onAgbChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-[var(--theme-border)] accent-[var(--accent-primary)]"
        />
        <span className="text-sm text-[var(--theme-textSecondary)]">
          Ich akzeptiere die Allgemeinen Geschäftsbedingungen und habe die Datenschutzerklärung gelesen.
        </span>
      </label>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!agbAccepted || submitting}
        >
          {submitting
            ? 'Wird gesendet...'
            : isIndividual
              ? 'Anfrage absenden'
              : 'Auftrag absenden'
          }
        </Button>
      </div>
    </div>
  )
}
