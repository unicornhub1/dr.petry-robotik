'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'gradient' | 'glass'
  hover?: boolean
  children: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = true, children, className = '', ...props }, ref) => {
    const baseStyles = `
      rounded-[var(--radius-xl)] p-6
      transition-all duration-[var(--transition-normal)]
    `

    const variantStyles = {
      default: `
        bg-[var(--theme-surface)] border border-[var(--theme-border)]
        ${hover ? 'hover:border-[var(--theme-borderHover)] hover:bg-[var(--theme-surfaceHover)]' : ''}
      `,
      gradient: `
        gradient-border
        ${hover ? 'hover:shadow-[var(--shadow-glow)]' : ''}
      `,
      glass: `
        glass border border-[var(--theme-border)]
        ${hover ? 'hover:border-[var(--accent-primary)]' : ''}
      `
    }

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        whileHover={hover ? { y: -4 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export default Card
