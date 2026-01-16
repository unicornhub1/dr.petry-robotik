'use client'

import { motion } from 'framer-motion'
import { Phone, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Container, SplitText } from '@/components/ui'
import { siteConfig } from '@/lib/config'

export default function FinalCTA() {
  return (
    <section className="section relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--accent-primary)]/5 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--accent-secondary)]/5 blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <Container size="wide" className="relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Content */}
          <SplitText
            text="Bereit für präzise Lichtmessung?"
            tag="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            splitType="words"
            delay={0.08}
          />
          <p className="text-lg md:text-xl text-[var(--theme-textSecondary)] mb-10 max-w-2xl mx-auto">
            Kontaktieren Sie uns für eine unverbindliche Beratung. Wir zeigen Ihnen,
            wie unser Messroboter Ihre Projekte effizienter macht.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button variant="primary" href="/kontakt">
              Jetzt Anfrage stellen
            </Button>
            <Button variant="secondary" href="/produkt">
              Mehr zum Produkt
            </Button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[var(--theme-textSecondary)]">
            <motion.a
              href={`tel:${siteConfig.company.phone}`}
              className="flex items-center gap-3 hover:text-[var(--accent-primary)] transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center">
                <Phone size={18} />
              </div>
              <span>{siteConfig.company.phone}</span>
            </motion.a>

            <motion.a
              href={`mailto:${siteConfig.company.email}`}
              className="flex items-center gap-3 hover:text-[var(--accent-primary)] transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center">
                <Mail size={18} />
              </div>
              <span>{siteConfig.company.email}</span>
            </motion.a>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
