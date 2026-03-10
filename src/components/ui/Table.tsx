'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface TableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  emptyMessage?: string
}

export default function Table({
  columns,
  data,
  onSort,
  emptyMessage = 'Keine Daten vorhanden',
}: TableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDir(newDir)
    onSort?.(key, newDir)
  }

  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--theme-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-left font-medium text-[var(--theme-textSecondary)]
                  ${col.sortable ? 'cursor-pointer select-none hover:text-[var(--theme-text)] transition-colors duration-[var(--transition-fast)]' : ''}
                `}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && (
                    <span className="flex flex-col">
                      <ChevronUp
                        size={12}
                        className={
                          sortKey === col.key && sortDir === 'asc'
                            ? 'text-[var(--accent-primary)]'
                            : 'text-[var(--theme-textTertiary)]'
                        }
                      />
                      <ChevronDown
                        size={12}
                        className={
                          sortKey === col.key && sortDir === 'desc'
                            ? 'text-[var(--accent-primary)]'
                            : 'text-[var(--theme-textTertiary)]'
                        }
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-[var(--theme-textTertiary)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <motion.tr
                key={i}
                className="border-b border-[var(--theme-border)] last:border-0 hover:bg-[var(--theme-surfaceHover)] transition-colors duration-[var(--transition-fast)]"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-[var(--theme-text)]"
                  >
                    {row[col.key] as React.ReactNode}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
