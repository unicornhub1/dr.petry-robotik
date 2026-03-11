'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Send, Search } from 'lucide-react'
import { Input, Textarea, Dropdown, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

type RecipientMode = 'all' | 'single'

export default function AdminNotificationsPage() {
  const { success, error: toastError } = useToast()
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all')
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('last_name', { ascending: true })

      setUsers((data as unknown as Profile[]) ?? [])
      setFilteredUsers((data as unknown as Profile[]) ?? [])
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
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Nachrichten senden</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Benachrichtigungen an Kunden senden
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="space-y-5">
          {/* Recipient Mode */}
          <Dropdown
            label="Empfänger"
            options={recipientOptions}
            value={recipientMode}
            onChange={(v) => {
              setRecipientMode(v as RecipientMode)
              setSelectedUserId('')
            }}
          />

          {/* User Search & Select */}
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

          {/* Title */}
          <Input
            label="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Benachrichtigungstitel"
          />

          {/* Body */}
          <Textarea
            label="Nachricht"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Nachrichteninhalt (optional)"
          />

          {/* Summary */}
          <div className="p-3 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <p className="text-xs text-[var(--theme-textTertiary)]">
              {recipientMode === 'all'
                ? `Wird an ${users.length} Kunden gesendet`
                : selectedUserId
                  ? `Wird an 1 Kunden gesendet`
                  : 'Kein Empfänger ausgewählt'}
            </p>
          </div>

          {/* Send Button */}
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
    </div>
  )
}
