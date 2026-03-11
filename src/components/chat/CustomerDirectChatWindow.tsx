'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import type { Message } from '@/lib/supabase/types'
import ChatBubble from './ChatBubble'

export default function CustomerDirectChatWindow() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch direct messages where this customer is the recipient thread
  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .is('order_id', null)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: true })

      setMessages(data ?? [])
    }

    fetchMessages()

    // Subscribe to realtime
    const channel = supabase
      .channel(`customer-direct:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          if (!newMsg.order_id) {
            setMessages((prev) => [...prev, newMsg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Mark admin messages as read (customer_read_at)
  useEffect(() => {
    if (!user || messages.length === 0) return

    const unread = messages.filter(
      (m) => m.sender_id !== user.id && !m.customer_read_at
    )
    if (unread.length === 0) return

    const markAsRead = async () => {
      const supabase = createClient()
      await supabase
        .from('messages')
        .update({ customer_read_at: new Date().toISOString() })
        .is('order_id', null)
        .eq('recipient_id', user.id)
        .neq('sender_id', user.id)
        .is('customer_read_at', null)
    }
    markAsRead()
  }, [messages, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    if (!user || !newMessage.trim()) return
    setSending(true)

    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({
      recipient_id: user.id,
      sender_id: user.id,
      content: newMessage.trim(),
      type: 'text',
    })

    if (!error) {
      setNewMessage('')
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header (desktop only) */}
      <div className="hidden md:block px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <h3 className="text-sm font-semibold text-[var(--theme-text)]">Direktnachricht</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--theme-textTertiary)]">
              Noch keine Nachrichten.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            content={msg.content}
            type={msg.type}
            isSelf={msg.sender_id === user?.id}
            senderName={msg.sender_id === user?.id ? 'Sie' : 'Petry Robotik'}
            timestamp={msg.created_at}
            fileUrl={msg.file_url}
            fileName={msg.file_name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            rows={1}
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className={`
              p-2 rounded-lg transition-colors shrink-0
              ${newMessage.trim()
                ? 'bg-[var(--accent-primary)] text-white hover:opacity-90'
                : 'bg-[var(--theme-surfaceHover)] text-[var(--theme-textTertiary)]'
              }
              disabled:opacity-50
            `}
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
