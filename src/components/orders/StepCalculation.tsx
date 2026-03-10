'use client'

import { PriceDisplay } from '@/components/ui'
import type { Package, PricingRule } from '@/lib/supabase/types'
import type { FacilityWithType } from './StepSelectFacilities'

interface StepCalculationProps {
  facilities: FacilityWithType[]
  selectedFacilityIds: string[]
  packageSelections: Record<string, string>
  packages: Package[]
  pricingRules: PricingRule[]
  isApproved: boolean
}

export default function StepCalculation({
  facilities,
  selectedFacilityIds,
  packageSelections,
  packages,
  pricingRules,
  isApproved,
}: StepCalculationProps) {
  const selectedFacilities = facilities.filter((f) =>
    selectedFacilityIds.includes(f.id)
  )
  const facilityCount = selectedFacilities.length

  // Find applicable discount
  const rule = pricingRules.find(
    (r) =>
      facilityCount >= r.min_facilities &&
      (r.max_facilities === null || facilityCount <= r.max_facilities)
  )
  const discountPercent = rule?.discount_percent ?? 0

  // Calculate line items
  const lineItems = selectedFacilities.map((facility) => {
    const pkgId = packageSelections[facility.id]
    const pkg = packages.find((p) => p.id === pkgId)
    return {
      facility,
      pkg,
      price: pkg?.base_price ?? 0,
    }
  })

  const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0)
  const discountAmount = Math.round(subtotal * (discountPercent / 100))
  const total = subtotal - discountAmount

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">Preiskalkulation</h2>
        <p className="text-sm text-[var(--theme-textSecondary)]">
          Uebersicht der Kosten fuer Ihren Messauftrag
        </p>
      </div>

      <div className="bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-border)] overflow-hidden">
        {/* Line items */}
        <div className="divide-y divide-[var(--theme-border)]">
          {lineItems.map((item) => (
            <div key={item.facility.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--theme-text)]">
                  {item.facility.name}
                </p>
                <p className="text-xs text-[var(--theme-textSecondary)]">
                  {item.pkg?.name ?? 'Kein Paket'}
                </p>
              </div>
              <PriceDisplay priceInCents={item.price} isApproved={isApproved} />
            </div>
          ))}
        </div>

        {/* Subtotal + Discount */}
        <div className="border-t border-[var(--theme-border)] bg-[var(--theme-surfaceHover)]">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-[var(--theme-textSecondary)]">Zwischensumme</span>
            <PriceDisplay priceInCents={subtotal} isApproved={isApproved} />
          </div>

          {discountPercent > 0 && (
            <div className="flex items-center justify-between px-4 pb-4">
              <span className="text-sm text-[var(--color-success)]">
                Mengenrabatt ({discountPercent}%)
              </span>
              <span className="text-sm text-[var(--color-success)]">
                {isApproved ? `-${(discountAmount / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR` : '---,-- EUR'}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t-2 border-[var(--theme-border)] p-4 flex items-center justify-between">
          <span className="text-base font-semibold text-[var(--theme-text)]">Gesamtpreis</span>
          <PriceDisplay
            priceInCents={total}
            isApproved={isApproved}
            className="text-lg"
          />
        </div>
      </div>

      {!isApproved && (
        <p className="text-xs text-[var(--theme-textTertiary)]">
          Preise werden nach Freigabe Ihres Accounts sichtbar.
        </p>
      )}
    </div>
  )
}
