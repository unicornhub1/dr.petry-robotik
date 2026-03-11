'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell, ExternalLink } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/supabase/types'

interface GroupedNotifications {
  date: string
  label: string
  items: Notification[]
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Heute'
  if (isSameDay(date, yesterday)) return 'Gestern'

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const supabase = createClient()

        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setNotifications(data ?? [])

        // Mark unread as read
        const unreadIds = (data ?? [])
          .filter((n) => !n.is_read)
          .map((n) => n.id)

        if (unreadIds.length > 0) {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds)
        }
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  // Group by date
  const grouped: GroupedNotifications[] = notifications.reduce(
    (groups: GroupedNotifications[], notification) => {
      const dateStr = notification.created_at.split('T')[0]
      const existing = groups.find((g) => g.date === dateStr)

      if (existing) {
        existing.items.push(notification)
      } else {
        groups.push({
          date: dateStr,
          label: formatDateLabel(notification.created_at),
          items: [notification],
        })
      }

      return groups
    },
    []
  )

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--theme-surface)] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Benachrichtigungen</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Alle Benachrichtigungen auf einen Blick
        </p>
      </div>

      {/* Content */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Keine Benachrichtigungen"
          description="Sie haben derzeit keine Benachrichtigungen."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.date}>
              <h2 className="text-xs font-semibold text-[var(--theme-textTertiary)] uppercase tracking-wider mb-3">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.items.map((notification, i) => {
                  const itemClassName = `
                    block p-4 rounded-xl border transition-colors
                    ${notification.is_read
                      ? 'border-[var(--theme-border)] bg-[var(--theme-surface)]'
                      : 'border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5'
                    }
                    ${notification.link ? 'hover:border-[var(--accent-primary)]/30 cursor-pointer' : ''}
                  `

                  const itemContent = (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shrink-0" />
                          )}
                          <h3 className="text-sm font-medium text-[var(--theme-text)]">
                            {notification.title}
                          </h3>
                        </div>
                        {notification.body && (
                          <p className="text-sm text-[var(--theme-textSecondary)] mt-1">
                            {notification.body}
                          </p>
                        )}
                        <p className="text-xs text-[var(--theme-textTertiary)] mt-2">
                          {new Date(notification.created_at).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} Uhr
                        </p>
                      </div>
                      {notification.link && (
                        <ExternalLink
                          size={14}
                          className="text-[var(--theme-textTertiary)] shrink-0 mt-1"
                        />
                      )}
                    </div>
                  )

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {notification.link ? (
                        <Link href={notification.link} className={itemClassName}>
                          {itemContent}
                        </Link>
                      ) : (
                        <div className={itemClassName}>
                          {itemContent}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
