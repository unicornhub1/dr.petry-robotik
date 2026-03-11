'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastConfig: Record<ToastType, { icon: React.ReactNode; colorVar: string }> = {
  success: { icon: <CheckCircle size={16} />, colorVar: 'var(--color-success)' },
  error: { icon: <XCircle size={16} />, colorVar: 'var(--color-error)' },
  info: { icon: <Info size={16} />, colorVar: 'var(--color-info)' },
  warning: { icon: <AlertTriangle size={16} />, colorVar: 'var(--color-warning)' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { icon, colorVar } = toastConfig[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)] border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-[var(--shadow-lg)] min-w-[280px] max-w-sm"
    >
      <span style={{ color: colorVar, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span className="flex-1 text-sm text-[var(--theme-text)]">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-0.5 rounded text-[var(--theme-textTertiary)] hover:text-[var(--theme-text)] transition-colors duration-[var(--transition-fast)]"
        aria-label="Schließen"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')

  return {
    toast: (message: string, type?: ToastType) => ctx.addToast(message, type),
    success: (message: string) => ctx.addToast(message, 'success'),
    error: (message: string) => ctx.addToast(message, 'error'),
    info: (message: string) => ctx.addToast(message, 'info'),
    warning: (message: string) => ctx.addToast(message, 'warning'),
  }
}
