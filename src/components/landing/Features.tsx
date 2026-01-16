'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Bot,
  Gauge,
  LayoutDashboard,
  FileText,
  Calendar,
  Plug,
} from 'lucide-react'
import { Container, Badge, SplitText, BentoCard } from '@/components/ui'

const features = [
  {
    title: 'Autonome Messung',
    description:
      'Unser Messroboter arbeitet vollständig autonom und erfasst Beleuchtungsdaten rund um die Uhr.',
    icon: Bot,
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_2xr9np2xr9np2xr9.png',
  },
  {
    title: 'Hochpräzise Sensorik',
    description:
      'Kalibrierte Sensoren liefern Messwerte mit wissenschaftlicher Genauigkeit nach DIN-Norm.',
    icon: Gauge,
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_rkbqzyrkbqzyrkbq.png',
  },
  {
    title: 'Echtzeit-Dashboard',
    description:
      'Greifen Sie jederzeit auf Ihre Messdaten zu - übersichtlich aufbereitet im Online-Dashboard.',
    icon: LayoutDashboard,
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_4rgybp4rgybp4rgy.png',
  },
  {
    title: 'Detaillierte Reports',
    description:
      'Exportieren Sie Ihre Messergebnisse als PDF-Report oder Excel-Datei.',
    icon: FileText,
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_4rgybp4rgybp4rgy.png',
  },
  {
    title: 'Flexible Miete',
    description:
      'Mieten Sie den Messroboter für Ihr Projekt - ohne hohe Anschaffungskosten.',
    icon: Calendar,
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_rkbqzyrkbqzyrkbq.png',
  },
  {
    title: 'Einfache Integration',
    description:
      'Verbinden Sie Ihre Systeme über unsere API und automatisieren Sie Ihren Workflow.',
    icon: Plug,
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_2xr9np2xr9np2xr9.png',
  },
]

// Desktop: Stacking Rows (2 Karten pro Reihe)
function StackingRow({
  row,
  rowIndex,
}: {
  row: typeof features
  rowIndex: number
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'start start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  const isEvenRow = rowIndex % 2 === 0

  return (
    <motion.div
      ref={rowRef}
      className="sticky grid-cols-5 gap-4 hidden lg:grid"
      style={{
        scale,
        top: `${100 + rowIndex * 30}px`,
        zIndex: rowIndex + 1,
      }}
    >
      {row.map((feature, colIndex) => {
        const isLarge = isEvenRow ? colIndex === 0 : colIndex === 1
        const globalIndex = rowIndex * 2 + colIndex

        return (
          <motion.div
            key={feature.title}
            className={isLarge ? 'col-span-3' : 'col-span-2'}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: colIndex * 0.1, duration: 0.5 }}
          >
            <BentoCard
              title={feature.title}
              description={feature.description}
              image={feature.image}
              imageAlt={feature.title}
              icon={<feature.icon size={32} />}
              size={isLarge ? 'lg' : 'md'}
              glowDelay={-globalIndex * 0.3}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// Mobile: Einzelne Stacking Cards
function MobileStackingCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  return (
    <motion.div
      ref={cardRef}
      className="sticky lg:hidden"
      style={{
        scale,
        top: `${80 + index * 20}px`,
        zIndex: index + 1,
      }}
    >
      <BentoCard
        title={feature.title}
        description={feature.description}
        image={feature.image}
        imageAlt={feature.title}
        icon={<feature.icon size={32} />}
        size="md"
        glowDelay={-index * 0.3}
      />
    </motion.div>
  )
}

export default function Features() {
  // Paare bilden für Desktop: [0,1], [2,3], [4,5]
  const rows: (typeof features)[] = []
  for (let i = 0; i < features.length; i += 2) {
    rows.push(features.slice(i, i + 2))
  }

  return (
    <section className="py-20">
      <Container size="wide">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="gradient" className="mb-4">
            Funktionen
          </Badge>
          <SplitText
            text="Alles was Sie für präzise Messungen brauchen"
            tag="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            splitType="words"
            delay={0.08}
          />
          <p className="text-lg text-[var(--theme-textSecondary)]">
            Von der autonomen Datenerfassung bis zur detaillierten Auswertung -
            unser System deckt den gesamten Messprozess ab.
          </p>
        </motion.div>

        {/* Desktop: Stacking Bento Grid (2 pro Reihe) */}
        <div className="space-y-4 hidden lg:block">
          {rows.map((row, rowIndex) => (
            <StackingRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
            />
          ))}
        </div>

        {/* Mobile: Einzelne Stacking Cards */}
        <div className="space-y-4 lg:hidden">
          {features.map((feature, index) => (
            <MobileStackingCard
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
