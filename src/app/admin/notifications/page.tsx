'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Send, Search, MessageSquare, Clock, Users as UsersIcon, User, ArrowRight } from 'lucide-react'
import { Input, Textarea, Dropdown, EmptyState, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

type RecipientMode = 'all' | 'single'
type Tab = 'chats' | 'send'

interface OrderChat {
  order_id: string
  order_number: string
  customer_name: string
  customer_email: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('chats')

  // Send form
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all')
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  // Chats
  const [chats, setChats] = useState<OrderChat[]>([])
  const [chatsLoading, setChatsLoading] = useState(true)

  // Fetch users for send form
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_admin', false)
          .order('last_name', { ascending: true })

        setUsers((data as unknown as Profile[]) ?? [])
        setFilteredUsers((data as unknown as Profile[]) ?? [])
      } catch (err) {
        console.error('Failed to fetch users:', err)
      }
    }

    fetchUsers()
  }, [])

  // Fetch active chats
  useEffect(() => {
    const fetchChats = async () => {
      setChatsLoading(true)
      try {
        const supabase = createClient()

        // Get all orders that have messages, with latest message info
        const { data: messages } = await supabase
          .from('messages')
          .select('order_id, content, created_at, sender_id, admin_read_at, orders!inner(order_number, user_id, profiles!inner(first_name, last_name, email))')
          .order('created_at', { ascending: false })

        if (!messages || messages.length === 0) {
          setChats([])
          setChatsLoading(false)
          return
        }

        // Group by order_id, take latest message per order
        const chatMap = new Map<string, OrderChat>()

        for (const msg of messages as unknown as Array<{
          order_id: string
          content: string
          created_at: string
          sender_id: string
          admin_read_at: string | null
          orders: {
            order_number: string
            user_id: string
            profiles: { first_name: string; last_name: string; email: string }
          }
        }>) {
          const existing = chatMap.get(msg.order_id)

          if (!existing) {
            chatMap.set(msg.order_id, {
              order_id: msg.order_id,
              order_number: msg.orders.order_number,
              customer_name: `${msg.orders.profiles.first_name} ${msg.orders.profiles.last_name}`,
              customer_email: msg.orders.profiles.email,
              last_message: msg.content,
              last_message_at: msg.created_at,
              unread_count: (!msg.admin_read_at && msg.sender_id === msg.orders.user_id) ? 1 : 0,
            })
          } else {
            // Count unread (messages from customer that admin hasn't read)
            if (!msg.admin_read_at && msg.sender_id === msg.orders.user_id) {
              existing.unread_count++
            }
          }
        }

        // Sort by latest message
        const sorted = Array.from(chatMap.values()).sort(
          (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        )

        setChats(sorted)
      } catch (err) {
        console.error('Failed to fetch chats:', err)
      } finally {
        setChatsLoading(false)
      }
    }

    fetchChats()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }
    const q = searchQuery.toLowerCase()
    setFilteredUsers(
      users.filter(
        (u) =>
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    )
  }, [searchQuery, users])

  const handleSend = async () => {
    if (!title.trim()) {
      toastError('Bitte Titel eingeben')
      return
    }

    if (recipientMode === 'single' && !selectedUserId) {
      toastError('Bitte einen Empfänger auswählen')
      return
    }

    setSending(true)
    const supabase = createClient()

    const targetUsers =
      recipientMode === 'all'
        ? users
        : users.filter((u) => u.id === selectedUserId)

    const notifications = targetUsers.map((u) => ({
      user_id: u.id,
      type: 'admin_message',
      title: title.trim(),
      body: body.trim() || null,
      is_read: false,
    }))

    for (let i = 0; i < notifications.length; i += 100) {
      const batch = notifications.slice(i, i + 100)
      const { error } = await supabase.from('notifications').insert(batch)
      if (error) {
        toastError('Fehler beim Senden')
        setSending(false)
        return
      }
    }

    setSending(false)
    success(`Nachricht an ${targetUsers.length} Nutzer gesendet`)
    setTitle('')
    setBody('')
    setSelectedUserId('')
  }

  const recipientOptions = [
    { value: 'all', label: 'Alle Kunden' },
    { value: 'single', label: 'Einzelner Kunde' },
  ]

  const userOptions = filteredUsers.map((u) => ({
    value: u.id,
    label: `${u.first_name} ${u.last_name} (${u.email})`,
  }))

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `vor ${diffMins} Min.`
    if (diffHours < 24) return `vor ${diffHours} Std.`
    if (diffDays < 7) return `vor ${diffDays} Tagen`
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Nachrichten</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Chats mit Kunden und Benachrichtigungen
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] w-fit">
        {([
          { key: 'chats' as Tab, label: 'Chats', icon: MessageSquare },
          { key: 'send' as Tab, label: 'Benachrichtigung senden', icon: Send },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)]'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.key === 'chats' && chats.some((c) => c.unread_count > 0) && (
              <span className="w-2 h-2 rounded-full bg-white/80" />
            )}
          </button>
        ))}
      </div>

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-2"
        >
          {chatsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[var(--theme-surface)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Keine Chats"
              description="Noch keine Nachrichten von Kunden erhalten."
            />
          ) : (
            chats.map((chat, i) => (
              <motion.div
                key={chat.order_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => router.push(`/admin/orders/${chat.order_id}`)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                    chat.unread_count > 0
                      ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20 hover:border-[var(--accent-primary)]/40'
                      : 'bg-[var(--theme-surface)] border-[var(--theme-border)] hover:border-[var(--accent-primary)]/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {chat.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-semibold">
                            {chat.unread_count}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-[var(--theme-text)] truncate">
                          {chat.customer_name}
                        </span>
                        <span className="text-xs text-[var(--accent-primary)] font-medium">
                          {chat.order_number}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--theme-textSecondary)] truncate">
                        {chat.last_message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[var(--theme-textTertiary)]">
                        {formatTime(chat.last_message_at)}
                      </span>
                      <ArrowRight size={14} className="text-[var(--theme-textTertiary)]" />
                    </div>
                  </div>
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Send Tab */}
      {activeTab === 'send' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
        >
          <div className="space-y-5">
            <Dropdown
              label="Empfänger"
              options={recipientOptions}
              value={recipientMode}
              onChange={(v) => {
                setRecipientMode(v as RecipientMode)
                setSelectedUserId('')
              }}
            />

            {recipientMode === 'single' && (
              <div className="space-y-3">
                <Input
                  label="Nutzer suchen"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name oder E-Mail eingeben..."
                  leftIcon={<Search size={16} />}
                />
                <Dropdown
                  label="Nutzer auswählen"
                  options={userOptions}
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  placeholder="Nutzer wählen..."
                />
              </div>
            )}

            <Input
              label="Titel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Benachrichtigungstitel"
            />

            <Textarea
              label="Nachricht"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Nachrichteninhalt (optional)"
            />

            <div className="p-3 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)]">
              <p className="text-xs text-[var(--theme-textTertiary)]">
                {recipientMode === 'all'
                  ? `Wird an ${users.length} Kunden gesendet`
                  : selectedUserId
                    ? `Wird an 1 Kunden gesendet`
                    : 'Kein Empfänger ausgewählt'}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSend}
                disabled={sending || !title.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? 'Wird gesendet...' : 'Nachricht senden'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
