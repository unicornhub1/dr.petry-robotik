'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ClipboardList, MessageSquare } from 'lucide-react'
import { Table, Dropdown, EmptyState, StatusBadge, PriceDisplay } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/lib/supabase/types'

interface OrderWithProfile extends Order {
  profiles?: {
    first_name: string
    last_name: string
  } | null
  unread_count?: number
}

const statusOptions = [
  { value: 'all', label: 'Alle Status' },
  { value: 'requested', label: 'Angefragt' },
  { value: 'confirmed', label: 'Bestaetigt' },
  { value: 'scheduled', label: 'Geplant' },
  { value: 'measuring', label: 'In Messung' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'individual_request', label: 'Individualanfrage' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient()

      let query = supabase
        .from('orders')
        .select('*, profiles(first_name, last_name)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data } = await query

      // Fetch unread message counts per order
      const orderIds = (data ?? []).map((o: Record<string, unknown>) => o.id as string)

      let unreadCounts: Record<string, number> = {}
      if (orderIds.length > 0) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('order_id')
          .in('order_id', orderIds)
          .is('admin_read_at', null)

        if (msgs) {
          unreadCounts = msgs.reduce((acc: Record<string, number>, m: Record<string, unknown>) => {
            const oid = m.order_id as string
            acc[oid] = (acc[oid] || 0) + 1
            return acc
          }, {})
        }
      }

      const enriched = (data ?? []).map((o: Record<string, unknown>) => ({
        ...(o as OrderWithProfile),
        unread_count: unreadCounts[o.id as string] || 0,
      }))

      setOrders(enriched)
      setLoading(false)
    }

    setLoading(true)
    fetchOrders()
  }, [statusFilter])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  const columns = [
    { key: 'order_number', label: 'Auftragsnr.', sortable: true },
    { key: 'customer', label: 'Kunde' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Erstellt', sortable: true },
    { key: 'total_price', label: 'Preis' },
    { key: 'messages', label: '' },
    { key: 'actions', label: '' },
  ]

  const tableData = orders.map((order) => ({
    order_number: (
      <span className="font-medium text-[var(--theme-text)]">{order.order_number}</span>
    ),
    customer: (
      <span className="text-[var(--theme-textSecondary)]">
        {order.profiles
          ? `${order.profiles.first_name} ${order.profiles.last_name}`
          : '-'}
      </span>
    ),
    status: <StatusBadge status={order.status} />,
    created_at: (
      <span className="text-[var(--theme-textSecondary)]">
        {new Date(order.created_at).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </span>
    ),
    total_price: (
      <PriceDisplay priceInCents={order.total_price} isApproved={true} />
    ),
    messages: order.unread_count && order.unread_count > 0 ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
        <MessageSquare size={12} />
        {order.unread_count}
      </span>
    ) : null,
    actions: (
      <Link
        href={`/admin/orders/${order.id}`}
        className="text-sm text-[var(--accent-primary)] hover:underline"
      >
        Details
      </Link>
    ),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Auftraege</h1>
          <p className="text-[var(--theme-textSecondary)]">
            Alle Kundenauftraege verwalten
          </p>
        </div>
        <div className="w-48">
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status filtern"
          />
        </div>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Keine Auftraege gefunden"
          description="Es gibt keine Auftraege mit diesem Filter."
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
