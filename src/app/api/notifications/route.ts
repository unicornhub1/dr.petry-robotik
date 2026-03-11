import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  onUserRegistered,
  onAccountApproved,
  onAccountSuspended,
  onOrderReceived,
  onOrderConfirmed,
  onOrderRejected,
  onOrderStatusChanged,
  onNewMessage,
  onResultsAvailable,
  onIndividualRequest,
} from '@/lib/notifications/events'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { event, ...params } = body

    if (!event) {
      return NextResponse.json({ error: 'Event fehlt' }, { status: 400 })
    }

    switch (event) {
      case 'user_registered':
        await onUserRegistered(params.userId)
        break
      case 'account_approved':
        await onAccountApproved(params.userId)
        break
      case 'account_suspended':
        await onAccountSuspended(params.userId)
        break
      case 'order_received':
        await onOrderReceived(params.orderId)
        break
      case 'order_confirmed':
        await onOrderConfirmed(params.orderId)
        break
      case 'order_rejected':
        await onOrderRejected(params.orderId)
        break
      case 'order_status_changed':
        await onOrderStatusChanged(params.orderId, params.newStatus)
        break
      case 'new_message':
        await onNewMessage(params.messageId)
        break
      case 'results_available':
        await onResultsAvailable(params.resultId)
        break
      case 'individual_request':
        await onIndividualRequest(params.orderId)
        break
      default:
        return NextResponse.json({ error: `Unbekanntes Event: ${event}` }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification event error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
