'use client'

import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import type { MessageType } from '@/lib/supabase/types'

interface ChatBubbleProps {
  content: string | null
  type: MessageType
  isSelf: boolean
  senderName: string
  timestamp: string
  fileUrl?: string | null
  fileName?: string | null
}

export default function ChatBubble({
  content,
  type,
  isSelf,
  senderName,
  timestamp,
  fileUrl,
  fileName,
}: ChatBubbleProps) {
  const formattedTime = new Date(timestamp).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedDate = new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  })

  // System message
  if (type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center py-2"
      >
        <span className="text-xs italic text-[var(--theme-textTertiary)] px-4 py-1 rounded-full bg-[var(--theme-surfaceHover)]">
          {content}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        <p
          className={`text-xs text-[var(--theme-textTertiary)] mb-1 ${
            isSelf ? 'text-right' : 'text-left'
          }`}
        >
          {senderName}
        </p>

        {/* Bubble */}
        <div
          className={`
            rounded-2xl px-4 py-2.5
            ${isSelf
              ? 'bg-[var(--accent-primary)] text-white rounded-br-md'
              : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-bl-md'
            }
          `}
        >
          {type === 'file' && fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm ${
                isSelf ? 'text-white hover:text-white/80' : 'text-[var(--accent-primary)] hover:underline'
              }`}
            >
              <Download size={16} />
              <span>{fileName || 'Datei herunterladen'}</span>
            </a>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={`text-[10px] text-[var(--theme-textTertiary)] mt-1 ${
            isSelf ? 'text-right' : 'text-left'
          }`}
        >
          {formattedDate}, {formattedTime}
        </p>
      </div>
    </motion.div>
  )
}
