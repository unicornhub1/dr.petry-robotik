'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BentoCardProps {
  title: string
  description: string
  image?: string
  imageAlt?: string
  icon?: ReactNode
  className?: string
  glowDelay?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function BentoCard({
  title,
  description,
  image,
  imageAlt = '',
  icon,
  className = '',
  glowDelay = 0,
  size = 'md',
}: BentoCardProps) {
  const iconSizes = {
    sm: 'h-[120px]',
    md: 'h-[180px]',
    lg: 'h-[240px]',
  }

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <motion.div
      className={`relative rounded-[20px] bg-[var(--theme-border)] p-[1px] overflow-hidden cursor-default group h-full ${className}`}
      style={{ isolation: 'isolate' }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {/* Rotating Glow Beam - Always visible */}
      <div
        className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-100"
        style={{
          background: `conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            transparent 320deg,
            var(--accent-primary) 340deg,
            transparent 360deg
          )`,
          animationDelay: `${glowDelay}s`,
        }}
      />

      {/* Inner Card Content */}
      <div className="relative z-[1] bg-[var(--theme-background)] rounded-[19px] w-full h-full flex flex-col p-2 box-border">
        {/* Image Area - fixed height */}
        {image && (
          <div className="w-full h-[200px] bg-[var(--theme-surface)] rounded-xl overflow-hidden relative mb-4 border border-[var(--theme-border)]">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Icon Area (wenn kein Bild) */}
        {!image && icon && (
          <div className={`w-full ${iconSizes[size]} bg-[var(--theme-surface)] rounded-xl overflow-hidden relative mb-4 border border-[var(--theme-border)] flex items-center justify-center`}>
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/20 group-hover:scale-110 transition-all duration-300">
              {icon}
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="px-3 pb-4 flex flex-col gap-2">
          <h3 className={`${titleSizes[size]} font-semibold text-[var(--theme-text)] tracking-tight`}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-[var(--theme-textSecondary)]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
