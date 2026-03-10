'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="mb-4 p-4 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)]">
        <Icon size={32} className="text-[var(--theme-textTertiary)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--theme-text)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--theme-textSecondary)] max-w-xs mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium rounded-[var(--radius-lg)] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primaryHover)] transition-colors duration-[var(--transition-fast)]"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
