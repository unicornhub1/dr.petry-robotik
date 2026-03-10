'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  MapPin,
  ClipboardList,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { Card, StatusBadge, EmptyState } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { Order, Message } from '@/lib/supabase/types'

interface DashboardStats {
  facilitiesCount: number
  activeOrdersCount: number
  newResultsCount: number
}

export default function DashboardPage() {
  const { user, profile, isApproved } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    facilitiesCount: 0,
    activeOrdersCount: 0,
    newResultsCount: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentMessages, setRecentMessages] = useState<(Message & { order_number?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      const supabase = createClient()

      // Fetch facilities count
      const { count: facilitiesCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch active orders count
      const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['requested', 'confirmed', 'scheduled', 'measuring', 'individual_request'])

      // Fetch new results count (results from last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { count: newResultsCount } = await supabase
        .from('results')
        .select('*, orders!inner(user_id)', { count: 'exact', head: true })
        .eq('orders.user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      setStats({
        facilitiesCount: facilitiesCount ?? 0,
        activeOrdersCount: activeOrdersCount ?? 0,
        newResultsCount: newResultsCount ?? 0,
      })

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders(orders ?? [])

      // Fetch recent messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*, orders!inner(order_number, user_id)')
        .eq('orders.user_id', user.id)
        .is('customer_read_at', null)
        .neq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const mappedMessages = (messages ?? []).map((m: Record<string, unknown>) => ({
        ...(m as Message),
        order_number: (m.orders as Record<string, unknown>)?.order_number as string | undefined,
      }))
      setRecentMessages(mappedMessages)

      setLoading(false)
    }

    fetchDashboardData()
  }, [user])

  const displayName = profile
    ? profile.first_name || profile.email
    : ''

  const statCards = [
    {
      label: 'Sportanlagen',
      value: stats.facilitiesCount,
      icon: MapPin,
      href: '/dashboard/facilities',
    },
    {
      label: 'Aktive Auftraege',
      value: stats.activeOrdersCount,
      icon: ClipboardList,
      href: '/dashboard/orders',
    },
    {
      label: 'Neue Ergebnisse',
      value: stats.newResultsCount,
      icon: BarChart3,
      href: '/dashboard/results',
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Uebersicht</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Willkommen zurueck, {displayName}
        </p>
      </div>

      {/* Approval Banner */}
      {!isApproved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
        >
          <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Ihr Account wird geprueft. Wir melden uns in Kuerze.
          </p>
        </motion.div>
      )}

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--theme-text)]">Letzte Auftraege</h3>
              <Link
                href="/dashboard/orders"
                className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
              >
                Alle anzeigen
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Keine Auftraege vorhanden"
                description="Erstellen Sie Ihren ersten Messauftrag."
                action={{
                  label: 'Neuer Auftrag',
                  onClick: () => (window.location.href = '/dashboard/orders/new'),
                }}
              />
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
                      href={`/dashboard/orders/${order.id}`}
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

        {/* Recent Messages */}
        <div>
          <div className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--theme-text)]">Ungelesene Nachrichten</h3>
            </div>

            {recentMessages.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare size={24} className="mx-auto text-[var(--theme-textTertiary)] mb-2" />
                <p className="text-sm text-[var(--theme-textTertiary)]">
                  Keine neuen Nachrichten
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={`/dashboard/orders/${msg.order_id}`}
                      className="block p-3 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--accent-primary)]/30 transition-colors"
                    >
                      <p className="text-xs text-[var(--accent-primary)] font-medium mb-1">
                        {msg.order_number}
                      </p>
                      <p className="text-sm text-[var(--theme-text)] line-clamp-2">
                        {msg.content}
                      </p>
                      <p className="text-xs text-[var(--theme-textTertiary)] mt-1">
                        {new Date(msg.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
