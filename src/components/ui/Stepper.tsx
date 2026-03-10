'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isFuture = index > currentStep

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={
                  isCurrent
                    ? { scale: 1.1, borderColor: 'var(--accent-primary)' }
                    : { scale: 1 }
                }
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`
                  relative w-9 h-9 rounded-full flex items-center justify-center
                  border-2 font-semibold text-sm transition-colors duration-300
                  ${isCompleted
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                    : isCurrent
                      ? 'border-[var(--accent-primary)] bg-transparent text-[var(--accent-primary)]'
                      : 'border-[var(--theme-border)] bg-transparent text-[var(--theme-textTertiary)]'
                  }
                `}
              >
                {isCompleted ? (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check size={16} strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>

              {/* Step label */}
              <span
                className={`
                  text-xs font-medium whitespace-nowrap
                  ${isCompleted || isCurrent
                    ? 'text-[var(--theme-text)]'
                    : 'text-[var(--theme-textTertiary)]'
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3 mb-5">
                <div className="h-[2px] bg-[var(--theme-border)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--accent-primary)] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
