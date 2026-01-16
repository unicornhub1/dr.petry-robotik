'use client'

import { motion } from 'framer-motion'
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

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
            ${error
              ? 'border-[var(--color-error)]'
              : isFocused
                ? 'border-[var(--accent-primary)]'
                : 'border-[var(--theme-border)]'
            }
          `}
          animate={isFocused ? { boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)' } : { boxShadow: 'none' }}
        >
          {leftIcon && (
            <span className="pl-4 text-[var(--theme-textTertiary)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-transparent
              text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)]
              outline-none
              ${leftIcon ? 'pl-2' : ''}
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
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
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--theme-textSecondary)] mb-2">
            {label}
          </label>
        )}
        <motion.div
          className={`
            relative
            bg-[var(--theme-surface)] border rounded-[var(--radius-lg)]
            transition-colors duration-[var(--transition-fast)]
            ${error
              ? 'border-[var(--color-error)]'
              : isFocused
                ? 'border-[var(--accent-primary)]'
                : 'border-[var(--theme-border)]'
            }
          `}
          animate={isFocused ? { boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)' } : { boxShadow: 'none' }}
        >
          <textarea
            ref={ref}
            className={`
              w-full px-4 py-3 bg-transparent min-h-[120px] resize-y
              text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)]
              outline-none
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
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
)

Textarea.displayName = 'Textarea'

export default Input
