'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

interface BlurredOverlayProps {
  message: string
}

export default function BlurredOverlay({ message }: BlurredOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[inherit]"
      style={{
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="p-3 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)]">
          <Lock size={20} className="text-[var(--theme-textSecondary)]" />
        </div>
        <p className="text-sm font-medium text-[var(--theme-text)]">{message}</p>
      </div>
    </motion.div>
  )
}
