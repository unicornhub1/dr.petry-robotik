'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ToggleLeft, ToggleRight } from 'lucide-react'
import { Table, Modal, Input, Textarea, Badge, EmptyState, useToast } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { EmailTemplate } from '@/lib/supabase/types'

const emptyForm = {
  subject: '',
  body: '',
  cta_text: '',
  cta_url: '',
}

const AVAILABLE_VARIABLES = [
  '{{first_name}}',
  '{{last_name}}',
  '{{email}}',
  '{{order_number}}',
  '{{status}}',
  '{{date}}',
  '{{link}}',
]

export default function AdminEmailTemplatesPage() {
  const { success, error: toastError } = useToast()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchTemplates = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_key', { ascending: true })

      setTemplates(data ?? [])
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const openEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setForm({
      subject: template.subject,
      body: template.body,
      cta_text: template.cta_text ?? '',
      cta_url: template.cta_url ?? '',
    })
    setEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!editingTemplate) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('email_templates')
      .update({
        subject: form.subject,
        body: form.body,
        cta_text: form.cta_text || null,
        cta_url: form.cta_url || null,
      })
      .eq('id', editingTemplate.id)

    if (error) {
      toastError('Fehler beim Speichern')
    } else {
      success('Template aktualisiert')
      setEditModalOpen(false)
      fetchTemplates()
    }
    setSaving(false)
  }

  const toggleActive = async (template: EmailTemplate) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('email_templates')
      .update({ is_active: !template.is_active })
      .eq('id', template.id)

    if (error) {
      toastError('Fehler beim Ändern')
    } else {
      success(template.is_active ? 'Template deaktiviert' : 'Template aktiviert')
      fetchTemplates()
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

  const recipientLabels: Record<string, string> = {
    customer: 'Kunde',
    admin: 'Admin',
  }

  const columns = [
    { key: 'template_key', label: 'Template Key' },
    { key: 'subject', label: 'Betreff' },
    { key: 'recipient_type', label: 'Empfänger' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ]

  const tableData = templates.map((t) => ({
    template_key: (
      <span className="font-mono text-sm font-medium text-[var(--theme-text)]">
        {t.template_key}
      </span>
    ),
    subject: (
      <span className="text-sm text-[var(--theme-textSecondary)]">{t.subject}</span>
    ),
    recipient_type: (
      <Badge variant="default" size="sm">
        {recipientLabels[t.recipient_type] ?? t.recipient_type}
      </Badge>
    ),
    status: (
      <Badge variant={t.is_active ? 'success' : 'default'} size="sm">
        {t.is_active ? 'Aktiv' : 'Inaktiv'}
      </Badge>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openEdit(t)}
          className="text-sm text-[var(--accent-primary)] hover:underline"
        >
          Bearbeiten
        </button>
        <button
          onClick={() => toggleActive(t)}
          className="p-1.5 rounded-lg text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] transition-colors"
          title={t.is_active ? 'Deaktivieren' : 'Aktivieren'}
        >
          {t.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        </button>
      </div>
    ),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">E-Mail Templates</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Automatische E-Mail-Vorlagen verwalten
        </p>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Keine Templates vorhanden"
          description="E-Mail-Templates werden automatisch erstellt."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Table columns={columns} data={tableData} />
        </motion.div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editingTemplate ? `Template: ${editingTemplate.template_key}` : 'Template bearbeiten'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Betreff"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="E-Mail Betreff"
          />

          <Textarea
            label="Body (HTML)"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="<h1>Hallo {{first_name}}</h1>..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CTA Text"
              value={form.cta_text}
              onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
              placeholder="z.B. Zum Dashboard"
            />
            <Input
              label="CTA URL"
              value={form.cta_url}
              onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
              placeholder="z.B. /dashboard"
            />
          </div>

          {/* Available Variables */}
          <div className="p-3 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <p className="text-xs font-medium text-[var(--theme-textSecondary)] mb-2">
              Verfügbare Variablen:
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map((v) => (
                <span
                  key={v}
                  className="inline-flex px-2 py-0.5 rounded text-xs font-mono bg-[var(--theme-surface)] text-[var(--theme-textSecondary)] border border-[var(--theme-border)]"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] border border-[var(--theme-border)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.subject}
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
