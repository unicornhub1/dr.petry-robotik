'use client'

import { motion, HTMLMotionProps } from 'framer-motion'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gradient'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'ref'> {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
}

const sizes: Record<BadgeSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2 text-sm'
}

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: BadgeProps) {
  // Gradient variant with Aurora animation (Variant 2 - Soft Blur)
  if (variant === 'gradient') {
    return (
      <motion.span
        className={`inline-flex relative p-[1px] rounded-full overflow-hidden cursor-default ${className}`}
        style={{ isolation: 'isolate' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Aurora Background - rotating blurred conic gradient */}
        <motion.div
          className="absolute"
          style={{
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `conic-gradient(
              transparent 0deg,
              #da4e24 90deg,
              transparent 180deg,
              #0098f3 270deg,
              transparent 360deg
            )`,
            filter: 'blur(20px)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner content */}
        <span
          className={`
            relative z-10 rounded-full
            flex items-center justify-center
            ${sizes[size]}
          `}
          style={{ backgroundColor: 'var(--theme-background)' }}
        >
          {/* Inner border */}
          <span className="absolute inset-0 rounded-full border border-black/[0.08] dark:border-white/[0.08] pointer-events-none" />

          {/* Text */}
          <span className="font-medium whitespace-nowrap text-[var(--theme-text)]">
            {children}
          </span>
        </span>
      </motion.span>
    )
  }

  // Standard variants
  const variants: Record<Exclude<BadgeVariant, 'gradient'>, string> = {
    default: 'bg-[var(--theme-surface)] text-[var(--theme-textSecondary)] border-[var(--theme-border)]',
    primary: 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/30',
    success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30',
    warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30',
    error: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/30'
  }

  return (
    <motion.span
      className={`
        inline-flex items-center font-medium
        border rounded-[var(--radius-full)]
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.span>
  )
}
