'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { Table, Dropdown, EmptyState, Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

type StatusFilter = 'all' | 'pending' | 'active' | 'suspended'

const accountTypeLabels: Record<string, string> = {
  private: 'Privat',
  municipal: 'Kommune',
  club: 'Verein',
  company: 'Unternehmen',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false })

      setUsers(data ?? [])
      setLoading(false)
    }

    fetchUsers()
  }, [])

  const getUserStatus = (user: Profile): 'pending' | 'active' | 'suspended' => {
    if (!user.is_approved) return 'pending'
    // We use a convention: if the user has address_country set to 'SUSPENDED', they are suspended
    // For simplicity, we just check is_approved for now. Suspended can be added via a field.
    return 'active'
  }

  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'all') return true
    return getUserStatus(user) === statusFilter
  })

  const statusFilterOptions = [
    { value: 'all', label: 'Alle' },
    { value: 'pending', label: 'Wartend' },
    { value: 'active', label: 'Aktiv' },
    { value: 'suspended', label: 'Gesperrt' },
  ]

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'E-Mail' },
    { key: 'account_type', label: 'Kontotyp' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Registriert', sortable: true },
    { key: 'actions', label: '' },
  ]

  const tableData = filteredUsers.map((user) => {
    const status = getUserStatus(user)
    const statusBadge = {
      pending: <Badge variant="warning" size="sm">Wartend</Badge>,
      active: <Badge variant="success" size="sm">Aktiv</Badge>,
      suspended: <Badge variant="error" size="sm">Gesperrt</Badge>,
    }

    return {
      name: (
        <span className="font-medium text-[var(--theme-text)]">
          {user.first_name} {user.last_name}
        </span>
      ),
      email: (
        <span className="text-[var(--theme-textSecondary)]">{user.email}</span>
      ),
      account_type: (
        <span className="text-[var(--theme-textSecondary)]">
          {accountTypeLabels[user.account_type] ?? user.account_type}
        </span>
      ),
      status: statusBadge[status],
      created_at: (
        <span className="text-[var(--theme-textSecondary)]">
          {new Date(user.created_at).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      ),
      actions: (
        <Link
          href={`/admin/users/${user.id}`}
          className="text-sm text-[var(--accent-primary)] hover:underline"
        >
          Details
        </Link>
      ),
    }
  })

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Nutzer</h1>
          <p className="text-[var(--theme-textSecondary)]">
            Alle registrierten Nutzer verwalten
          </p>
        </div>
        <div className="w-48">
          <Dropdown
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
            placeholder="Status filtern"
          />
        </div>
      </div>

      {/* Content */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Keine Nutzer gefunden"
          description="Es gibt keine Nutzer mit diesem Filter."
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
