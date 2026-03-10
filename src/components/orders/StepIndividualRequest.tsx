'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { Textarea } from '@/components/ui'

interface StepIndividualRequestProps {
  notes: string
  onChange: (notes: string) => void
  facilityCount: number
}

export default function StepIndividualRequest({
  notes,
  onChange,
  facilityCount,
}: StepIndividualRequestProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">Individuelle Anfrage</h2>
        <p className="text-sm text-[var(--theme-textSecondary)]">
          Ab 4 Anlagen erstellen wir Ihnen ein individuelles Angebot
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--theme-surface)] rounded-xl p-6 border border-[var(--theme-border)]"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 shrink-0">
            <MessageSquare size={24} className="text-[var(--accent-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--theme-text)] mb-1">
              Individuelle Preisgestaltung
            </h3>
            <p className="text-sm text-[var(--theme-textSecondary)]">
              Sie haben {facilityCount} Anlagen ausgewaehlt. Fuer Auftraege mit mehr als 3 Anlagen
              erstellen wir Ihnen gerne ein individuelles Angebot mit attraktiven Konditionen.
              Unser Team wird sich nach Eingang Ihrer Anfrage zeitnah bei Ihnen melden.
            </p>
          </div>
        </div>
      </motion.div>

      <Textarea
        label="Anmerkungen (optional)"
        placeholder="Haben Sie besondere Wuensche oder Anforderungen? Teilen Sie uns diese gerne mit..."
        value={notes}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
