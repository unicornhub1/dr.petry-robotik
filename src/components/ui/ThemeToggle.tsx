'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex items-center justify-center p-2.5 rounded-xl cursor-pointer group"
      style={{ isolation: 'isolate' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Wechseln zu ${theme === 'dark' ? 'hellem' : 'dunklem'} Modus`}
    >
      {/* Border */}
      <div className="absolute inset-0 border border-[var(--theme-border)] rounded-xl z-0 transition-colors duration-300 group-hover:border-[var(--theme-textSecondary)]" />

      {/* Hover Background */}
      <div className="absolute inset-0 bg-[var(--theme-text)]/0 group-hover:bg-[var(--theme-text)]/5 transition-colors duration-300 z-0 rounded-xl" />

      {/* Icon */}
      <div className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-5 h-5 text-[var(--theme-text)]" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-5 h-5 text-[var(--theme-text)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  )
}
