'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Pencil } from 'lucide-react'
import { Table, Button, EmptyState } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { Facility, FacilityType } from '@/lib/supabase/types'

interface FacilityWithType extends Facility {
  facility_types: Pick<FacilityType, 'name'> | null
}

export default function FacilitiesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [facilities, setFacilities] = useState<FacilityWithType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchFacilities = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('facilities')
          .select('*, facility_types(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setFacilities((data as FacilityWithType[]) ?? [])
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [user])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  const gridLabels: Record<string, string> = {
    '5m': '5 m',
    '10m': '10 m',
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Art' },
    { key: 'address', label: 'Adresse' },
    { key: 'grid', label: 'Messraster' },
    { key: 'actions', label: '' },
  ]

  const tableData = facilities.map((f) => ({
    name: (
      <span className="font-medium text-[var(--theme-text)]">{f.name}</span>
    ),
    type: (
      <span className="text-[var(--theme-textSecondary)]">
        {f.facility_types?.name ?? '-'}
      </span>
    ),
    address: (
      <span className="text-[var(--theme-textSecondary)] text-sm">
        {f.address || '-'}
      </span>
    ),
    grid: (
      <span className="text-[var(--theme-textSecondary)]">
        {f.measurement_grid ? gridLabels[f.measurement_grid] || f.measurement_grid : '-'}
      </span>
    ),
    actions: (
      <Link
        href={`/dashboard/facilities/${f.id}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors"
      >
        <Pencil size={14} />
        Bearbeiten
      </Link>
    ),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Sportanlagen</h1>
          <p className="text-[var(--theme-textSecondary)]">
            Verwalten Sie Ihre Sportanlagen
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/dashboard/facilities/new')}
        >
          Neue Anlage
        </Button>
      </div>

      {/* Content */}
      {facilities.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Keine Anlagen vorhanden"
          description="Legen Sie Ihre erste Sportanlage an, um einen Messauftrag zu erstellen."
          action={{
            label: 'Neue Anlage anlegen',
            onClick: () => router.push('/dashboard/facilities/new'),
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Table columns={columns} data={tableData} />
        </motion.div>
      )}
    </div>
  )
}
