'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  ClipboardList,
  Clock,
  ArrowRight,
  CheckCircle,
  Eye,
} from 'lucide-react'
import { Card, StatusBadge, useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Order } from '@/lib/supabase/types'

interface AdminStats {
  totalUsers: number
  pendingApproval: number
  openOrders: number
}

export default function AdminOverviewPage() {
  const { profile } = useAuth()
  const { success, error: toastError } = useToast()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingApproval: 0,
    openOrders: 0,
  })
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const supabase = createClient()

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: pendingApproval } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .eq('is_admin', false)

      const { count: openOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['requested', 'confirmed', 'scheduled', 'measuring', 'individual_request'])

      setStats({
        totalUsers: totalUsers ?? 0,
        pendingApproval: pendingApproval ?? 0,
        openOrders: openOrders ?? 0,
      })

      const { data: pending } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', false)
        .eq('is_admin', false)
        .order('created_at', { ascending: false })
        .limit(10)

      setPendingUsers((pending as unknown as Profile[]) ?? [])

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)

      setRecentOrders(orders ?? [])
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (userId: string) => {
    setApprovingId(userId)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', userId)

    if (error) {
      toastError('Fehler beim Freigeben des Nutzers')
    } else {
      success('Nutzer erfolgreich freigegeben')
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      setStats((prev) => ({
        ...prev,
        pendingApproval: Math.max(0, prev.pendingApproval - 1),
      }))
    }
    setApprovingId(null)
  }

  const displayName = profile
    ? profile.first_name || profile.email
    : ''

  const statCards = [
    {
      label: 'Registrierte Nutzer',
      value: stats.totalUsers,
      icon: Users,
      href: '/admin/users',
    },
    {
      label: 'Freigabe wartend',
      value: stats.pendingApproval,
      icon: Clock,
      href: '/admin/users',
    },
    {
      label: 'Offene Aufträge',
      value: stats.openOrders,
      icon: ClipboardList,
      href: '/admin/orders',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--theme-surface)] rounded-2xl" />
          ))}
        </div>
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Admin Übersicht</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Willkommen zurück, {displayName}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    }}
                  >
                    <stat.icon size={24} className="text-white" />
                  </div>
                </div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--theme-textSecondary)]">{stat.label}</div>
              </motion.div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[var(--theme-text)]">Freigabe erforderlich</h3>
            <Link
              href="/admin/users"
              className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
            >
              Alle Nutzer
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--theme-text)]">
                    {user.first_name} {user.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--theme-textSecondary)]">
                      {accountTypeLabels[user.account_type] ?? user.account_type}
                    </span>
                    <span className="text-xs text-[var(--theme-textTertiary)]">
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
                  >
                    <Eye size={14} />
                    Ansehen
                  </Link>
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={approvingId === user.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 border border-[var(--color-success)]/30 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    Freigeben
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[var(--theme-text)]">Letzte Aufträge</h3>
          <Link
            href="/admin/orders"
            className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            Alle Aufträge
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center">
            <ClipboardList size={24} className="mx-auto text-[var(--theme-textTertiary)] mb-2" />
            <p className="text-sm text-[var(--theme-textTertiary)]">Keine Aufträge vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--accent-primary)]/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--theme-text)]">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-[var(--theme-textSecondary)] mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
