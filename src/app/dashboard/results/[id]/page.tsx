'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, FileText, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Result, ResultFile } from '@/lib/supabase/types'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResultDetailPage() {
  const params = useParams()
  const resultId = params.id as string

  const [result, setResult] = useState<Result | null>(null)
  const [files, setFiles] = useState<ResultFile[]>([])
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resultId) return

    const fetchResult = async () => {
      try {
        const supabase = createClient()

        const [{ data: resultData }, { data: filesData }] = await Promise.all([
          supabase
            .from('results')
            .select('*, orders(order_number)')
            .eq('id', resultId)
            .single(),
          supabase
            .from('result_files')
            .select('*')
            .eq('result_id', resultId)
            .order('created_at', { ascending: true }),
        ])

        if (resultData) {
          const orders = (resultData as Record<string, unknown>).orders as Record<string, unknown> | null
          setOrderNumber((orders?.order_number as string) ?? '')
          setResult(resultData as Result)
        }
        setFiles(filesData ?? [])
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [resultId])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-96 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--theme-textSecondary)]">Ergebnis nicht gefunden.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Messergebnis</h1>
        {orderNumber && (
          <p className="text-[var(--theme-textSecondary)]">
            Auftrag {orderNumber}
          </p>
        )}
      </div>

      {/* Data (JSON) */}
      {result.data && Object.keys(result.data).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-[var(--theme-textSecondary)]" />
            <h2 className="text-base font-semibold text-[var(--theme-text)]">Messdaten</h2>
          </div>
          <div className="overflow-x-auto">
            <pre className="text-xs text-[var(--theme-textSecondary)] font-mono bg-[var(--theme-background)] rounded-lg p-4 border border-[var(--theme-border)]">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Files */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-[var(--theme-textSecondary)]" />
          <h2 className="text-base font-semibold text-[var(--theme-text)]">Dateien</h2>
        </div>

        {files.length === 0 ? (
          <p className="text-sm text-[var(--theme-textTertiary)] py-4 text-center">
            Keine Dateien vorhanden.
          </p>
        ) : (
          <div className="space-y-2">
            {files.map((file, i) => (
              <motion.a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--theme-border)] hover:border-[var(--accent-primary)]/30 hover:bg-[var(--theme-surfaceHover)] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 shrink-0">
                    <FileText size={16} className="text-[var(--accent-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--theme-text)] truncate">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-[var(--theme-textTertiary)]">
                      {formatFileSize(file.file_size)} · {file.file_type}
                    </p>
                  </div>
                </div>
                <Download
                  size={16}
                  className="text-[var(--theme-textTertiary)] group-hover:text-[var(--accent-primary)] transition-colors shrink-0"
                />
              </motion.a>
            ))}
          </div>
        )}
      </motion.div>

      {/* Admin Note */}
      {result.admin_note && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
        >
          <h2 className="text-base font-semibold text-[var(--theme-text)] mb-2">Hinweis</h2>
          <p className="text-sm text-[var(--theme-textSecondary)] whitespace-pre-wrap">
            {result.admin_note}
          </p>
        </motion.div>
      )}
    </div>
  )
}
