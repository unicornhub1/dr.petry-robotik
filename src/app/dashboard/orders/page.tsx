'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { Table, Button, EmptyState, StatusBadge, PriceDisplay, BlurredOverlay } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/supabase/types'

export default function OrdersPage() {
  const { user, isApproved } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(data ?? [])
      setLoading(false)
    }

    fetchOrders()
  }, [user])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  const columns = [
    { key: 'order_number', label: 'Auftragsnummer' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Erstellt am', sortable: true },
    { key: 'total_price', label: 'Preis' },
    { key: 'actions', label: '' },
  ]

  const tableData = orders.map((order) => ({
    order_number: (
      <span className="font-medium text-[var(--theme-text)]">{order.order_number}</span>
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
      <PriceDisplay priceInCents={order.total_price} isApproved={isApproved} />
    ),
    actions: (
      <Link
        href={`/dashboard/orders/${order.id}`}
        className="text-sm text-[var(--accent-primary)] hover:underline"
      >
        Details
      </Link>
    ),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Auftraege</h1>
          <p className="text-[var(--theme-textSecondary)]">
            Verwalten Sie Ihre Messauftraege
          </p>
        </div>
        <div className="relative">
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard/orders/new')}
          >
            Neuer Auftrag
          </Button>
          {!isApproved && (
            <BlurredOverlay message="Account-Freigabe erforderlich" />
          )}
        </div>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Keine Auftraege vorhanden"
          description="Erstellen Sie Ihren ersten Messauftrag."
          action={
            isApproved
              ? {
                  label: 'Neuer Auftrag',
                  onClick: () => router.push('/dashboard/orders/new'),
                }
              : undefined
          }
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
