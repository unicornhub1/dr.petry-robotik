'use client'

import { motion } from 'framer-motion'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
}

export default function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div
      className={`flex gap-0 border-b border-[var(--theme-border)] ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors duration-[var(--transition-fast)]
              ${isActive ? 'text-[var(--theme-text)]' : 'text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)]'}
            `}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tabs-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
