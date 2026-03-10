'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Pencil, Trash2 } from 'lucide-react'
import { Table, Modal, Input, EmptyState, Badge, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { PricingRule } from '@/lib/supabase/types'

const emptyForm = {
  min_facilities: 1,
  max_facilities: '' as string | number,
  discount_percent: 0,
  is_individual: false,
}

export default function AdminPricingPage() {
  const { success, error: toastError } = useToast()
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchRules = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('pricing_rules')
      .select('*')
      .order('min_facilities', { ascending: true })

    setRules(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (rule: PricingRule) => {
    setEditingId(rule.id)
    setForm({
      min_facilities: rule.min_facilities,
      max_facilities: rule.max_facilities ?? '',
      discount_percent: rule.discount_percent,
      is_individual: rule.is_individual,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const maxFac = form.max_facilities === '' || form.max_facilities === null
      ? null
      : Number(form.max_facilities)

    const payload = {
      min_facilities: Number(form.min_facilities),
      max_facilities: maxFac,
      discount_percent: Number(form.discount_percent),
      is_individual: form.is_individual,
    }

    if (editingId) {
      const { error } = await supabase
        .from('pricing_rules')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        toastError('Fehler beim Speichern')
      } else {
        success('Preisregel aktualisiert')
      }
    } else {
      const { error } = await supabase
        .from('pricing_rules')
        .insert(payload)

      if (error) {
        toastError('Fehler beim Erstellen')
      } else {
        success('Preisregel erstellt')
      }
    }

    setSaving(false)
    setModalOpen(false)
    fetchRules()
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('pricing_rules')
      .delete()
      .eq('id', id)

    if (error) {
      toastError('Fehler beim Loeschen')
    } else {
      success('Preisregel geloescht')
      fetchRules()
    }
    setDeleteConfirmId(null)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  const columns = [
    { key: 'min_facilities', label: 'Min. Anlagen', sortable: true },
    { key: 'max_facilities', label: 'Max. Anlagen' },
    { key: 'discount_percent', label: 'Rabatt %', sortable: true },
    { key: 'type', label: 'Typ' },
    { key: 'actions', label: '' },
  ]

  const tableData = rules.map((rule) => ({
    min_facilities: (
      <span className="font-medium text-[var(--theme-text)]">{rule.min_facilities}</span>
    ),
    max_facilities: (
      <span className="text-[var(--theme-textSecondary)]">
        {rule.max_facilities !== null ? rule.max_facilities : 'unbegrenzt'}
      </span>
    ),
    discount_percent: (
      <span className="font-mono font-medium text-[var(--theme-text)]">
        {rule.discount_percent}%
      </span>
    ),
    type: (
      <Badge variant={rule.is_individual ? 'warning' : 'primary'} size="sm">
        {rule.is_individual ? 'Individuell' : 'Standard'}
      </Badge>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openEdit(rule)}
          className="p-1.5 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] transition-colors"
          title="Bearbeiten"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => setDeleteConfirmId(rule.id)}
          className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
          title="Loeschen"
        >
          <Trash2 size={14} />
        </button>
      </div>
    ),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Preisregeln</h1>
          <p className="text-[var(--theme-textSecondary)]">Staffelrabatte und Individualpreise</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Neue Regel
        </button>
      </div>

      {/* Content */}
      {rules.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Keine Preisregeln vorhanden"
          description="Erstellen Sie Staffelrabatte fuer Ihre Kunden."
          action={{ label: 'Neue Regel', onClick: openNew }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Table columns={columns} data={tableData} />
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Preisregel bearbeiten' : 'Neue Preisregel'}
      >
        <div className="space-y-4">
          <Input
            label="Min. Anlagen"
            type="number"
            value={String(form.min_facilities)}
            onChange={(e) => setForm({ ...form, min_facilities: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Max. Anlagen (leer = unbegrenzt)"
            type="number"
            value={String(form.max_facilities)}
            onChange={(e) => setForm({ ...form, max_facilities: e.target.value === '' ? '' : parseInt(e.target.value) })}
            placeholder="Leer lassen fuer unbegrenzt"
          />
          <Input
            label="Rabatt (%)"
            type="number"
            step="0.1"
            value={String(form.discount_percent)}
            onChange={(e) => setForm({ ...form, discount_percent: parseFloat(e.target.value) || 0 })}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_individual}
              onChange={(e) => setForm({ ...form, is_individual: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--theme-border)] accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--theme-text)]">Individualanfrage</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Preisregel loeschen"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--theme-textSecondary)]">
            Moechten Sie diese Preisregel wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-error)] text-white hover:opacity-90 transition-opacity"
            >
              Loeschen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
