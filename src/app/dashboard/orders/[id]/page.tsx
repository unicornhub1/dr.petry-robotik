'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Package } from 'lucide-react'
import { StatusBadge, PriceDisplay, Card } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import ChatWindow from '@/components/chat/ChatWindow'
import type { Order, Booking } from '@/lib/supabase/types'

interface OrderItemWithRelations {
  id: string
  facility: { name: string; address: string | null } | null
  package: { name: string } | null
  item_price: number | null
}

export default function OrderDetailPage() {
  const { user, isApproved } = useAuth()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItemWithRelations[]>([])
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      const supabase = createClient()

      const [{ data: orderData }, { data: itemsData }, { data: bookingData }] =
        await Promise.all([
          supabase.from('orders').select('*').eq('id', orderId).single(),
          supabase
            .from('order_items')
            .select('id, item_price, facilities(name, address), packages(name)')
            .eq('order_id', orderId),
          supabase
            .from('bookings')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle(),
        ])

      setOrder(orderData)
      setItems(
        (itemsData ?? []).map((item: Record<string, unknown>) => ({
          id: item.id as string,
          facility: item.facilities as { name: string; address: string | null } | null,
          package: item.packages as { name: string } | null,
          item_price: item.item_price as number | null,
        }))
      )
      setBooking(bookingData)
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-[var(--theme-surface)] rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-[var(--theme-surface)] rounded-2xl" />
          <div className="h-96 bg-[var(--theme-surface)] rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--theme-textSecondary)]">Auftrag nicht gefunden.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">
            Auftrag {order.order_number}
          </h1>
          <p className="text-[var(--theme-textSecondary)]">
            Erstellt am {new Date(order.created_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Order Info */}
        <div className="space-y-4">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-[var(--theme-textSecondary)]" />
              <h2 className="text-base font-semibold text-[var(--theme-text)]">Auftragsposten</h2>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-[var(--theme-border)] last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--theme-text)]">
                      {item.facility?.name ?? 'Unbekannte Anlage'}
                    </p>
                    <p className="text-xs text-[var(--theme-textSecondary)]">
                      {item.package?.name ?? 'Kein Paket'}
                      {item.facility?.address ? ` · ${item.facility.address}` : ''}
                    </p>
                  </div>
                  <PriceDisplay
                    priceInCents={item.item_price}
                    isApproved={isApproved}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Booking Date */}
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-[var(--theme-textSecondary)]" />
                <h2 className="text-base font-semibold text-[var(--theme-text)]">Termin</h2>
              </div>
              <p className="text-sm text-[var(--theme-text)]">
                {new Date(booking.date + 'T00:00:00').toLocaleDateString('de-DE', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-[var(--theme-textSecondary)] mt-1">
                {booking.start_time} - {booking.end_time} Uhr
              </p>
            </motion.div>
          )}

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--theme-text)]">Gesamtpreis</h2>
                {order.discount_percent && order.discount_percent > 0 && (
                  <p className="text-xs text-[var(--color-success)]">
                    inkl. {order.discount_percent}% Rabatt
                  </p>
                )}
              </div>
              <PriceDisplay
                priceInCents={order.total_price}
                isApproved={isApproved}
                className="text-xl font-bold"
              />
            </div>
          </motion.div>

          {/* Notes */}
          {order.notes && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)]"
            >
              <h2 className="text-base font-semibold text-[var(--theme-text)] mb-2">Anmerkungen</h2>
              <p className="text-sm text-[var(--theme-textSecondary)]">{order.notes}</p>
            </motion.div>
          )}
        </div>

        {/* Right: Chat */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:h-[calc(100vh-16rem)]"
        >
          <ChatWindow orderId={orderId} />
        </motion.div>
      </div>
    </div>
  )
}
