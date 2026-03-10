'use client'

import { Input } from '@/components/ui/Input'
import type { AccountType } from './StepAccountType'

export interface RegistrationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string
  position: string
  vatId: string
}

export interface RegistrationErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  organization?: string
  position?: string
  vatId?: string
}

interface StepRegistrationProps {
  accountType: AccountType
  formData: RegistrationFormData
  errors: RegistrationErrors
  onChange: (field: keyof RegistrationFormData, value: string) => void
}

const showOrganization: AccountType[] = ['staedtisch', 'verein', 'unternehmen']
const showPosition: AccountType[] = ['staedtisch', 'verein', 'unternehmen']
const showVatId: AccountType[] = ['unternehmen']

export default function StepRegistration({
  accountType,
  formData,
  errors,
  onChange,
}: StepRegistrationProps) {
  const needsOrganization = showOrganization.includes(accountType)
  const needsPosition = showPosition.includes(accountType)
  const needsVatId = showVatId.includes(accountType)

  const organizationLabel =
    accountType === 'staedtisch'
      ? 'Behoerde / Institution'
      : accountType === 'verein'
        ? 'Vereinsname'
        : 'Unternehmen'

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">
        Ihre Kontaktdaten
      </h2>
      <p className="text-sm text-[var(--theme-textSecondary)] mb-6">
        Diese Angaben werden fuer Ihre Registrierung benoetigt.
      </p>

      <div className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vorname *"
            type="text"
            placeholder="Max"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Nachname *"
            type="text"
            placeholder="Mustermann"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <Input
          label="E-Mail-Adresse *"
          type="email"
          placeholder="max@beispiel.de"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        {/* Phone (optional) */}
        <Input
          label="Telefon (optional)"
          type="tel"
          placeholder="+49 123 456789"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />

        {/* Organization (conditional) */}
        {needsOrganization && (
          <Input
            label={`${organizationLabel} *`}
            type="text"
            placeholder={organizationLabel}
            value={formData.organization}
            onChange={(e) => onChange('organization', e.target.value)}
            error={errors.organization}
            autoComplete="organization"
          />
        )}

        {/* Position (conditional) */}
        {needsPosition && (
          <Input
            label="Position / Funktion *"
            type="text"
            placeholder="z.B. Projektleiter, Vereinsvorsitzender"
            value={formData.position}
            onChange={(e) => onChange('position', e.target.value)}
            error={errors.position}
            autoComplete="organization-title"
          />
        )}

        {/* VAT ID (company only) */}
        {needsVatId && (
          <Input
            label="Umsatzsteuer-ID (optional)"
            type="text"
            placeholder="DE123456789"
            value={formData.vatId}
            onChange={(e) => onChange('vatId', e.target.value)}
            error={errors.vatId}
          />
        )}
      </div>

      <p className="mt-4 text-xs text-[var(--theme-textTertiary)]">
        * Pflichtfelder
      </p>
    </div>
  )
}
