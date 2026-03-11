'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Trash2, Save, FileText } from 'lucide-react'
import { Dropdown, Textarea, FileUpload, EmptyState, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Order, Result, ResultFile, Json } from '@/lib/supabase/types'

interface OrderOption {
  value: string
  label: string
}

interface OrderItemInfo {
  id: string
  facilities: { name: string } | null
  packages: { name: string } | null
}

export default function AdminResultsPage() {
  const { success, error: toastError } = useToast()
  const [completedOrders, setCompletedOrders] = useState<OrderOption[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItemInfo[]>([])
  const [results, setResults] = useState<(Result & { result_files?: ResultFile[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Per-result form state
  const [jsonData, setJsonData] = useState<Record<string, string>>({})
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, status')
          .in('status', ['completed', 'measuring', 'scheduled'])
          .order('created_at', { ascending: false })

        const options = (data ?? []).map((o: Record<string, unknown>) => ({
          value: o.id as string,
          label: `${o.order_number} (${o.status})`,
        }))
        setCompletedOrders(options)
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    if (!selectedOrderId) {
      setOrderItems([])
      setResults([])
      return
    }

    const fetchOrderData = async () => {
      const supabase = createClient()

      const { data: items } = await supabase
        .from('order_items')
        .select('id, facilities(name), packages(name)')
        .eq('order_id', selectedOrderId)

      setOrderItems((items as unknown as OrderItemInfo[]) ?? [])

      const { data: resultsData } = await supabase
        .from('results')
        .select('*, result_files(*)')
        .eq('order_id', selectedOrderId)

      setResults((resultsData as unknown as (Result & { result_files?: ResultFile[] })[]) ?? [])

      // Populate form state
      const jd: Record<string, string> = {}
      const an: Record<string, string> = {}
      for (const r of (resultsData ?? []) as Result[]) {
        jd[r.id] = r.data ? JSON.stringify(r.data, null, 2) : ''
        an[r.id] = r.admin_note ?? ''
      }
      setJsonData(jd)
      setAdminNotes(an)
    }

    fetchOrderData()
  }, [selectedOrderId])

  const handleFileUpload = async (file: File, orderItemId: string | null) => {
    setUploading(true)
    const supabase = createClient()

    // Ensure result exists
    let result = results.find(
      (r) => r.order_id === selectedOrderId && r.order_item_id === orderItemId
    )

    if (!result) {
      const { data: newResult, error } = await supabase
        .from('results')
        .insert({
          order_id: selectedOrderId,
          order_item_id: orderItemId,
        })
        .select()
        .single()

      if (error || !newResult) {
        toastError('Fehler beim Erstellen des Ergebnisses')
        setUploading(false)
        return
      }
      result = newResult as Result & { result_files?: ResultFile[] }
    }

    // Upload file
    const filePath = `results/${selectedOrderId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('results')
      .upload(filePath, file)

    if (uploadError) {
      toastError('Fehler beim Hochladen')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('results')
      .getPublicUrl(filePath)

    // Create result_file entry
    const { error: fileError } = await supabase
      .from('result_files')
      .insert({
        result_id: result.id,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
      })

    if (fileError) {
      toastError('Fehler beim Speichern der Dateireferenz')
    } else {
      success('Datei hochgeladen')
    }

    // Refresh
    setSelectedOrderId((prev) => {
      // Trigger re-fetch by toggling
      const val = prev
      setSelectedOrderId('')
      setTimeout(() => setSelectedOrderId(val), 50)
      return ''
    })
    setUploading(false)
  }

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    const supabase = createClient()

    // Extract path from URL
    const pathMatch = fileUrl.match(/results\/(.+)/)
    if (pathMatch) {
      await supabase.storage.from('results').remove([pathMatch[1]])
    }

    const { error } = await supabase
      .from('result_files')
      .delete()
      .eq('id', fileId)

    if (error) {
      toastError('Fehler beim Löschen')
    } else {
      success('Datei gelöscht')
      setResults((prev) =>
        prev.map((r) => ({
          ...r,
          result_files: (r.result_files ?? []).filter((f) => f.id !== fileId),
        }))
      )
    }
  }

  const handleSaveAndNotify = async () => {
    setSaving(true)
    const supabase = createClient()

    // Update all results
    for (const result of results) {
      let parsedData: Json | null = null
      const jd = jsonData[result.id]
      if (jd && jd.trim()) {
        try {
          parsedData = JSON.parse(jd) as Json
        } catch {
          toastError(`Ungültiges JSON für Ergebnis ${result.id}`)
          setSaving(false)
          return
        }
      }

      await supabase
        .from('results')
        .update({
          data: parsedData,
          admin_note: adminNotes[result.id] || null,
        })
        .eq('id', result.id)
    }

    // Get order owner
    const { data: order } = await supabase
      .from('orders')
      .select('user_id, order_number')
      .eq('id', selectedOrderId)
      .single()

    if (order) {
      // Create notification
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        type: 'result_ready',
        title: 'Ergebnisse verfügbar',
        body: `Die Ergebnisse für Auftrag ${order.order_number} sind jetzt verfügbar.`,
        link: `/dashboard/results/${selectedOrderId}`,
        is_read: false,
      })
    }

    setSaving(false)
    success('Ergebnisse gespeichert und Kunde benachrichtigt')
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Ergebnisse</h1>
        <p className="text-[var(--theme-textSecondary)]">Messergebnisse hochladen und verwalten</p>
      </div>

      {/* Order Selection */}
      <div className="max-w-md">
        <Dropdown
          label="Auftrag auswählen"
          options={completedOrders}
          value={selectedOrderId}
          onChange={setSelectedOrderId}
          placeholder="Auftrag wählen..."
        />
      </div>

      {!selectedOrderId ? (
        <EmptyState
          icon={BarChart3}
          title="Auftrag auswählen"
          description="Wählen Sie einen Auftrag, um Ergebnisse zu verwalten."
        />
      ) : (
        <div className="space-y-6">
          {/* Order Items / Facilities */}
          {orderItems.map((item) => {
            const result = results.find((r) => r.order_item_id === item.id)
            const files = result?.result_files ?? []

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
              >
                <h3 className="font-semibold text-[var(--theme-text)] mb-4">
                  {item.facilities?.name ?? 'Anlage'} - {item.packages?.name ?? 'Paket'}
                </h3>

                {/* JSON Data */}
                {result && (
                  <div className="mb-4">
                    <Textarea
                      label="Daten (JSON, optional)"
                      value={jsonData[result.id] ?? ''}
                      onChange={(e) =>
                        setJsonData((prev) => ({ ...prev, [result.id]: e.target.value }))
                      }
                      placeholder='{"lux_average": 350, "uniformity": 0.65}'
                    />
                  </div>
                )}

                {/* File Upload */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-[var(--theme-textSecondary)] mb-2">
                    Dateien
                  </p>
                  <FileUpload
                    onUpload={(file) => handleFileUpload(file, item.id)}
                    uploading={uploading}
                  />
                </div>

                {/* Existing Files */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-[var(--theme-textSecondary)] shrink-0" />
                          <a
                            href={f.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--accent-primary)] hover:underline truncate"
                          >
                            {f.file_name}
                          </a>
                          <span className="text-xs text-[var(--theme-textTertiary)] shrink-0">
                            {(f.file_size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(f.id, f.file_url)}
                          className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Note */}
                {result && (
                  <div className="mt-4">
                    <Textarea
                      label="Admin Notiz"
                      value={adminNotes[result.id] ?? ''}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({ ...prev, [result.id]: e.target.value }))
                      }
                      placeholder="Interne Notiz zu diesem Ergebnis..."
                    />
                  </div>
                )}

                {/* Create result if none exists yet */}
                {!result && (
                  <p className="text-sm text-[var(--theme-textTertiary)] mt-2">
                    Laden Sie eine Datei hoch, um ein Ergebnis für diese Position zu erstellen.
                  </p>
                )}
              </motion.div>
            )
          })}

          {/* Save & Notify */}
          {results.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveAndNotify}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Speichern...' : 'Speichern & Kunden benachrichtigen'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
