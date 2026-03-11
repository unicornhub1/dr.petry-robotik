'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  XCircle,
  CalendarDays,
} from 'lucide-react'
import { Card, Dropdown, Input, Textarea, StatusBadge, Modal, PriceDisplay, useToast } from '@/components/ui'
import ChatWindow from '@/components/chat/ChatWindow'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { triggerEvent } from '@/lib/notifications/trigger'
import type { Order, OrderStatus, Booking } from '@/lib/supabase/types'

interface OrderDetail extends Order {
  profiles?: {
    first_name: string
    last_name: string
    email: string
  } | null
}

interface OrderItemDetail {
  id: string
  item_price: number | null
  facilities: { name: string; address: string | null } | null
  packages: { name: string } | null
}

const allStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'requested', label: 'Angefragt' },
  { value: 'confirmed', label: 'Bestätigt' },
  { value: 'scheduled', label: 'Geplant' },
  { value: 'measuring', label: 'In Messung' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'individual_request', label: 'Individualanfrage' },
]

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [items, setItems] = useState<OrderItemDetail[]>([])
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('requested')
  const [adminNotes, setAdminNotes] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  // Booking form
  const [bookingDate, setBookingDate] = useState('')
  const [bookingStartTime, setBookingStartTime] = useState('')
  const [bookingEndTime, setBookingEndTime] = useState('')
  const [savingBooking, setSavingBooking] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const supabase = createClient()

      const { data: orderData } = await supabase
        .from('orders')
        .select('*, profiles(first_name, last_name, email)')
        .eq('id', orderId)
        .single()

      if (orderData) {
        const o = orderData as unknown as OrderDetail
        setOrder(o)
        setSelectedStatus(o.status)
        setAdminNotes(o.admin_notes ?? '')
      }

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, item_price, facilities(name, address), packages(name)')
        .eq('order_id', orderId)

      setItems((itemsData as unknown as OrderItemDetail[]) ?? [])

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle()

      if (bookingData) {
        setBooking(bookingData)
        setBookingDate(bookingData.date)
        setBookingStartTime(bookingData.start_time)
        setBookingEndTime(bookingData.end_time)
      }

      // Mark admin messages as read
      if (user) {
        await supabase
          .from('messages')
          .update({ admin_read_at: new Date().toISOString() })
          .eq('order_id', orderId)
          .neq('sender_id', user.id)
          .is('admin_read_at', null)
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }, [orderId, user])

  useEffect(() => {
    if (orderId) fetchOrder()
  }, [orderId, fetchOrder])

  const handleSaveStatus = async () => {
    if (!order) return
    setSavingStatus(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: selectedStatus })
      .eq('id', order.id)

    if (error) {
      toastError('Fehler beim Speichern')
    } else {
      success('Status aktualisiert')
      setOrder({ ...order, status: selectedStatus })

      // Trigger appropriate notification event
      if (selectedStatus === 'confirmed') {
        triggerEvent('order_confirmed', { orderId: order.id })
      } else if (selectedStatus === 'rejected') {
        triggerEvent('order_rejected', { orderId: order.id })
      } else {
        triggerEvent('order_status_changed', { orderId: order.id, newStatus: selectedStatus })
      }
    }
    setSavingStatus(false)
  }

  const handleSaveNotes = async () => {
    if (!order) return
    setSavingNotes(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ admin_notes: adminNotes })
      .eq('id', order.id)

    if (error) {
      toastError('Fehler beim Speichern')
    } else {
      success('Notizen gespeichert')
    }
    setSavingNotes(false)
  }

  const handleReject = async () => {
    if (!order) return
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: 'rejected' as OrderStatus })
      .eq('id', order.id)

    if (error) {
      toastError('Fehler beim Ablehnen')
    } else {
      success('Auftrag abgelehnt')
      setOrder({ ...order, status: 'rejected' })
      setSelectedStatus('rejected')
      triggerEvent('order_rejected', { orderId: order.id })
    }
    setRejectModalOpen(false)
  }

  const handleSaveBooking = async () => {
    if (!order || !bookingDate || !bookingStartTime || !bookingEndTime) return
    setSavingBooking(true)
    const supabase = createClient()

    const payload = {
      order_id: order.id,
      date: bookingDate,
      start_time: bookingStartTime,
      end_time: bookingEndTime,
    }

    if (booking) {
      const { error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', booking.id)

      if (error) {
        toastError('Fehler beim Speichern')
      } else {
        success('Termin aktualisiert')
        fetchOrder()
      }
    } else {
      const { error } = await supabase
        .from('bookings')
        .insert(payload)

      if (error) {
        toastError('Fehler beim Erstellen')
      } else {
        success('Termin zugewiesen')
        fetchOrder()
      }
    }
    setSavingBooking(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--theme-textSecondary)]">Auftrag nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/orders')}
          className="p-2 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surface)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">
            {order.order_number}
          </h1>
          <p className="text-[var(--theme-textSecondary)]">
            {order.profiles
              ? `${order.profiles.first_name} ${order.profiles.last_name} (${order.profiles.email})`
              : '-'}
          </p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card hover={false}>
            <h3 className="font-semibold text-[var(--theme-text)] mb-4">Auftragsdetails</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--theme-background)] border border-[var(--theme-border)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--theme-text)]">
                      {item.facilities?.name ?? 'Anlage'}
                    </p>
                    <p className="text-xs text-[var(--theme-textSecondary)]">
                      {item.packages?.name ?? 'Paket'} {item.facilities?.address ? ` - ${item.facilities.address}` : ''}
                    </p>
                  </div>
                  <PriceDisplay priceInCents={item.item_price} isApproved={true} />
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-[var(--theme-textTertiary)]">Keine Positionen</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--theme-border)] flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--theme-textSecondary)]">Gesamt</span>
              <PriceDisplay priceInCents={order.total_price} isApproved={true} className="text-lg" />
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-[var(--theme-border)]">
                <p className="text-xs text-[var(--theme-textTertiary)] mb-1">Kundennotizen</p>
                <p className="text-sm text-[var(--theme-text)]">{order.notes}</p>
              </div>
            )}
          </Card>

          {/* Status Change */}
          <Card hover={false}>
            <h3 className="font-semibold text-[var(--theme-text)] mb-4">Status ändern</h3>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Dropdown
                  options={allStatuses}
                  value={selectedStatus}
                  onChange={(v) => setSelectedStatus(v as OrderStatus)}
                  label="Neuer Status"
                />
              </div>
              <button
                onClick={handleSaveStatus}
                disabled={savingStatus || selectedStatus === order.status}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={16} />
                {savingStatus ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setRejectModalOpen(true)}
                disabled={order.status === 'rejected'}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-error)] bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 border border-[var(--color-error)]/30 transition-colors disabled:opacity-50"
              >
                <XCircle size={14} />
                Auftrag ablehnen
              </button>
            </div>
          </Card>

          {/* Admin Notes */}
          <Card hover={false}>
            <h3 className="font-semibold text-[var(--theme-text)] mb-4">Admin Notizen</h3>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Interne Notizen zum Auftrag..."
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={16} />
                {savingNotes ? 'Speichern...' : 'Notizen speichern'}
              </button>
            </div>
          </Card>

          {/* Booking */}
          <Card hover={false}>
            <h3 className="font-semibold text-[var(--theme-text)] mb-4">
              <CalendarDays size={16} className="inline mr-2" />
              Terminplanung
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Datum"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
              <Input
                label="Startzeit"
                type="time"
                value={bookingStartTime}
                onChange={(e) => setBookingStartTime(e.target.value)}
              />
              <Input
                label="Endzeit"
                type="time"
                value={bookingEndTime}
                onChange={(e) => setBookingEndTime(e.target.value)}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveBooking}
                disabled={savingBooking || !bookingDate || !bookingStartTime || !bookingEndTime}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={16} />
                {savingBooking ? 'Speichern...' : booking ? 'Termin aktualisieren' : 'Termin zuweisen'}
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 h-[600px]">
            <ChatWindow orderId={orderId} userRole="admin" />
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Auftrag ablehnen"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--theme-textSecondary)]">
            Möchten Sie diesen Auftrag wirklich ablehnen? Der Kunde wird darüber informiert.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-error)] text-white hover:opacity-90 transition-opacity"
            >
              Ablehnen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
