'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, MessageSquare, ArrowLeft } from 'lucide-react'
import { Input, Textarea, Dropdown, EmptyState, useToast } from '@/components/ui'
import ChatWindow from '@/components/chat/ChatWindow'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

type RecipientMode = 'all' | 'single'
type Tab = 'chats' | 'send'

interface OrderChat {
  order_id: string
  order_number: string
  customer_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export default function AdminNotificationsPage() {
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
  const [selectedChat, setSelectedChat] = useState<OrderChat | null>(null)

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

  useEffect(() => {
    const fetchChats = async () => {
      setChatsLoading(true)
      try {
        const supabase = createClient()

        const { data: messages } = await supabase
          .from('messages')
          .select('order_id, content, created_at, sender_id, admin_read_at, orders!inner(order_number, user_id, profiles!inner(first_name, last_name))')
          .order('created_at', { ascending: false })

        if (!messages || messages.length === 0) {
          setChats([])
          setChatsLoading(false)
          return
        }

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
            profiles: { first_name: string; last_name: string }
          }
        }>) {
          const existing = chatMap.get(msg.order_id)

          if (!existing) {
            chatMap.set(msg.order_id, {
              order_id: msg.order_id,
              order_number: msg.orders.order_number,
              customer_name: `${msg.orders.profiles.first_name} ${msg.orders.profiles.last_name}`,
              last_message: msg.content,
              last_message_at: msg.created_at,
              unread_count: (!msg.admin_read_at && msg.sender_id === msg.orders.user_id) ? 1 : 0,
            })
          } else {
            if (!msg.admin_read_at && msg.sender_id === msg.orders.user_id) {
              existing.unread_count++
            }
          }
        }

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

    if (diffMins < 1) return 'Jetzt'
    if (diffMins < 60) return `${diffMins} Min.`
    if (diffHours < 24) return `${diffHours} Std.`
    if (diffDays < 7) return `${diffDays} T.`
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
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
            onClick={() => { setActiveTab(tab.key); setSelectedChat(null) }}
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
          className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] overflow-hidden"
          style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}
        >
          <div className="flex h-full">
            {/* Chat List - Left */}
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
                      <p className="text-sm text-[var(--theme-textTertiary)]">Keine Chats</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 space-y-0.5">
                    {chats.map((chat) => (
                      <button
                        key={chat.order_id}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                          selectedChat?.order_id === chat.order_id
                            ? 'bg-[var(--accent-primary)]/10'
                            : 'hover:bg-[var(--theme-background)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-sm font-semibold truncate ${
                            chat.unread_count > 0 ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text)]'
                          }`}>
                            {chat.customer_name}
                          </span>
                          <span className="text-[10px] text-[var(--theme-textTertiary)] shrink-0">
                            {formatTime(chat.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate ${
                              chat.unread_count > 0
                                ? 'text-[var(--theme-text)] font-medium'
                                : 'text-[var(--theme-textSecondary)]'
                            }`}>
                              {chat.last_message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-[var(--accent-primary)] font-medium">
                              {chat.order_number}
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

            {/* Chat Window - Right */}
            <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
              {selectedChat ? (
                <>
                  {/* Mobile back button */}
                  <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-[var(--theme-border)]">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-1.5 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-background)] transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--theme-text)] truncate">
                        {selectedChat.customer_name}
                      </p>
                      <p className="text-[10px] text-[var(--accent-primary)]">
                        {selectedChat.order_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChatWindow orderId={selectedChat.order_id} />
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
