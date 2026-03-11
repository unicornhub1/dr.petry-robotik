'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { BarChart3, Download, FolderOpen, TrendingUp, Clock, CheckCircle, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Container, Badge, SplitText, FloatingBadge } from '@/components/ui'

const LiquidEther = dynamic(() => import('@/components/ui/LiquidEther'), { ssr: false })

const features = [
  { icon: BarChart3, text: 'Echtzeit-Messwerte und Grafiken' },
  { icon: Download, text: 'Export als PDF oder Excel' },
  { icon: FolderOpen, text: 'Projekte und Messungen verwalten' },
]

export default function DashboardPreview() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* LiquidEther Background */}
      <div className="absolute inset-0 w-full h-full">
        <LiquidEther
          colors={['#da4e24', '#ff6b3d', '#0098f3']}
          autoDemo
          autoSpeed={0.2}
          autoIntensity={0.4}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-[var(--theme-background)]/60" />
      </div>

      <Container size="wide" className="relative z-10">
        {/* Section Header - Centered */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="gradient" className="mb-4">
            Dashboard
          </Badge>
          <SplitText
            text="Ihre Messdaten immer im Blick"
            tag="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            splitType="words"
            delay={0.08}
          />
          <p className="text-lg text-[var(--theme-textSecondary)]">
            Greifen Sie jederzeit auf Ihre Messergebnisse zu. Unser Dashboard
            visualisiert Ihre Daten übersichtlich und ermöglicht den Export
            in verschiedene Formate.
          </p>
        </motion.div>

        {/* Dashboard Mockup with Gradient Border */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Glow Effect */}
          <div
            className="absolute -inset-4 rounded-3xl blur-3xl opacity-30"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            }}
          />

          {/* Card with Gradient Border */}
          <div
            className="relative rounded-[20px] bg-[var(--theme-border)] p-[1px] overflow-hidden"
            style={{ isolation: 'isolate' }}
          >
            {/* Rotating Glow Beam */}
            <div
              className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-100"
              style={{
                background: `conic-gradient(
                  from 0deg at 50% 50%,
                  transparent 0deg,
                  transparent 320deg,
                  var(--accent-primary) 340deg,
                  transparent 360deg
                )`,
              }}
            />

            {/* Inner Card Content */}
            <div className="relative z-[1] bg-[var(--theme-background)] rounded-[19px] p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--theme-border)]">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--theme-text)]">Messübersicht</h3>
                  <p className="text-sm text-[var(--theme-textSecondary)]">Sportplatz Musterstadt</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Abgeschlossen</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Messpunkte', value: '156', icon: TrendingUp },
                  { label: 'Dauer', value: '2.5h', icon: Clock },
                  { label: 'Genauigkeit', value: '99.8%', icon: CheckCircle },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="relative p-[1px] rounded-xl overflow-hidden group"
                    style={{ isolation: 'isolate' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {/* Gradient Border */}
                    <div
                      className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                      }}
                    />
                    <div className="relative z-10 bg-[var(--theme-surface)] rounded-xl p-4 text-center h-full">
                      <stat.icon size={18} className="mx-auto mb-2 text-[var(--accent-primary)]" />
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-[var(--theme-textSecondary)]">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart Mockup */}
              <div className="bg-[var(--theme-surface)] rounded-xl p-4 md:p-6 mb-6 border border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[var(--theme-text)]">
                    Beleuchtungsstärke (Lux)
                  </span>
                  <span className="text-xs text-[var(--theme-textTertiary)] px-2 py-1 rounded-full bg-[var(--theme-background)]">
                    Letzten 24h
                  </span>
                </div>

                {/* Chart Bars */}
                <div className="flex items-end gap-1.5 md:gap-2 h-40">
                  {[65, 78, 82, 90, 85, 75, 88, 92, 80, 70, 85, 95].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-md"
                      style={{
                        background: 'linear-gradient(180deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  ))}
                </div>
              </div>

              {/* Feature List */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {features.map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)]"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm text-[var(--theme-text)]">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex justify-center">
                <Button variant="primary" href="/dashboard">
                  Dashboard ansehen
                </Button>
              </div>
            </div>
          </div>

          {/* Floating notification - Top Right */}
          <FloatingBadge
            icon={<CheckCircle size={20} className="text-white" />}
            title="Messung abgeschlossen"
            subtitle="Vor 2 Minuten"
            delay={0.8}
            gradientDirection="primary"
            className="absolute -top-3 -right-3 md:-top-5 md:-right-5"
          />

          {/* Floating badge - Bottom Left */}
          <FloatingBadge
            icon={<Zap size={20} className="text-white" />}
            title="Echtzeit-Sync"
            subtitle="Daten werden live aktualisiert"
            delay={1}
            gradientDirection="secondary"
            className="absolute -bottom-3 -left-3 md:-bottom-5 md:-left-5"
          />
        </motion.div>
      </Container>
    </section>
  )
}
