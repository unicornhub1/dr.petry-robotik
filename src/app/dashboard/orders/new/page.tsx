'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button, useToast } from '@/components/ui'
import Stepper from '@/components/ui/Stepper'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { Package, PricingRule } from '@/lib/supabase/types'

import { triggerEvent } from '@/lib/notifications/trigger'
import StepSelectFacilities from '@/components/orders/StepSelectFacilities'
import type { FacilityWithType } from '@/components/orders/StepSelectFacilities'
import StepSelectPackages from '@/components/orders/StepSelectPackages'
import StepSelectDate from '@/components/orders/StepSelectDate'
import StepCalculation, { calculateDurationSurcharge } from '@/components/orders/StepCalculation'
import StepIndividualRequest from '@/components/orders/StepIndividualRequest'
import StepSummary from '@/components/orders/StepSummary'

function getBaseDuration(facilityCount: number): number {
  if (facilityCount >= 10) return 3
  if (facilityCount >= 5) return 2
  return 1
}

export default function NewOrderPage() {
  const { user, isApproved } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const [currentStep, setCurrentStep] = useState(0)
  const [facilities, setFacilities] = useState<FacilityWithType[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Selections state
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([])
  const [packageSelections, setPackageSelections] = useState<Record<string, string>>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [extraDays, setExtraDays] = useState(0)
  const [notes, setNotes] = useState('')
  const [agbAccepted, setAgbAccepted] = useState(false)

  const isIndividual = selectedFacilityIds.length > 3
  const baseDuration = getBaseDuration(selectedFacilityIds.length)
  const totalDuration = baseDuration + extraDays

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const supabase = createClient()

        const [{ data: fac }, { data: pkg }, { data: rules }] = await Promise.all([
          supabase
            .from('facilities')
            .select('*, facility_types(name)')
            .eq('user_id', user.id)
            .order('name'),
          supabase
            .from('packages')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
          supabase.from('pricing_rules').select('*').order('min_facilities'),
        ])

        setFacilities((fac as FacilityWithType[]) ?? [])
        setPackages(pkg ?? [])
        setPricingRules(rules ?? [])
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Dynamic steps
  const steps = useMemo(() => {
    if (isIndividual) {
      return [
        { label: 'Anlagen' },
        { label: 'Pakete' },
        { label: 'Anfrage' },
        { label: 'Zusammenfassung' },
      ]
    }
    return [
      { label: 'Anlagen' },
      { label: 'Pakete' },
      { label: 'Termin' },
      { label: 'Preise' },
      { label: 'Zusammenfassung' },
    ]
  }, [isIndividual])

  const handleToggleFacility = (id: string) => {
    setSelectedFacilityIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const handleSelectPackage = (facilityId: string, packageId: string) => {
    setPackageSelections((prev) => ({ ...prev, [facilityId]: packageId }))
  }

  // Calculate total (including duration surcharge)
  const { totalPrice, discountPercent, durationSurcharge } = useMemo(() => {
    const count = selectedFacilityIds.length
    const rule = pricingRules.find(
      (r) =>
        count >= r.min_facilities &&
        (r.max_facilities === null || count <= r.max_facilities)
    )
    const discount = rule?.discount_percent ?? 0

    const subtotal = selectedFacilityIds.reduce((sum, fid) => {
      const pkgId = packageSelections[fid]
      const pkg = packages.find((p) => p.id === pkgId)
      return sum + (pkg?.base_price ?? 0)
    }, 0)

    const discountAmount = Math.round(subtotal * (discount / 100))
    const afterDiscount = subtotal - discountAmount
    const surcharge = calculateDurationSurcharge(afterDiscount, extraDays)
    return {
      totalPrice: afterDiscount + surcharge,
      discountPercent: discount,
      durationSurcharge: surcharge,
    }
  }, [selectedFacilityIds, packageSelections, packages, pricingRules, extraDays])

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return selectedFacilityIds.length > 0
      case 1:
        return selectedFacilityIds.every((fid) => !!packageSelections[fid])
      case 2:
        if (isIndividual) return true // notes optional
        return selectedDate !== null
      case 3:
        if (isIndividual) return agbAccepted
        return true // calculation step, always can proceed
      case 4:
        return agbAccepted
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)

    const supabase = createClient()

    // Create order
    const orderData = {
      user_id: user.id,
      status: (isIndividual ? 'individual_request' : 'requested') as import('@/lib/supabase/types').OrderStatus,
      total_price: isIndividual ? null : totalPrice,
      discount_percent: isIndividual ? null : discountPercent,
      notes: notes || null,
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError || !order) {
      toast.error('Fehler beim Erstellen des Auftrags.')
      setSubmitting(false)
      return
    }

    // Create order items
    const orderItems = selectedFacilityIds.map((fid) => ({
      order_id: order.id,
      facility_id: fid,
      package_id: packageSelections[fid],
      item_price: isIndividual
        ? null
        : packages.find((p) => p.id === packageSelections[fid])?.base_price ?? null,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      toast.error('Fehler beim Speichern der Auftragsposten.')
      setSubmitting(false)
      return
    }

    // Create booking if not individual
    if (!isIndividual && selectedDate) {
      const durationHours = totalDuration * 10 // 10h per day (08:00 - 18:00)

      // Calculate end date for multi-day bookings
      const endDate = new Date(selectedDate + 'T00:00:00')
      endDate.setDate(endDate.getDate() + totalDuration - 1)

      const { error: bookingError } = await supabase.from('bookings').insert({
        order_id: order.id,
        date: selectedDate,
        start_time: '08:00',
        end_time: '18:00',
        duration_hours: durationHours,
        duration_surcharge: durationSurcharge > 0 ? durationSurcharge : null,
      })

      if (bookingError) {
        toast.warning('Auftrag erstellt, aber Terminbuchung fehlgeschlagen.')
      }
    }

    // Trigger notification events
    if (isIndividual) {
      triggerEvent('individual_request', { orderId: order.id })
    } else {
      triggerEvent('order_received', { orderId: order.id })
    }

    setSubmitting(false)
    toast.success(
      isIndividual
        ? 'Ihre Anfrage wurde erfolgreich gesendet.'
        : 'Ihr Auftrag wurde erfolgreich erstellt.'
    )
    router.push(`/dashboard/orders/${order.id}`)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-16 bg-[var(--theme-surface)] rounded-2xl" />
        <div className="h-96 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  const renderStep = () => {
    if (isIndividual) {
      switch (currentStep) {
        case 0:
          return (
            <StepSelectFacilities
              facilities={facilities}
              selectedIds={selectedFacilityIds}
              onToggle={handleToggleFacility}
            />
          )
        case 1:
          return (
            <StepSelectPackages
              facilities={facilities}
              selectedFacilityIds={selectedFacilityIds}
              packages={packages}
              selections={packageSelections}
              onSelect={handleSelectPackage}
            />
          )
        case 2:
          return (
            <StepIndividualRequest
              notes={notes}
              onChange={setNotes}
              facilityCount={selectedFacilityIds.length}
            />
          )
        case 3:
          return (
            <StepSummary
              facilities={facilities}
              selectedFacilityIds={selectedFacilityIds}
              packageSelections={packageSelections}
              packages={packages}
              selectedDate={null}
              totalPrice={totalPrice}
              discountPercent={discountPercent}
              durationDays={totalDuration}
              durationSurcharge={0}
              isIndividual
              notes={notes}
              isApproved={isApproved}
              agbAccepted={agbAccepted}
              onAgbChange={setAgbAccepted}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )
        default:
          return null
      }
    }

    // Standard flow (<=3 facilities)
    switch (currentStep) {
      case 0:
        return (
          <StepSelectFacilities
            facilities={facilities}
            selectedIds={selectedFacilityIds}
            onToggle={handleToggleFacility}
          />
        )
      case 1:
        return (
          <StepSelectPackages
            facilities={facilities}
            selectedFacilityIds={selectedFacilityIds}
            packages={packages}
            selections={packageSelections}
            onSelect={handleSelectPackage}
          />
        )
      case 2:
        return (
          <StepSelectDate
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            facilityCount={selectedFacilityIds.length}
            extraDays={extraDays}
            onExtraDaysChange={setExtraDays}
          />
        )
      case 3:
        return (
          <StepCalculation
            facilities={facilities}
            selectedFacilityIds={selectedFacilityIds}
            packageSelections={packageSelections}
            packages={packages}
            pricingRules={pricingRules}
            isApproved={isApproved}
            extraDays={extraDays}
            baseDuration={baseDuration}
          />
        )
      case 4:
        return (
          <StepSummary
            facilities={facilities}
            selectedFacilityIds={selectedFacilityIds}
            packageSelections={packageSelections}
            packages={packages}
            selectedDate={selectedDate}
            totalPrice={totalPrice}
            discountPercent={discountPercent}
            durationDays={totalDuration}
            durationSurcharge={durationSurcharge}
            isIndividual={false}
            notes={notes}
            isApproved={isApproved}
            agbAccepted={agbAccepted}
            onAgbChange={setAgbAccepted}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )
      default:
        return null
    }
  }

  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Neuer Messauftrag</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Konfigurieren Sie Ihren Messauftrag Schritt für Schritt
        </p>
      </div>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {!isLastStep && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-border)]">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Zurück
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Weiter
          </Button>
        </div>
      )}
    </div>
  )
}
