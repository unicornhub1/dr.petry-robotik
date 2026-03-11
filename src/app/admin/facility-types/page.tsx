'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { Table, Modal, Input, EmptyState, Badge, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { FacilityType } from '@/lib/supabase/types'

const emptyForm = {
  name: '',
  icon: '',
  sort_order: 0,
}

export default function AdminFacilityTypesPage() {
  const { success, error: toastError } = useToast()
  const [types, setTypes] = useState<FacilityType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchTypes = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('facility_types')
        .select('*')
        .order('sort_order', { ascending: true })

      setTypes(data ?? [])
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (ft: FacilityType) => {
    setEditingId(ft.id)
    setForm({
      name: ft.name,
      icon: ft.icon ?? '',
      sort_order: ft.sort_order,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: form.name,
      icon: form.icon || null,
      sort_order: form.sort_order,
      is_active: true,
    }

    if (editingId) {
      const { error } = await supabase
        .from('facility_types')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        toastError('Fehler beim Speichern')
      } else {
        success('Platzart aktualisiert')
      }
    } else {
      const { error } = await supabase
        .from('facility_types')
        .insert(payload)

      if (error) {
        toastError('Fehler beim Erstellen')
      } else {
        success('Platzart erstellt')
      }
    }

    setSaving(false)
    setModalOpen(false)
    fetchTypes()
  }

  const toggleActive = async (ft: FacilityType) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('facility_types')
      .update({ is_active: !ft.is_active })
      .eq('id', ft.id)

    if (error) {
      toastError('Fehler beim Ändern')
    } else {
      success(ft.is_active ? 'Deaktiviert' : 'Aktiviert')
      fetchTypes()
    }
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
    { key: 'name', label: 'Name', sortable: true },
    { key: 'icon', label: 'Icon' },
    { key: 'sort_order', label: 'Reihenfolge', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ]

  const tableData = types.map((ft) => ({
    name: <span className="font-medium text-[var(--theme-text)]">{ft.name}</span>,
    icon: (
      <span className="text-sm text-[var(--theme-textSecondary)] font-mono">
        {ft.icon ?? '-'}
      </span>
    ),
    sort_order: (
      <span className="text-[var(--theme-textSecondary)]">{ft.sort_order}</span>
    ),
    status: (
      <Badge variant={ft.is_active ? 'success' : 'default'} size="sm">
        {ft.is_active ? 'Aktiv' : 'Inaktiv'}
      </Badge>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openEdit(ft)}
          className="p-1.5 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] transition-colors"
          title="Bearbeiten"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => toggleActive(ft)}
          className="p-1.5 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] transition-colors"
          title={ft.is_active ? 'Deaktivieren' : 'Aktivieren'}
        >
          {ft.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        </button>
      </div>
    ),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">Platzarten</h1>
          <p className="text-[var(--theme-textSecondary)]">Sportanlagen-Typen verwalten</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Neue Platzart
        </button>
      </div>

      {/* Content */}
      {types.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Keine Platzarten vorhanden"
          description="Erstellen Sie die erste Platzart."
          action={{ label: 'Neue Platzart', onClick: openNew }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Table columns={columns} data={tableData} />
        </motion.div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Platzart bearbeiten' : 'Neue Platzart'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="z.B. Fußballplatz"
          />
          <Input
            label="Icon (Lucide Icon Name)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="z.B. goal, trophy, map-pin"
          />
          <Input
            label="Reihenfolge"
            type="number"
            value={String(form.sort_order)}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
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
