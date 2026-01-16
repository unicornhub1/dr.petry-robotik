'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Building,
  Clock,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Container, Badge, SplitText } from '@/components/ui'
import { siteConfig } from '@/lib/config'

const contactInfo = [
  { icon: Mail, label: 'E-Mail', value: siteConfig.company.email, href: `mailto:${siteConfig.company.email}` },
  { icon: Phone, label: 'Telefon', value: siteConfig.company.phone, href: `tel:${siteConfig.company.phone}` },
  { icon: MapPin, label: 'Adresse', value: siteConfig.company.address, href: '#' },
  { icon: Clock, label: 'Erreichbarkeit', value: 'Mo-Fr: 8:00 - 18:00 Uhr', href: '#' },
]

export default function KontaktPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <Container size="wide">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge variant="gradient" className="mb-4">
              Kontakt
            </Badge>
            <SplitText
              text="Sprechen Sie mit uns"
              tag="h1"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              splitType="words"
              delay={0.08}
            />
            <p className="text-lg text-[var(--theme-textSecondary)]">
              Haben Sie Fragen zum MR-1 oder möchten Sie ein Angebot?
              Wir freuen uns auf Ihre Nachricht.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative p-[1px] rounded-2xl overflow-hidden"
              style={{ isolation: 'isolate' }}
            >
              <div
                className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-100"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 320deg, var(--accent-primary) 340deg, transparent 360deg)`,
                }}
              />
              <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-6 md:p-8">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    >
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--theme-text)] mb-4">
                      Nachricht gesendet!
                    </h3>
                    <p className="text-[var(--theme-textSecondary)] mb-6">
                      Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich bei Ihnen.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-[var(--accent-primary)] hover:underline"
                    >
                      Neue Nachricht senden
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">
                          Vorname *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                          placeholder="Max"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">
                          Nachname *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                          placeholder="Mustermann"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                        placeholder="max@beispiel.de"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">
                        Firma
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                        placeholder="Ihre Firma"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">
                        Betreff *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="anfrage">Allgemeine Anfrage</option>
                        <option value="angebot">Angebot anfordern</option>
                        <option value="demo">Demo vereinbaren</option>
                        <option value="support">Technischer Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-[var(--theme-textSecondary)] mb-2">
                        Nachricht *
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
                        placeholder="Wie können wir Ihnen helfen?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={18} />
                          Nachricht senden
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Company Card */}
              <div className="relative p-[1px] rounded-2xl overflow-hidden" style={{ isolation: 'isolate' }}>
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                  }}
                />
                <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    >
                      <Building size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--theme-text)]">{siteConfig.company.name}</h3>
                      <p className="text-sm text-[var(--theme-textSecondary)]">Messroboter-Plattform</p>
                    </div>
                  </div>
                  <p className="text-[var(--theme-textSecondary)]">
                    Wir sind Ihr Partner für autonome Lichtmessung. Kontaktieren Sie uns für eine individuelle Beratung.
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--accent-primary)]/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/20 transition-colors">
                      <info.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--theme-textSecondary)]">{info.label}</p>
                      <p className="font-medium text-[var(--theme-text)]">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="h-64 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center"
              >
                <div className="text-center">
                  <MapPin size={48} className="mx-auto mb-2 text-[var(--theme-textTertiary)]" />
                  <p className="text-[var(--theme-textSecondary)]">Karte wird geladen...</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>
    </>
  )
}
