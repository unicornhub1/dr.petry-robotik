'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell, ExternalLink, MessageSquare, ArrowLeft } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import ChatWindow from '@/components/chat/ChatWindow'
import CustomerDirectChatWindow from '@/components/chat/CustomerDirectChatWindow'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/supabase/types'

type Tab = 'chats' | 'notifications'

interface ChatEntry {
  id: string
  type: 'order' | 'direct'
  label: string
  sublabel: string
  last_message: string
  last_message_at: string
  unread_count: number
}

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
  const [activeTab, setActiveTab] = useState<Tab>('chats')

  // Chats
  const [chats, setChats] = useState<ChatEntry[]>([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<ChatEntry | null>(null)

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  const fetchChats = useCallback(async () => {
    if (!user) return
    setChatsLoading(true)
    try {
      const supabase = createClient()
      const entries: ChatEntry[] = []

      // 1. Order-based chats (from this user's orders)
      const { data: orderMessages } = await supabase
        .from('messages')
        .select('order_id, content, created_at, sender_id, customer_read_at, orders!inner(order_number, user_id)')
        .not('order_id', 'is', null)
        .order('created_at', { ascending: false })

      if (orderMessages) {
        const orderMap = new Map<string, ChatEntry>()
        for (const msg of orderMessages as unknown as Array<{
          order_id: string; content: string; created_at: string; sender_id: string; customer_read_at: string | null
          orders: { order_number: string; user_id: string }
        }>) {
          // Only show chats for this user's orders
          if (msg.orders.user_id !== user.id) continue

          const existing = orderMap.get(msg.order_id)
          if (!existing) {
            orderMap.set(msg.order_id, {
              id: msg.order_id,
              type: 'order',
              label: `Auftrag ${msg.orders.order_number}`,
              sublabel: msg.orders.order_number,
              last_message: msg.content ?? '',
              last_message_at: msg.created_at,
              unread_count: (!msg.customer_read_at && msg.sender_id !== user.id) ? 1 : 0,
            })
          } else if (!msg.customer_read_at && msg.sender_id !== user.id) {
            existing.unread_count++
          }
        }
        entries.push(...orderMap.values())
      }

      // 2. Direct chats (recipient_id = this user)
      const { data: directMessages } = await supabase
        .from('messages')
        .select('recipient_id, content, created_at, sender_id, customer_read_at')
        .is('order_id', null)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })

      if (directMessages && directMessages.length > 0) {
        let unread = 0
        let lastMsg = directMessages[0]
        for (const msg of directMessages) {
          if (!msg.customer_read_at && msg.sender_id !== user.id) {
            unread++
          }
        }
        entries.push({
          id: user.id,
          type: 'direct',
          label: 'Petry Robotik',
          sublabel: 'Direktnachricht',
          last_message: lastMsg.content ?? '',
          last_message_at: lastMsg.created_at,
          unread_count: unread,
        })
      }

      // Sort by latest message
      entries.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      setChats(entries)
    } catch (err) {
      console.error('Failed to fetch chats:', err)
    } finally {
      setChatsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  // Fetch notifications
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
        console.error('Failed to fetch notifications:', err)
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  // Group notifications by date
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Jetzt'
    if (diffMins < 60) return `${diffMins} Min.`
    if (diffHours < 24) return `${diffHours} Std.`
    if (diffDays < 7) return `${diffDays} T.`
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }

  const unreadChats = chats.filter((c) => c.unread_count > 0).length
  const unreadNotifications = notifications.filter((n) => !n.is_read).length

  if (chatsLoading && notificationsLoading) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Nachrichten</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Chats und Benachrichtigungen
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] w-fit">
        {([
          { key: 'chats' as Tab, label: 'Chats', icon: MessageSquare, badge: unreadChats },
          { key: 'notifications' as Tab, label: 'Benachrichtigungen', icon: Bell, badge: unreadNotifications },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedChat(null) }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)]'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.badge > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--accent-primary)] text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] overflow-hidden"
          style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}
        >
          <div className="flex h-full">
            {/* Chat List */}
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-[var(--theme-border)] shrink-0`}>
              <div className="p-3 border-b border-[var(--theme-border)]">
                <p className="text-xs font-semibold text-[var(--theme-textTertiary)] uppercase tracking-wider">
                  {chats.length} {chats.length === 1 ? 'Chat' : 'Chats'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chatsLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-[var(--theme-background)] rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : chats.length === 0 ? (
                  <div className="flex items-center justify-center h-full px-4">
                    <div className="text-center">
                      <MessageSquare size={24} className="mx-auto mb-2 text-[var(--theme-textTertiary)]" />
                      <p className="text-sm text-[var(--theme-textTertiary)]">Noch keine Chats</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 space-y-0.5">
                    {chats.map((chat) => (
                      <button
                        key={`${chat.type}-${chat.id}`}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                          selectedChat?.id === chat.id && selectedChat?.type === chat.type
                            ? 'bg-[var(--accent-primary)]/10'
                            : 'hover:bg-[var(--theme-background)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-[var(--theme-text)] truncate">
                            {chat.label}
                          </span>
                          <span className="text-[10px] text-[var(--theme-textTertiary)] shrink-0">
                            {formatTime(chat.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs truncate flex-1 ${
                            chat.unread_count > 0
                              ? 'text-[var(--theme-text)] font-medium'
                              : 'text-[var(--theme-textSecondary)]'
                          }`}>
                            {chat.last_message}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-medium ${
                              chat.type === 'direct'
                                ? 'text-emerald-500'
                                : 'text-[var(--accent-primary)]'
                            }`}>
                              {chat.type === 'order' ? chat.sublabel : 'Direkt'}
                            </span>
                            {chat.unread_count > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-semibold">
                                {chat.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
              {selectedChat ? (
                <>
                  <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-[var(--theme-border)]">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-1.5 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-background)] transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--theme-text)] truncate">
                        {selectedChat.label}
                      </p>
                      <p className={`text-[10px] ${selectedChat.type === 'direct' ? 'text-emerald-500' : 'text-[var(--accent-primary)]'}`}>
                        {selectedChat.type === 'order' ? selectedChat.sublabel : 'Direktnachricht'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    {selectedChat.type === 'order' ? (
                      <ChatWindow orderId={selectedChat.id} />
                    ) : (
                      <CustomerDirectChatWindow />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center px-6">
                    <MessageSquare size={32} className="mx-auto mb-3 text-[var(--theme-textTertiary)]" />
                    <p className="text-sm text-[var(--theme-textTertiary)]">
                      Chat auswählen um die Konversation zu sehen
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
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
        </motion.div>
      )}
    </div>
  )
}
