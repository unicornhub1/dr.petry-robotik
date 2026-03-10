'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, MapPin, FileText } from 'lucide-react'
import { Input, Button, Card, useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    organization: '',
    position: '',
    vat_id: '',
    address_street: '',
    address_zip: '',
    address_city: '',
    address_country: 'Deutschland',
    billing_same: true,
    billing_street: '',
    billing_zip: '',
    billing_city: '',
    billing_country: 'Deutschland',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
        position: profile.position || '',
        vat_id: profile.vat_id || '',
        address_street: profile.address_street || '',
        address_zip: profile.address_zip || '',
        address_city: profile.address_city || '',
        address_country: profile.address_country || 'Deutschland',
        billing_same: profile.billing_same,
        billing_street: profile.billing_street || '',
        billing_zip: profile.billing_zip || '',
        billing_city: profile.billing_city || '',
        billing_country: profile.billing_country || 'Deutschland',
      })
    }
  }, [profile])

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        organization: form.organization || null,
        position: form.position || null,
        vat_id: form.vat_id || null,
        address_street: form.address_street || null,
        address_zip: form.address_zip || null,
        address_city: form.address_city || null,
        address_country: form.address_country,
        billing_same: form.billing_same,
        billing_street: form.billing_same ? null : form.billing_street || null,
        billing_zip: form.billing_same ? null : form.billing_zip || null,
        billing_city: form.billing_same ? null : form.billing_city || null,
        billing_country: form.billing_same ? 'Deutschland' : form.billing_country,
      })
      .eq('id', profile.id)

    setSaving(false)

    if (error) {
      toast.error('Fehler beim Speichern. Bitte versuchen Sie es erneut.')
    } else {
      toast.success('Profil erfolgreich gespeichert.')
      await refreshProfile()
    }
  }

  if (!profile) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-96 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  const accountTypeLabels: Record<string, string> = {
    private: 'Privat',
    municipal: 'Kommune',
    club: 'Verein',
    company: 'Unternehmen',
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Profil</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Verwalten Sie Ihre persoenlichen Daten
        </p>
      </div>

      {/* Read-only Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <User size={20} className="text-[var(--theme-textSecondary)]" />
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Account</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="E-Mail"
            value={profile.email}
            readOnly
            className="opacity-60 cursor-not-allowed"
          />
          <Input
            label="Kontotyp"
            value={accountTypeLabels[profile.account_type] || profile.account_type}
            readOnly
            className="opacity-60 cursor-not-allowed"
          />
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={20} className="text-[var(--theme-textSecondary)]" />
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Persoenliche Daten</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Vorname"
            value={form.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
          />
          <Input
            label="Nachname"
            value={form.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
          />
          <Input
            label="Telefon"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          <Input
            label="Organisation"
            value={form.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
          />
          <Input
            label="Position"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
          />
          <Input
            label="USt-IdNr."
            value={form.vat_id}
            onChange={(e) => handleChange('vat_id', e.target.value)}
          />
        </div>
      </motion.div>

      {/* Address */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <MapPin size={20} className="text-[var(--theme-textSecondary)]" />
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Adresse</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Strasse und Hausnummer"
              value={form.address_street}
              onChange={(e) => handleChange('address_street', e.target.value)}
            />
          </div>
          <Input
            label="PLZ"
            value={form.address_zip}
            onChange={(e) => handleChange('address_zip', e.target.value)}
          />
          <Input
            label="Stadt"
            value={form.address_city}
            onChange={(e) => handleChange('address_city', e.target.value)}
          />
          <Input
            label="Land"
            value={form.address_country}
            onChange={(e) => handleChange('address_country', e.target.value)}
          />
        </div>
      </motion.div>

      {/* Billing Address */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <FileText size={20} className="text-[var(--theme-textSecondary)]" />
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Rechnungsanschrift</h2>
        </div>

        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={!form.billing_same}
            onChange={(e) => handleChange('billing_same', !e.target.checked)}
            className="w-4 h-4 rounded border-[var(--theme-border)] accent-[var(--accent-primary)]"
          />
          <span className="text-sm text-[var(--theme-text)]">
            Rechnungsanschrift abweichend?
          </span>
        </label>

        {!form.billing_same && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="sm:col-span-2">
              <Input
                label="Strasse und Hausnummer"
                value={form.billing_street}
                onChange={(e) => handleChange('billing_street', e.target.value)}
              />
            </div>
            <Input
              label="PLZ"
              value={form.billing_zip}
              onChange={(e) => handleChange('billing_zip', e.target.value)}
            />
            <Input
              label="Stadt"
              value={form.billing_city}
              onChange={(e) => handleChange('billing_city', e.target.value)}
            />
            <Input
              label="Land"
              value={form.billing_country}
              onChange={(e) => handleChange('billing_country', e.target.value)}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Wird gespeichert...' : 'Profil speichern'}
        </Button>
      </div>
    </div>
  )
}
