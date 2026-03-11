'use client'

import { motion } from 'framer-motion'
import { Mail, RefreshCw } from 'lucide-react'

interface StepConfirmationProps {
  email: string
  onResend: () => void
  isResending: boolean
}

export default function StepConfirmation({ email, onResend, isResending }: StepConfirmationProps) {
  return (
    <div className="text-center py-4">
      {/* Mail icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        }}
      >
        <Mail size={40} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-3">
          Fast geschafft!
        </h2>
        <p className="text-[var(--theme-textSecondary)] mb-2 text-sm">
          Wir haben einen Bestätigungslink an folgende Adresse gesendet:
        </p>
        <p className="font-semibold text-[var(--theme-text)] mb-6 text-sm break-all">
          {email}
        </p>

        <div
          className="inline-block px-4 py-3 rounded-xl mb-6 text-sm text-[var(--theme-textSecondary)]"
          style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
        >
          Klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
          Prüfen Sie auch Ihren Spam-Ordner.
        </div>

        <div>
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="flex items-center gap-2 mx-auto text-sm text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
            {isResending ? 'Wird gesendet...' : 'Link nicht erhalten? Erneut senden'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
