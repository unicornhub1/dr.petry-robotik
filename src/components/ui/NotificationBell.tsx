'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notification, Database } from '@/lib/supabase/types'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const fetchNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setNotifications(data)
  }, [supabase])

  const markAllRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Cast required due to Supabase type inference limitation with .update()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const markRead = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    await db.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  // Initial fetch + realtime subscription
  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications, supabase])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Gerade eben'
    if (mins < 60) return `vor ${mins} Min.`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `vor ${hours} Std.`
    return `vor ${Math.floor(hours / 24)} Tagen`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-[var(--radius-md)] text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surfaceHover)] transition-colors duration-[var(--transition-fast)]"
        aria-label="Benachrichtigungen"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-error)] text-white text-[10px] font-bold leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 w-80 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]">
              <span className="text-sm font-semibold text-[var(--theme-text)]">
                Benachrichtigungen
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-[var(--theme-textTertiary)]">
                    {unreadCount} ungelesen
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primaryHover)] transition-colors duration-[var(--transition-fast)]"
                >
                  Alle gelesen
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-[var(--theme-textTertiary)]">
                  Keine Benachrichtigungen
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`
                      flex gap-3 px-4 py-3 cursor-pointer border-b border-[var(--theme-border)] last:border-0
                      hover:bg-[var(--theme-surfaceHover)] transition-colors duration-[var(--transition-fast)]
                      ${!n.is_read ? 'bg-[var(--accent-primary)]/5' : ''}
                    `}
                  >
                    {!n.is_read && (
                      <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                    )}
                    <div className={`flex-1 min-w-0 ${n.is_read ? 'pl-5' : ''}`}>
                      <p className="text-sm font-medium text-[var(--theme-text)] truncate">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-[var(--theme-textSecondary)] mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-[var(--theme-textTertiary)] mt-1">
                        {formatTime(n.created_at)}
                      </p>
                    </div>
                    {n.link && (
                      <a
                        href={n.link}
                        className="flex-shrink-0 p-1 text-[var(--theme-textTertiary)] hover:text-[var(--accent-primary)] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
