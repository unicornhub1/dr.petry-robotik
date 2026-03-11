import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification, createAdminNotification } from './service'
import { sendTemplateEmail } from '@/lib/email/service'

export async function onUserRegistered(userId: string) {
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single()

  if (!profile) return

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createAdminNotification({
    type: 'user_registered',
    title: 'Neue Registrierung',
    body: `${fullName || profile.email} hat sich registriert.`,
    link: '/admin/users',
  })

  // Admin email
  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('is_admin', true)

  for (const admin of admins ?? []) {
    await sendTemplateEmail({
      to: admin.email,
      templateKey: 'admin_new_user',
      variables: {
        user_name: fullName || 'Neuer Nutzer',
        user_email: profile.email,
      },
    })
  }
}

export async function onAccountApproved(userId: string) {
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single()

  if (!profile) return

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createNotification({
    userId,
    type: 'account_approved',
    title: 'Konto freigeschaltet',
    body: 'Ihr Konto wurde freigeschaltet. Sie können jetzt Messaufträge erstellen.',
    link: '/dashboard',
  })

  await sendTemplateEmail({
    to: profile.email,
    templateKey: 'account_approved',
    variables: {
      user_name: fullName || 'Kunde',
    },
  })
}

export async function onAccountSuspended(userId: string) {
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single()

  if (!profile) return

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createNotification({
    userId,
    type: 'account_suspended',
    title: 'Konto gesperrt',
    body: 'Ihr Konto wurde vorübergehend gesperrt. Bitte kontaktieren Sie uns.',
    link: '/dashboard',
  })

  await sendTemplateEmail({
    to: profile.email,
    templateKey: 'account_suspended',
    variables: {
      user_name: fullName || 'Kunde',
    },
  })
}

export async function onOrderReceived(orderId: string) {
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, user_id, profiles!inner(first_name, last_name, email)')
    .eq('id', orderId)
    .single()

  if (!order) return

  const profile = (order as any).profiles
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createAdminNotification({
    type: 'order_received',
    title: 'Neuer Messauftrag',
    body: `Auftrag ${order.order_number} von ${fullName || profile.email}`,
    link: `/admin/orders`,
  })

  // Admin email
  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('is_admin', true)

  for (const admin of admins ?? []) {
    await sendTemplateEmail({
      to: admin.email,
      templateKey: 'order_received',
      variables: {
        order_number: order.order_number || orderId,
        user_name: fullName || 'Kunde',
      },
    })
  }
}

export async function onOrderConfirmed(orderId: string) {
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, user_id, profiles!inner(first_name, last_name, email)')
    .eq('id', orderId)
    .single()

  if (!order) return

  const profile = (order as any).profiles
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createNotification({
    userId: order.user_id,
    type: 'order_confirmed',
    title: 'Auftrag bestätigt',
    body: `Ihr Auftrag ${order.order_number} wurde bestätigt.`,
    link: `/dashboard/orders`,
  })

  await sendTemplateEmail({
    to: profile.email,
    templateKey: 'order_confirmed',
    variables: {
      order_number: order.order_number || orderId,
      user_name: fullName || 'Kunde',
    },
  })
}

export async function onOrderRejected(orderId: string) {
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, user_id, profiles!inner(first_name, last_name, email)')
    .eq('id', orderId)
    .single()

  if (!order) return

  const profile = (order as any).profiles
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createNotification({
    userId: order.user_id,
    type: 'order_rejected',
    title: 'Auftrag abgelehnt',
    body: `Ihr Auftrag ${order.order_number} wurde leider abgelehnt.`,
    link: `/dashboard/orders`,
  })

  await sendTemplateEmail({
    to: profile.email,
    templateKey: 'order_rejected',
    variables: {
      order_number: order.order_number || orderId,
      user_name: fullName || 'Kunde',
    },
  })
}

export async function onOrderStatusChanged(orderId: string, newStatus: string) {
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, user_id, profiles!inner(first_name, last_name, email)')
    .eq('id', orderId)
    .single()

  if (!order) return

  const profile = (order as any).profiles
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const statusLabels: Record<string, string> = {
    confirmed: 'Bestätigt',
    scheduled: 'Terminiert',
    in_progress: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
  }

  await createNotification({
    userId: order.user_id,
    type: 'order_status_changed',
    title: 'Auftragsstatus aktualisiert',
    body: `Auftrag ${order.order_number}: ${statusLabels[newStatus] || newStatus}`,
    link: `/dashboard/orders`,
  })

  await sendTemplateEmail({
    to: profile.email,
    templateKey: 'order_status_changed',
    variables: {
      order_number: order.order_number || orderId,
      user_name: fullName || 'Kunde',
      new_status: statusLabels[newStatus] || newStatus,
    },
  })
}

export async function onNewMessage(messageId: string) {
  const supabase = createAdminClient()
  const { data: message } = await supabase
    .from('messages')
    .select('sender_id, order_id, content, orders!inner(order_number, user_id)')
    .eq('id', messageId)
    .single()

  if (!message) return

  const order = (message as any).orders
  const isFromAdmin = message.sender_id !== order.user_id
  const recipientId = isFromAdmin ? order.user_id : null

  if (recipientId) {
    // Notify customer
    await createNotification({
      userId: recipientId,
      type: 'new_message',
      title: 'Neue Nachricht',
      body: message.content?.substring(0, 100) || 'Sie haben eine neue Nachricht.',
      link: `/dashboard/orders`,
    })

    const { data: recipient } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', recipientId)
      .single()

    if (recipient) {
      const fullName = `${recipient.first_name} ${recipient.last_name}`.trim()
      await sendTemplateEmail({
        to: recipient.email,
        templateKey: 'new_message',
        variables: {
          user_name: fullName || 'Kunde',
          order_number: order.order_number || '',
          message_preview: message.content?.substring(0, 200) || '',
        },
      })
    }
  } else {
    // Notify admin about customer message
    await createAdminNotification({
      type: 'new_message',
      title: 'Neue Kundennachricht',
      body: `Nachricht zu Auftrag ${order.order_number}`,
      link: `/admin/orders`,
    })
  }
}

export async function onResultsAvailable(resultId: string) {
  const supabase = createAdminClient()
  const { data: result } = await supabase
    .from('results')
    .select('order_id, orders!inner(order_number, user_id, profiles!inner(first_name, last_name, email))')
    .eq('id', resultId)
    .single()

  if (!result) return

  const order = (result as any).orders
  const profile = order.profiles
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createNotification({
    userId: order.user_id,
    type: 'results_available',
    title: 'Messergebnisse verfügbar',
    body: `Die Ergebnisse für Auftrag ${order.order_number} sind verfügbar.`,
    link: `/dashboard/results`,
  })

  await sendTemplateEmail({
    to: profile.email,
    templateKey: 'results_available',
    variables: {
      order_number: order.order_number || '',
      user_name: fullName || 'Kunde',
    },
  })
}

export async function onIndividualRequest(orderId: string) {
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, user_id, profiles!inner(first_name, last_name, email)')
    .eq('id', orderId)
    .single()

  if (!order) return

  const profile = (order as any).profiles
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  await createAdminNotification({
    type: 'individual_request',
    title: 'Individuelle Anfrage',
    body: `${fullName || profile.email} hat eine individuelle Anfrage gestellt.`,
    link: `/admin/orders`,
  })

  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('is_admin', true)

  for (const admin of admins ?? []) {
    await sendTemplateEmail({
      to: admin.email,
      templateKey: 'individual_request',
      variables: {
        order_number: order.order_number || orderId,
        user_name: fullName || 'Kunde',
      },
    })
  }
}
