'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
}

export default function Dropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Bitte waehlen',
  error,
}: DropdownProps) {
  const [isFocused, setIsFocused] = useState(false)

  const selectedLabel = options.find((o) => o.value === value)?.label

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--theme-textSecondary)] mb-2">
          {label}
        </label>
      )}
      <motion.div
        className={`
          relative flex items-center
          bg-[var(--theme-surface)] border rounded-[var(--radius-lg)]
          transition-colors duration-[var(--transition-fast)]
          ${
            error
              ? 'border-[var(--color-error)]'
              : isFocused
                ? 'border-[var(--accent-primary)]'
                : 'border-[var(--theme-border)]'
          }
        `}
        animate={
          isFocused
            ? { boxShadow: '0 0 0 3px rgba(218, 78, 36, 0.1)' }
            : { boxShadow: 'none' }
        }
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="
            w-full px-4 py-3 bg-transparent appearance-none
            text-[var(--theme-text)] outline-none cursor-pointer
          "
          style={{
            color: value ? 'var(--theme-text)' : 'var(--theme-textTertiary)',
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              style={{ background: 'var(--theme-surface)', color: 'var(--theme-text)' }}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-[var(--theme-textTertiary)]">
          <ChevronDown size={16} />
        </span>
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-[var(--color-error)]"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
