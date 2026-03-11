'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, Modal, Input, Textarea, Dropdown, EmptyState, Badge, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { Package as PackageType, MeasurementGrid, Json } from '@/lib/supabase/types'

function formatCents(cents: number): string {
  const euros = cents / 100
  return euros.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' EUR'
}

const emptyForm = {
  name: '',
  description: '',
  base_price_eur: '',
  grid_size: '5m' as MeasurementGrid,
  features: '{}',
  sort_order: 0,
}

export default function AdminPackagesPage() {
  const { success, error: toastError } = useToast()
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchPackages = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('packages')
        .select('*')
        .order('sort_order', { ascending: true })

      setPackages(data ?? [])
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (pkg: PackageType) => {
    setEditingId(pkg.id)
    setForm({
      name: pkg.name,
      description: pkg.description ?? '',
      base_price_eur: (pkg.base_price / 100).toFixed(2),
      grid_size: pkg.grid_size,
      features: JSON.stringify(pkg.features, null, 2),
      sort_order: pkg.sort_order,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    let parsedFeatures: Json = {}
    try {
      parsedFeatures = JSON.parse(form.features) as Json
    } catch {
      toastError('Features JSON ist ungültig')
      setSaving(false)
      return
    }

    const priceInCents = Math.round(parseFloat(form.base_price_eur || '0') * 100)

    const payload = {
      name: form.name,
      description: form.description || null,
      base_price: priceInCents,
      grid_size: form.grid_size,
      features: parsedFeatures,
      sort_order: form.sort_order,
      is_active: true,
    }

    if (editingId) {
      const { error } = await supabase
        .from('packages')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        toastError('Fehler beim Speichern')
      } else {
        success('Paket aktualisiert')
      }
    } else {
      const { error } = await supabase
        .from('packages')
        .insert(payload)

      if (error) {
        toastError('Fehler beim Erstellen')
      } else {
        success('Paket erstellt')
      }
    }

    setSaving(false)
    setModalOpen(false)
    fetchPackages()
  }

  const toggleActive = async (pkg: PackageType) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('packages')
      .update({ is_active: !pkg.is_active })
      .eq('id', pkg.id)

    if (error) {
      toastError('Fehler beim Ändern')
    } else {
      success(pkg.is_active ? 'Paket deaktiviert' : 'Paket aktiviert')
      fetchPackages()
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-[var(--theme-surface)] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Pakete</h1>
          <p className="text-[var(--theme-textSecondary)]">Messpakete verwalten</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Neues Paket
        </button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Keine Pakete vorhanden"
          description="Erstellen Sie Ihr erstes Messpaket."
          action={{ label: 'Neues Paket', onClick: openNew }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover={false} className={`relative ${!pkg.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--theme-text)]">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-sm text-[var(--theme-textSecondary)] mt-1">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={pkg.is_active ? 'success' : 'default'}
                    size="sm"
                  >
                    {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--theme-textSecondary)]">Preis</span>
                    <span className="font-mono font-medium text-[var(--theme-text)]">
                      {formatCents(pkg.base_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--theme-textSecondary)]">Raster</span>
                    <span className="text-[var(--theme-text)]">{pkg.grid_size}</span>
                  </div>
                  {Object.keys(pkg.features as object).length > 0 && (
                    <div className="text-sm">
                      <span className="text-[var(--theme-textSecondary)]">Features:</span>
                      <pre className="mt-1 text-xs text-[var(--theme-textTertiary)] overflow-auto max-h-24">
                        {JSON.stringify(pkg.features, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--theme-border)]">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
                  >
                    <Pencil size={14} />
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => toggleActive(pkg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
                  >
                    {pkg.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {pkg.is_active ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Paket bearbeiten' : 'Neues Paket'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="z.B. Standard Messung"
          />
          <Textarea
            label="Beschreibung"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Kurze Beschreibung des Pakets"
          />
          <Input
            label="Grundpreis (EUR)"
            type="number"
            step="0.01"
            value={form.base_price_eur}
            onChange={(e) => setForm({ ...form, base_price_eur: e.target.value })}
            placeholder="z.B. 299.00"
          />
          <Dropdown
            label="Rastergröße"
            options={[
              { value: '5m', label: '5m Raster' },
              { value: '10m', label: '10m Raster' },
            ]}
            value={form.grid_size}
            onChange={(v) => setForm({ ...form, grid_size: v as MeasurementGrid })}
          />
          <Textarea
            label="Features (JSON)"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            placeholder='{"feature1": true, "feature2": "Wert"}'
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
