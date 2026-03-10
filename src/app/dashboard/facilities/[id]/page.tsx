'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Trash2 } from 'lucide-react'
import { Input, Button, Dropdown, MapPicker, Modal, useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import type { FacilityType } from '@/lib/supabase/types'

export default function EditFacilityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const facilityId = params.id as string
  const toast = useToast()

  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    type_id: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    address: '',
    length_m: '',
    width_m: '',
    mast_count: '',
    light_count: '',
    light_type: '' as '' | 'led' | 'conventional',
    measurement_grid: '' as '' | '5m' | '10m',
  })

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const [{ data: types }, { data: facility }] = await Promise.all([
        supabase
          .from('facility_types')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('facilities')
          .select('*')
          .eq('id', facilityId)
          .single(),
      ])

      setFacilityTypes(types ?? [])

      if (facility) {
        setForm({
          name: facility.name,
          type_id: facility.type_id,
          latitude: facility.latitude ?? undefined,
          longitude: facility.longitude ?? undefined,
          address: facility.address ?? '',
          length_m: facility.length_m?.toString() ?? '',
          width_m: facility.width_m?.toString() ?? '',
          mast_count: facility.mast_count?.toString() ?? '',
          light_count: facility.light_count?.toString() ?? '',
          light_type: (facility.light_type as '' | 'led' | 'conventional') ?? '',
          measurement_grid: (facility.measurement_grid as '' | '5m' | '10m') ?? '',
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [facilityId])

  const handleChange = (field: string, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleMapChange = (lat: number, lng: number, address: string) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address,
    }))
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein.')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('facilities')
      .update({
        name: form.name.trim(),
        type_id: form.type_id,
        latitude: form.latitude ?? null,
        longitude: form.longitude ?? null,
        address: form.address || null,
        length_m: form.length_m ? parseFloat(form.length_m) : null,
        width_m: form.width_m ? parseFloat(form.width_m) : null,
        mast_count: form.mast_count ? parseInt(form.mast_count, 10) : null,
        light_count: form.light_count ? parseInt(form.light_count, 10) : null,
        light_type: form.light_type || null,
        measurement_grid: form.measurement_grid || null,
      })
      .eq('id', facilityId)

    setSaving(false)

    if (error) {
      toast.error('Fehler beim Speichern.')
    } else {
      toast.success('Anlage erfolgreich aktualisiert.')
      router.push('/dashboard/facilities')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', facilityId)

    setDeleting(false)
    setShowDeleteModal(false)

    if (error) {
      toast.error('Fehler beim Loeschen. Moeglicherweise existieren noch verknuepfte Auftraege.')
    } else {
      toast.success('Anlage erfolgreich geloescht.')
      router.push('/dashboard/facilities')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl">
        <div className="h-8 w-48 bg-[var(--theme-surface)] rounded-lg" />
        <div className="h-64 bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Anlage bearbeiten</h1>
        <p className="text-[var(--theme-textSecondary)]">
          Aendern Sie die Daten Ihrer Sportanlage
        </p>
      </div>

      {/* Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h2 className="text-lg font-semibold text-[var(--theme-text)] mb-4">Grunddaten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Name der Anlage"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Dropdown
              label="Art der Anlage"
              options={facilityTypes.map((t) => ({ value: t.id, label: t.name }))}
              value={form.type_id}
              onChange={(val) => handleChange('type_id', val)}
            />
          </div>
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <MapPin size={20} className="text-[var(--theme-textSecondary)]" />
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Standort</h2>
        </div>
        <MapPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={handleMapChange}
        />
        {form.address && (
          <p className="mt-3 text-sm text-[var(--theme-textSecondary)]">
            {form.address}
          </p>
        )}
      </motion.div>

      {/* Dimensions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)]"
      >
        <h2 className="text-lg font-semibold text-[var(--theme-text)] mb-4">Abmessungen &amp; Beleuchtung</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Laenge (m)"
            type="number"
            value={form.length_m}
            onChange={(e) => handleChange('length_m', e.target.value)}
          />
          <Input
            label="Breite (m)"
            type="number"
            value={form.width_m}
            onChange={(e) => handleChange('width_m', e.target.value)}
          />
          <Input
            label="Anzahl Lichtmasten"
            type="number"
            value={form.mast_count}
            onChange={(e) => handleChange('mast_count', e.target.value)}
          />
          <Input
            label="Anzahl Leuchten"
            type="number"
            value={form.light_count}
            onChange={(e) => handleChange('light_count', e.target.value)}
          />

          {/* Light Type Radio */}
          <div>
            <label className="block text-sm font-medium text-[var(--theme-textSecondary)] mb-2">
              Leuchtmittelart
            </label>
            <div className="flex gap-4">
              {[
                { value: 'led', label: 'LED' },
                { value: 'conventional', label: 'Konventionell' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="light_type"
                    value={option.value}
                    checked={form.light_type === option.value}
                    onChange={() => handleChange('light_type', option.value)}
                    className="accent-[var(--accent-primary)]"
                  />
                  <span className="text-sm text-[var(--theme-text)]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Measurement Grid Radio */}
          <div>
            <label className="block text-sm font-medium text-[var(--theme-textSecondary)] mb-2">
              Messraster
            </label>
            <div className="flex gap-4">
              {[
                { value: '5m', label: '5 m' },
                { value: '10m', label: '10 m' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="measurement_grid"
                    value={option.value}
                    checked={form.measurement_grid === option.value}
                    onChange={() => handleChange('measurement_grid', option.value)}
                    className="accent-[var(--accent-primary)]"
                  />
                  <span className="text-sm text-[var(--theme-text)]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={16} />
          Anlage loeschen
        </button>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.push('/dashboard/facilities')}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Wird gespeichert...' : 'Aenderungen speichern'}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Anlage loeschen"
        size="sm"
      >
        <p className="text-sm text-[var(--theme-textSecondary)] mb-6">
          Moechten Sie diese Anlage wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Abbrechen
          </Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Wird geloescht...' : 'Endgueltig loeschen'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
