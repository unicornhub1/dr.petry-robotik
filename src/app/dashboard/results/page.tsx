'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, FileText } from 'lucide-react'
import { Card, EmptyState } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'

interface ResultWithInfo {
  id: string
  order_id: string
  order_number: string
  facility_name: string | null
  created_at: string
  file_count: number
}

export default function ResultsPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<ResultWithInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchResults = async () => {
      try {
        const supabase = createClient()

        // Fetch results with order info
        const { data: resultsData } = await supabase
          .from('results')
          .select(`
            id,
            order_id,
            created_at,
            order_item_id,
            orders!inner(order_number, user_id),
            order_items(facilities(name))
          `)
          .eq('orders.user_id', user.id)
          .order('created_at', { ascending: false })

        // Fetch file counts
        const resultIds = (resultsData ?? []).map((r: Record<string, unknown>) => r.id as string)
        let fileCounts: Record<string, number> = {}

        if (resultIds.length > 0) {
          const { data: files } = await supabase
            .from('result_files')
            .select('result_id')
            .in('result_id', resultIds)

          fileCounts = (files ?? []).reduce((acc: Record<string, number>, f: Record<string, unknown>) => {
            const rid = f.result_id as string
            acc[rid] = (acc[rid] || 0) + 1
            return acc
          }, {})
        }

        const mapped: ResultWithInfo[] = (resultsData ?? []).map((r: Record<string, unknown>) => {
          const orders = r.orders as Record<string, unknown>
          const orderItems = r.order_items as Record<string, unknown> | null
          const facilities = orderItems?.facilities as Record<string, unknown> | null
          return {
            id: r.id as string,
            order_id: r.order_id as string,
            order_number: orders?.order_number as string,
            facility_name: facilities?.name as string | null,
            created_at: r.created_at as string,
            file_count: fileCounts[r.id as string] || 0,
          }
        })

        setResults(mapped)
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [user])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[var(--theme-surface)] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Ergebnisse</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Messergebnisse und Berichte Ihrer Aufträge
        </p>
      </div>

      {/* Content */}
      {results.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Keine Ergebnisse vorhanden"
          description="Sobald eine Messung abgeschlossen ist, finden Sie hier die Ergebnisse."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result, i) => (
            <Link key={result.id} href={`/dashboard/results/${result.id}`}>
              <Card hover className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {result.order_number}
                    </span>
                    <span className="text-xs text-[var(--theme-textTertiary)]">
                      {new Date(result.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--theme-text)] mb-1">
                    {result.facility_name || 'Messergebnis'}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--theme-textSecondary)]">
                    <FileText size={12} />
                    {result.file_count} Datei{result.file_count !== 1 ? 'en' : ''}
                  </div>
                </motion.div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
