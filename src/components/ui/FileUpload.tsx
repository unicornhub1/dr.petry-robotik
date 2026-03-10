'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  accept?: string
  maxSize?: number
  onUpload: (file: File) => void
  uploading?: boolean
  className?: string
}

export default function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10 MB default
  onUpload,
  uploading = false,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndUpload = (file: File) => {
    setError(null)

    if (maxSize && file.size > maxSize) {
      const maxMB = (maxSize / 1024 / 1024).toFixed(0)
      setError(`Datei zu gross. Maximal ${maxMB} MB erlaubt.`)
      return
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim())
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileMime = file.type

      const isValid = acceptedTypes.some(
        (t) => t === fileMime || t === fileExt || t === '*/*'
      )

      if (!isValid) {
        setError(`Ungaeltiger Dateityp. Erlaubt: ${accept}`)
        return
      }
    }

    onUpload(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndUpload(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndUpload(file)
    e.target.value = ''
  }

  const maxMBDisplay = maxSize ? `${(maxSize / 1024 / 1024).toFixed(0)} MB` : null

  return (
    <div className={`w-full ${className}`}>
      <motion.div
        className={`
          relative flex flex-col items-center justify-center gap-3
          px-6 py-10 rounded-[var(--radius-xl)] cursor-pointer
          border-2 border-dashed transition-colors duration-[var(--transition-fast)]
          ${
            isDragging
              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
              : error
                ? 'border-[var(--color-error)] bg-[var(--color-error)]/5'
                : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--theme-surfaceHover)]'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        whileHover={!uploading ? { scale: 1.005 } : undefined}
        transition={{ duration: 0.15 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-2"
            >
              <Loader2 size={28} className="text-[var(--accent-primary)] animate-spin" />
              <span className="text-sm text-[var(--theme-textSecondary)]">
                Wird hochgeladen...
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div
                className={`p-3 rounded-full border ${
                  error
                    ? 'border-[var(--color-error)]/30 bg-[var(--color-error)]/10'
                    : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'
                }`}
              >
                {error ? (
                  <AlertCircle size={22} className="text-[var(--color-error)]" />
                ) : (
                  <Upload size={22} className="text-[var(--theme-textSecondary)]" />
                )}
              </div>

              <div>
                <p className="text-sm text-[var(--theme-text)]">
                  Dateien hierher ziehen oder{' '}
                  <span className="text-[var(--accent-primary)] font-medium">
                    Durchsuchen
                  </span>
                </p>
                {(accept || maxMBDisplay) && (
                  <p className="text-xs text-[var(--theme-textTertiary)] mt-1">
                    {[accept && `Erlaubt: ${accept}`, maxMBDisplay && `Max. ${maxMBDisplay}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
