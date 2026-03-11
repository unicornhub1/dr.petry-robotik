'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, Loader2, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { triggerEvent } from '@/lib/notifications/trigger'
import { useAuth } from '@/lib/auth/auth-context'
import type { Message } from '@/lib/supabase/types'
import ChatBubble from './ChatBubble'

interface ChatWindowProps {
  orderId: string
  userRole?: 'customer' | 'admin'
}

export default function ChatWindow({ orderId, userRole = 'customer' }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch messages
  useEffect(() => {
    if (!orderId) return

    const supabase = createClient()

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })

      setMessages(data ?? [])
    }

    fetchMessages()

    // Subscribe to realtime
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  // Mark messages as read (based on user role)
  useEffect(() => {
    if (!user || messages.length === 0) return

    const readField = userRole === 'admin' ? 'admin_read_at' : 'customer_read_at'
    const unreadMessages = messages.filter(
      (m) => m.sender_id !== user.id && !m[readField]
    )

    if (unreadMessages.length === 0) return

    const markAsRead = async () => {
      const supabase = createClient()
      await supabase
        .from('messages')
        .update({ [readField]: new Date().toISOString() })
        .eq('order_id', orderId)
        .neq('sender_id', user.id)
        .is(readField, null)
    }

    markAsRead()
  }, [messages, user, orderId, userRole])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    if (!user || !newMessage.trim()) return
    setSending(true)

    const supabase = createClient()
    const { data: inserted, error } = await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: user.id,
      content: newMessage.trim(),
      type: 'text',
    }).select('id').single()

    if (!error) {
      setNewMessage('')
      if (inserted) {
        triggerEvent('new_message', { messageId: inserted.id })
      }
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return
    setUploading(true)

    const supabase = createClient()
    const filePath = `messages/${orderId}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file)

    if (uploadError) {
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath)

    const { data: fileMsg } = await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: user.id,
      content: file.name,
      type: 'file',
      file_url: urlData.publicUrl,
      file_name: file.name,
    }).select('id').single()

    if (fileMsg) {
      triggerEvent('new_message', { messageId: fileMsg.id })
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <ClipboardList size={16} className="text-[var(--accent-primary)]" />
        <h3 className="text-sm font-semibold text-[var(--theme-text)]">Auftragschat</h3>
        <span className="text-[10px] font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full">
          Auftrag
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--theme-textTertiary)]">
              Noch keine Nachrichten. Schreiben Sie uns!
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            content={msg.content}
            type={msg.type}
            isSelf={msg.sender_id === user?.id}
            senderName={msg.sender_id === user?.id ? 'Sie' : (userRole === 'admin' ? 'Kunde' : 'Petry Robotik')}
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
          {/* File upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-lg text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surfaceHover)] transition-colors shrink-0"
            title="Datei anhängen"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Paperclip size={18} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
              e.target.value = ''
            }}
          />

          {/* Text input */}
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            rows={1}
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
          />

          {/* Send */}
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
