'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle,
  Ban,
  Unlock,
  MapPin,
  ClipboardList,
} from 'lucide-react'
import { Card, Badge, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { triggerEvent } from '@/lib/notifications/trigger'
import type { Profile } from '@/lib/supabase/types'

const accountTypeLabels: Record<string, string> = {
  private: 'Privat',
  municipal: 'Kommune',
  club: 'Verein',
  company: 'Unternehmen',
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const userId = params.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [facilitiesCount, setFacilitiesCount] = useState(0)
  const [ordersCount, setOrdersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      try {
        const supabase = createClient()

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        setProfile(profileData as unknown as Profile)

        const { count: fCount } = await supabase
          .from('facilities')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        setFacilitiesCount(fCount ?? 0)

        const { count: oCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        setOrdersCount(oCount ?? 0)
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const handleApprove = async () => {
    if (!profile) return
    setActionLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', profile.id)

    if (error) {
      toastError('Fehler beim Freigeben')
    } else {
      success('Nutzer erfolgreich freigegeben')
      setProfile({ ...profile, is_approved: true })
      triggerEvent('account_approved', { userId: profile.id })
    }
    setActionLoading(false)
  }

  const handleSuspend = async () => {
    if (!profile) return
    setActionLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: false })
      .eq('id', profile.id)

    if (error) {
      toastError('Fehler beim Sperren')
    } else {
      success('Nutzer gesperrt')
      setProfile({ ...profile, is_approved: false })
      triggerEvent('account_suspended', { userId: profile.id })
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--theme-textSecondary)]">Nutzer nicht gefunden</p>
      </div>
    )
  }

  const isPending = !profile.is_approved
  const isActive = profile.is_approved

  const profileFields = [
    { label: 'E-Mail', value: profile.email },
    { label: 'Vorname', value: profile.first_name },
    { label: 'Nachname', value: profile.last_name },
    { label: 'Telefon', value: profile.phone ?? '-' },
    { label: 'Kontotyp', value: accountTypeLabels[profile.account_type] ?? profile.account_type },
    { label: 'Organisation', value: profile.organization ?? '-' },
    { label: 'Position', value: profile.position ?? '-' },
    { label: 'USt-ID', value: profile.vat_id ?? '-' },
    { label: 'Straße', value: profile.address_street ?? '-' },
    { label: 'PLZ', value: profile.address_zip ?? '-' },
    { label: 'Stadt', value: profile.address_city ?? '-' },
    { label: 'Land', value: profile.address_country },
    { label: 'Registriert am', value: new Date(profile.created_at).toLocaleDateString('de-DE') },
  ]

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/users')}
          className="p-2 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surface)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-[var(--theme-textSecondary)]">{profile.email}</p>
        </div>
        <div>
          {isPending ? (
            <Badge variant="warning" size="md">Wartend</Badge>
          ) : (
            <Badge variant="success" size="md">Aktiv</Badge>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-primary)]/10">
              <MapPin size={20} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--theme-text)]">{facilitiesCount}</p>
              <p className="text-xs text-[var(--theme-textSecondary)]">Sportanlagen</p>
            </div>
          </div>
        </Card>
        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-primary)]/10">
              <ClipboardList size={20} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--theme-text)]">{ordersCount}</p>
              <p className="text-xs text-[var(--theme-textSecondary)]">Aufträge</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Fields */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h3 className="font-semibold text-[var(--theme-text)] mb-4">Profildaten</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profileFields.map((field) => (
            <div key={field.label}>
              <p className="text-xs text-[var(--theme-textTertiary)] mb-1">{field.label}</p>
              <p className="text-sm text-[var(--theme-text)]">{field.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {isPending && (
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 border border-[var(--color-success)]/30 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={16} />
            Freigeben
          </button>
        )}
        {isActive && (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 border border-[var(--color-error)]/30 transition-colors disabled:opacity-50"
          >
            <Ban size={16} />
            Sperren
          </button>
        )}
        {isPending && !profile.is_admin && (
          <button
            onClick={() => {
              // Unlock is the same as approve in this context
              handleApprove()
            }}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 transition-colors disabled:opacity-50"
          >
            <Unlock size={16} />
            Entsperren
          </button>
        )}
      </div>
    </div>
  )
}
