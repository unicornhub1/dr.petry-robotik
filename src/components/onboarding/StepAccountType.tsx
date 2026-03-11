'use client'

import { motion } from 'framer-motion'
import { User, Building2, Users, Briefcase } from 'lucide-react'

export type AccountType = 'privat' | 'staedtisch' | 'verein' | 'unternehmen'

interface AccountTypeOption {
  id: AccountType
  label: string
  description: string
  icon: React.ElementType
}

const options: AccountTypeOption[] = [
  {
    id: 'privat',
    label: 'Privat',
    description: 'Privatperson oder Einzelunternehmer',
    icon: User,
  },
  {
    id: 'staedtisch',
    label: 'Städtisch',
    description: 'Behörde, Gemeinde oder öffentliche Einrichtung',
    icon: Building2,
  },
  {
    id: 'verein',
    label: 'Verein',
    description: 'Eingetragener Verein oder gemeinnützige Organisation',
    icon: Users,
  },
  {
    id: 'unternehmen',
    label: 'Unternehmen',
    description: 'GmbH, AG oder sonstige Kapitalgesellschaft',
    icon: Briefcase,
  },
]

interface StepAccountTypeProps {
  selected: AccountType | null
  onSelect: (type: AccountType) => void
}

export default function StepAccountType({ selected, onSelect }: StepAccountTypeProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">
        Welchen Kontotyp möchten Sie erstellen?
      </h2>
      <p className="text-sm text-[var(--theme-textSecondary)] mb-6">
        Wählen Sie die Kategorie, die am besten zu Ihnen passt.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => {
          const isSelected = selected === option.id
          const Icon = option.icon

          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left
                transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                  : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-borderHover)]'
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200
                  ${isSelected
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--theme-surfaceHover)] text-[var(--theme-textSecondary)]'
                  }
                `}
              >
                <Icon size={20} />
              </div>

              {/* Text */}
              <div>
                <p
                  className={`
                    font-semibold text-sm mb-1 transition-colors duration-200
                    ${isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--theme-text)]'}
                  `}
                >
                  {option.label}
                </p>
                <p className="text-xs text-[var(--theme-textTertiary)] leading-snug">
                  {option.description}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--accent-primary)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
