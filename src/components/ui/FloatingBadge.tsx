'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FloatingBadgeProps {
  icon: ReactNode
  title: string
  subtitle: string
  delay?: number
  gradientDirection?: 'primary' | 'secondary'
  className?: string
}

export default function FloatingBadge({
  icon,
  title,
  subtitle,
  delay = 0.8,
  gradientDirection = 'primary',
  className = '',
}: FloatingBadgeProps) {
  const borderGradient = gradientDirection === 'primary'
    ? 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)'
    : 'linear-gradient(135deg, var(--accent-secondary) 0%, transparent 50%, var(--accent-primary) 100%)'

  const iconGradient = gradientDirection === 'primary'
    ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
    : 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))'

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
    >
      <div
        className="relative p-[1px] rounded-2xl overflow-hidden group"
        style={{ isolation: 'isolate' }}
      >
        {/* Gradient Border */}
        <div
          className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: borderGradient }}
        />
        <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: iconGradient }}
            >
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--theme-text)]">{title}</p>
              <p className="text-xs text-[var(--theme-textSecondary)]">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
