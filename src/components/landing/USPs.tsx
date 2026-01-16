'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui'

const stats = [
  {
    value: '0.1 Lux',
    label: 'Messgenauigkeit',
    description: 'Höchste Präzision für normgerechte Dokumentation',
  },
  {
    value: '24/7',
    label: 'Autonomer Betrieb',
    description: 'Kontinuierliche Messung ohne Personalaufwand',
  },
  {
    value: '< 5 Min',
    label: 'Datenverfügbarkeit',
    description: 'Messwerte sofort im Dashboard verfügbar',
  },
]

export default function USPs() {
  return (
    <section className="py-20">
      <Container size="wide">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative p-[1px] rounded-2xl overflow-hidden group"
              style={{ isolation: 'isolate' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Animated Gradient Border */}
              <motion.div
                className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                }}
              />

              {/* Content */}
              <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-8 h-full text-center">
                {/* Value with Gradient */}
                <div
                  className="text-4xl md:text-5xl font-bold mb-3"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-[var(--theme-text)] mb-2">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-[var(--theme-textSecondary)] leading-relaxed">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
