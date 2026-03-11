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
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'var(--theme-background)',
        opacity: 0.92,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.92 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.15))',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <Lock size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--theme-text)] mb-1">{message}</p>
          <p className="text-xs text-[var(--theme-textTertiary)]">
            Bitte warten Sie auf die Freigabe durch unser Team.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
