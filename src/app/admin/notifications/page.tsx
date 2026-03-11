'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, Clock, Users as UsersIcon, User } from 'lucide-react'
import { Input, Textarea, Dropdown, EmptyState, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Notification } from '@/lib/supabase/types'

type RecipientMode = 'all' | 'single'
type Tab = 'send' | 'history'

interface SentGroup {
  title: string
  body: string | null
  created_at: string
  recipientCount: number
  recipients: string[]
}

export default function AdminNotificationsPage() {
  const { success, error: toastError } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('send')
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all')
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  // History
  const [sentGroups, setSentGroups] = useState<SentGroup[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

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

  // Fetch sent history when tab switches
  useEffect(() => {
    if (activeTab !== 'history') return

    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('notifications')
          .select('*, profiles(first_name, last_name, email)')
          .eq('type', 'admin_message')
          .order('created_at', { ascending: false })
          .limit(200)

        if (!data) {
          setSentGroups([])
          return
        }

        // Group notifications by title + created_at (within 1 minute = same batch)
        const groups: SentGroup[] = []
        const typed = data as unknown as (Notification & { profiles: { first_name: string; last_name: string; email: string } | null })[]

        for (const n of typed) {
          const timestamp = new Date(n.created_at).getTime()
          const existing = groups.find(
            (g) => g.title === n.title && Math.abs(new Date(g.created_at).getTime() - timestamp) < 60000
          )

          const recipientName = n.profiles
            ? `${n.profiles.first_name} ${n.profiles.last_name}`
            : 'Unbekannt'

          if (existing) {
            existing.recipientCount++
            if (existing.recipients.length < 3) {
              existing.recipients.push(recipientName)
            }
          } else {
            groups.push({
              title: n.title,
              body: n.body,
              created_at: n.created_at,
              recipientCount: 1,
              recipients: [recipientName],
            })
          }
        }

        setSentGroups(groups)
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [activeTab])

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

    // Insert in batches of 100
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Nachrichten</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Benachrichtigungen an Kunden senden und Verlauf einsehen
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] w-fit">
        {([
          { key: 'send', label: 'Neue Nachricht', icon: Send },
          { key: 'history', label: 'Verlauf', icon: Clock },
        ] as const).map((tab) => (
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
          </button>
        ))}
      </div>

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

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-3"
        >
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-[var(--theme-surface)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sentGroups.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Keine Nachrichten gesendet"
              description="Noch keine Benachrichtigungen versendet."
            />
          ) : (
            sentGroups.map((group, i) => (
              <motion.div
                key={`${group.title}-${group.created_at}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--theme-text)] mb-1">
                      {group.title}
                    </h3>
                    {group.body && (
                      <p className="text-sm text-[var(--theme-textSecondary)] mb-2 line-clamp-2">
                        {group.body}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[var(--theme-textTertiary)]">
                      <span className="inline-flex items-center gap-1">
                        {group.recipientCount === 1 ? <User size={12} /> : <UsersIcon size={12} />}
                        {group.recipientCount === 1
                          ? group.recipients[0]
                          : `${group.recipientCount} Empfänger`}
                      </span>
                      <span>
                        {new Date(group.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}
