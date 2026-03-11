'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/icons/Logo'
import Button from '@/components/ui/Button'
import Stepper from '@/components/ui/Stepper'
import StepAccountType, { AccountType } from '@/components/onboarding/StepAccountType'
import StepRegistration, {
  RegistrationFormData,
  RegistrationErrors,
} from '@/components/onboarding/StepRegistration'
import StepConfirmation from '@/components/onboarding/StepConfirmation'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { label: 'Typ wählen' },
  { label: 'Daten' },
  { label: 'Bestätigung' },
]

const INITIAL_FORM: RegistrationFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  position: '',
  vatId: '',
}

function validateForm(
  formData: RegistrationFormData,
  accountType: AccountType | null
): RegistrationErrors {
  const errors: RegistrationErrors = {}

  if (!formData.firstName.trim()) errors.firstName = 'Vorname ist erforderlich.'
  if (!formData.lastName.trim()) errors.lastName = 'Nachname ist erforderlich.'
  if (!formData.email.trim()) {
    errors.email = 'E-Mail-Adresse ist erforderlich.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  }

  const needsOrg = accountType && ['staedtisch', 'verein', 'unternehmen'].includes(accountType)
  const needsPos = accountType && ['staedtisch', 'verein', 'unternehmen'].includes(accountType)

  if (needsOrg && !formData.organization.trim()) {
    errors.organization = 'Dieses Feld ist erforderlich.'
  }
  if (needsPos && !formData.position.trim()) {
    errors.position = 'Position ist erforderlich.'
  }

  return errors
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)

  const handleFieldChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!accountType) return
      setDirection(1)
      setCurrentStep(1)
      return
    }

    if (currentStep === 1) {
      const validationErrors = validateForm(formData, accountType)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsLoading(true)
      try {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
          email: formData.email.trim(),
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
            data: {
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
              account_type: accountType,
              phone: formData.phone.trim() || null,
              organization: formData.organization.trim() || null,
              position: formData.position.trim() || null,
              vat_id: formData.vatId.trim() || null,
            },
          },
        })

        if (error) {
          console.error('Onboarding auth error:', error.message, error)
          setErrors({ email: `Fehler: ${error.message}` })
          return
        }

        setDirection(1)
        setCurrentStep(2)
      } catch (err) {
        console.error('Onboarding network error:', err)
        setErrors({ email: 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.' })
      } finally {
        setIsLoading(false)
      }
      return
    }
  }

  const handleBack = () => {
    if (currentStep === 0) return
    setDirection(-1)
    setCurrentStep((prev) => prev - 1)
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOtp({
        email: formData.email.trim(),
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            account_type: accountType,
            phone: formData.phone.trim() || null,
            organization: formData.organization.trim() || null,
            position: formData.position.trim() || null,
            vat_id: formData.vatId.trim() || null,
          },
        },
      })
    } finally {
      setIsResending(false)
    }
  }

  const canProceed = currentStep === 0 ? accountType !== null : true

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 40 }),
    center: { x: 0 },
    exit: (dir: number) => ({ x: dir * -40 }),
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)] flex flex-col items-center justify-center px-4 py-12">
      {/* Back link */}
      <motion.div
        className="absolute top-6 left-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] transition-colors"
        >
          <ArrowLeft size={16} />
          Zurück zur Startseite
        </Link>
      </motion.div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Stepper */}
        <div className="mb-8 px-2">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Card */}
        <div className="relative p-[1px] rounded-2xl overflow-hidden" style={{ isolation: 'isolate' }}>
          {/* Glow border */}
          <div
            className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-60"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 300deg, var(--accent-primary) 330deg, transparent 360deg)`,
            }}
          />

          <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-8">
            {/* Step content */}
            <div className="min-h-[320px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {currentStep === 0 && (
                    <StepAccountType
                      selected={accountType}
                      onSelect={setAccountType}
                    />
                  )}
                  {currentStep === 1 && accountType && (
                    <StepRegistration
                      accountType={accountType}
                      formData={formData}
                      errors={errors}
                      onChange={handleFieldChange}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepConfirmation
                      email={formData.email}
                      onResend={handleResend}
                      isResending={isResending}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            {currentStep < 2 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--theme-border)]">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                  Zurück
                </button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading
                    ? 'Wird gesendet...'
                    : currentStep === 1
                      ? 'Registrieren'
                      : 'Weiter'
                  }
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Login link */}
        {currentStep < 2 && (
          <p className="text-center text-sm text-[var(--theme-textSecondary)] mt-6">
            Bereits registriert?{' '}
            <Link
              href="/login"
              className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors font-medium"
            >
              Anmelden
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
