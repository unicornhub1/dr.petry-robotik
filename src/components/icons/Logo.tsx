'use client'

import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  showText?: boolean
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Icon */}
      <div className="relative w-10 h-10">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer ring with gradient */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            fill="none"
          />

          {/* Robot head */}
          <rect
            x="12"
            y="10"
            width="16"
            height="12"
            rx="3"
            fill="url(#logoGradient)"
          />

          {/* Robot eyes */}
          <circle cx="16" cy="16" r="2" fill="var(--theme-background)" />
          <circle cx="24" cy="16" r="2" fill="var(--theme-background)" />

          {/* Antenna */}
          <line
            x1="20"
            y1="6"
            x2="20"
            y2="10"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="20" cy="5" r="2" fill="var(--accent-primary)" />

          {/* Robot body */}
          <rect
            x="14"
            y="24"
            width="12"
            height="8"
            rx="2"
            fill="url(#logoGradient)"
          />

          {/* Wheels */}
          <circle cx="16" cy="34" r="2" fill="var(--accent-primary)" />
          <circle cx="24" cy="34" r="2" fill="var(--accent-secondary)" />

          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-[var(--theme-text)]">
            IB Dr. Petry
          </span>
          <span className="text-xs font-medium text-[var(--accent-primary)] tracking-wider uppercase">
            Robotik
          </span>
        </div>
      )}
    </motion.div>
  )
}
