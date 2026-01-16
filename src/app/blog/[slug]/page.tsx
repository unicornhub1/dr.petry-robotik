'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Linkedin,
  Twitter,
  Link2,
  ChevronRight,
  Bot,
  Gauge,
  Battery,
  Shield,
} from 'lucide-react'
import { Container, Badge } from '@/components/ui'
import Button from '@/components/ui/Button'

// Blog post data (in real app, this would come from CMS)
const blogPosts: Record<string, {
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  author: string
  authorRole: string
  image: string
  content: {
    type: 'heading' | 'paragraph' | 'image' | 'cta' | 'list' | 'quote'
    id?: string
    text?: string
    src?: string
    alt?: string
    items?: string[]
  }[]
}> = {
  'messroboter-mr1-vorstellung': {
    title: 'Der MR-1: Unser autonomer Messroboter im Detail',
    excerpt: 'Lernen Sie den MR-1 kennen - unseren autonomen Messroboter für professionelle Beleuchtungsmessungen. Erfahren Sie alles über Technik, Einsatzgebiete und Vorteile.',
    category: 'Produkt',
    date: '15. Januar 2025',
    readTime: '8 min',
    author: 'IB Dr. Petry',
    authorRole: 'Ingenieurbüro für Lichttechnik',
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_zhdezazhdezazhde.png',
    content: [
      {
        type: 'heading',
        id: 'einfuehrung',
        text: 'Einführung',
      },
      {
        type: 'paragraph',
        text: 'Die Beleuchtungsmessung ist ein kritischer Bestandteil der Qualitätssicherung in vielen Bereichen - von Sportstätten über Industriehallen bis hin zu Bürogebäuden. Traditionell erfordert diese Aufgabe erheblichen Personalaufwand und ist zeitintensiv. Mit dem MR-1 haben wir einen autonomen Messroboter entwickelt, der diese Herausforderungen löst.',
      },
      {
        type: 'paragraph',
        text: 'Der MR-1 kombiniert hochpräzise Sensorik mit intelligenter Navigation und ermöglicht so vollautomatische Beleuchtungsmessungen nach DIN EN 12193 und DIN EN 12464. In diesem Artikel stellen wir Ihnen unseren Roboter im Detail vor.',
      },
      {
        type: 'heading',
        id: 'technische-daten',
        text: 'Technische Daten',
      },
      {
        type: 'paragraph',
        text: 'Der MR-1 wurde von Grund auf für den professionellen Einsatz konzipiert. Jede Komponente wurde sorgfältig ausgewählt, um maximale Präzision und Zuverlässigkeit zu gewährleisten.',
      },
      {
        type: 'list',
        items: [
          'Messgenauigkeit: 0.1 Lux - wissenschaftliche Präzision für normgerechte Dokumentation',
          'Akkulaufzeit: bis zu 8 Stunden - ausreichend für große Messareale',
          'Konnektivität: 4G/5G und WLAN - Echtzeit-Datenübertragung ins Dashboard',
          'Schutzklasse: IP65 - wetterfester Betrieb auch bei Regen und Schnee',
          'Messpunkte pro Stunde: bis zu 200 - effiziente Flächenabdeckung',
          'Betriebstemperatur: -10°C bis +45°C - ganzjähriger Einsatz möglich',
        ],
      },
      {
        type: 'image',
        src: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_2xr9np2xr9np2xr9.png',
        alt: 'MR-1 Messroboter bei der Arbeit',
      },
      {
        type: 'heading',
        id: 'einsatzgebiete',
        text: 'Einsatzgebiete',
      },
      {
        type: 'paragraph',
        text: 'Der MR-1 ist vielseitig einsetzbar. Überall dort, wo präzise und normgerechte Beleuchtungsmessungen erforderlich sind, kann unser Roboter seine Stärken ausspielen.',
      },
      {
        type: 'list',
        items: [
          'Sportplätze und Stadien: Normgerechte Messung nach DIN EN 12193 für Fußball, Tennis, Leichtathletik',
          'Industriehallen: Arbeitsschutzgerechte Beleuchtungsprüfung in Produktions- und Lagerhallen',
          'Bürogebäude: Ergonomische Lichtverhältnisse nach ASR A3.4 für produktives Arbeiten',
          'Parkplätze und Außenanlagen: Sicherheitsrelevante Beleuchtungsmessung für Parkflächen',
        ],
      },
      {
        type: 'cta',
      },
      {
        type: 'heading',
        id: 'vorteile',
        text: 'Vorteile gegenüber manueller Messung',
      },
      {
        type: 'paragraph',
        text: 'Im Vergleich zur traditionellen manuellen Lichtmessung bietet der MR-1 erhebliche Vorteile in Bezug auf Effizienz, Genauigkeit und Kosten.',
      },
      {
        type: 'quote',
        text: 'Mit dem MR-1 haben wir die Messzeit für einen kompletten Sportplatz von 2 Tagen auf 4 Stunden reduziert - bei gleichzeitig höherer Messgenauigkeit.',
      },
      {
        type: 'list',
        items: [
          'Zeitersparnis: Bis zu 80% schneller als manuelle Messung',
          'Kosteneffizienz: Kein Personal vor Ort erforderlich',
          'Präzision: Konstant hohe Messgenauigkeit ohne menschliche Fehler',
          'Dokumentation: Automatische GPS-Zuordnung jedes Messpunkts',
          'Flexibilität: Messungen auch nachts oder bei schlechtem Wetter',
        ],
      },
      {
        type: 'heading',
        id: 'dashboard',
        text: 'Das Dashboard',
      },
      {
        type: 'paragraph',
        text: 'Alle Messdaten werden in Echtzeit an unser webbasiertes Dashboard übertragen. Dort können Sie den Fortschritt live verfolgen, Ergebnisse analysieren und professionelle Reports generieren.',
      },
      {
        type: 'paragraph',
        text: 'Das Dashboard bietet umfangreiche Visualisierungsmöglichkeiten: Von Heatmaps über Trendanalysen bis hin zu normgerechten Prüfprotokollen. Der Export in verschiedene Formate (PDF, Excel, CSV) ist selbstverständlich möglich.',
      },
      {
        type: 'heading',
        id: 'fazit',
        text: 'Fazit',
      },
      {
        type: 'paragraph',
        text: 'Der MR-1 repräsentiert die nächste Generation der Beleuchtungsmesstechnik. Mit seiner Kombination aus Autonomie, Präzision und Effizienz setzt er neue Maßstäbe in der Branche. Ob für regelmäßige Wartungsmessungen oder einmalige Abnahmeprüfungen - der MR-1 liefert zuverlässig normgerechte Ergebnisse.',
      },
      {
        type: 'paragraph',
        text: 'Interessiert? Kontaktieren Sie uns für eine unverbindliche Beratung oder eine Vor-Ort-Demonstration.',
      },
    ],
  },
}

// Table of contents from content
function generateToc(content: typeof blogPosts[string]['content']) {
  return content
    .filter((item) => item.type === 'heading' && item.id)
    .map((item) => ({
      id: item.id!,
      text: item.text!,
    }))
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  const post = blogPosts[slug]

  if (!post) {
    return (
      <Container size="wide" className="py-32 text-center">
        <h1 className="text-2xl font-bold text-[var(--theme-text)] mb-4">
          Artikel nicht gefunden
        </h1>
        <Link href="/blog" className="text-[var(--accent-primary)]">
          Zurück zum Blog
        </Link>
      </Container>
    )
  }

  const toc = generateToc(post.content)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-12">
        <Container size="wide">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <ArrowLeft size={18} />
              Zurück zum Blog
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge variant="gradient" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--theme-text)] mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-[var(--theme-textSecondary)] mb-8">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--theme-textSecondary)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-semibold">
                  {post.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-[var(--theme-text)]">{post.author}</p>
                  <p className="text-xs">{post.authorRole}</p>
                </div>
              </div>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {post.readTime} Lesezeit
              </span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Featured Image */}
      <section className="pb-12">
        <Container size="wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.div>
        </Container>
      </section>

      {/* Content with Sidebar */}
      <section className="pb-20">
        <Container size="wide">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose-custom"
            >
              {post.content.map((block, index) => {
                switch (block.type) {
                  case 'heading':
                    return (
                      <h2
                        key={index}
                        id={block.id}
                        className="text-2xl font-bold text-[var(--theme-text)] mt-12 mb-4 first:mt-0 scroll-mt-24"
                      >
                        {block.text}
                      </h2>
                    )
                  case 'paragraph':
                    return (
                      <p
                        key={index}
                        className="text-[var(--theme-textSecondary)] leading-relaxed mb-6"
                      >
                        {block.text}
                      </p>
                    )
                  case 'list':
                    return (
                      <ul key={index} className="space-y-3 mb-6">
                        {block.items?.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-[var(--theme-textSecondary)]"
                          >
                            <ChevronRight
                              size={18}
                              className="text-[var(--accent-primary)] shrink-0 mt-0.5"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )
                  case 'image':
                    return (
                      <div key={index} className="my-8 rounded-xl overflow-hidden">
                        <img
                          src={block.src}
                          alt={block.alt}
                          className="w-full h-auto"
                        />
                      </div>
                    )
                  case 'quote':
                    return (
                      <blockquote
                        key={index}
                        className="my-8 pl-6 border-l-4 border-[var(--accent-primary)] italic text-lg text-[var(--theme-text)]"
                      >
                        {block.text}
                      </blockquote>
                    )
                  case 'cta':
                    return (
                      <div
                        key={index}
                        className="my-12 p-8 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20"
                      >
                        <h3 className="text-xl font-bold text-[var(--theme-text)] mb-3">
                          Interesse geweckt?
                        </h3>
                        <p className="text-[var(--theme-textSecondary)] mb-6">
                          Lassen Sie sich unverbindlich beraten und erfahren Sie, wie der MR-1
                          Ihre Beleuchtungsmessungen optimieren kann.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Button variant="primary" href="/kontakt">
                            Beratung anfragen
                          </Button>
                          <Button variant="secondary" href="/produkt">
                            Mehr zum MR-1
                          </Button>
                        </div>
                      </div>
                    )
                  default:
                    return null
                }
              })}

              {/* Share */}
              <div className="mt-12 pt-8 border-t border-[var(--theme-border)]">
                <p className="text-sm font-medium text-[var(--theme-text)] mb-4">
                  Artikel teilen
                </p>
                <div className="flex gap-3">
                  {[
                    { icon: Linkedin, label: 'LinkedIn' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Link2, label: 'Link kopieren' },
                  ].map((social) => (
                    <button
                      key={social.label}
                      className="p-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-colors"
                      title={social.label}
                    >
                      <social.icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.article>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)]">
                  <h3 className="font-semibold text-[var(--theme-text)] mb-4">
                    Inhaltsverzeichnis
                  </h3>
                  <nav className="space-y-2">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors py-1"
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Product Card */}
                <div className="relative p-[1px] rounded-2xl overflow-hidden" style={{ isolation: 'isolate' }}>
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                    }}
                  />
                  <div className="relative z-10 bg-[var(--theme-surface)] rounded-2xl p-6">
                    <img
                      src="/Bilder/iloveimg-compressed/Gemini_Generated_Image_zhdezazhdezazhde.png"
                      alt="MR-1 Messroboter"
                      className="w-full h-32 object-cover rounded-xl mb-4"
                    />
                    <h3 className="font-semibold text-[var(--theme-text)] mb-2">
                      Messroboter MR-1
                    </h3>
                    <p className="text-sm text-[var(--theme-textSecondary)] mb-4">
                      Autonome Lichtmessung der nächsten Generation.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { icon: Gauge, value: '0.1 Lux' },
                        { icon: Battery, value: '8h+' },
                        { icon: Shield, value: 'IP65' },
                        { icon: Bot, value: 'Autonom' },
                      ].map((spec, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-[var(--theme-textSecondary)]"
                        >
                          <spec.icon size={14} className="text-[var(--accent-primary)]" />
                          {spec.value}
                        </div>
                      ))}
                    </div>
                    <Button variant="primary" href="/produkt" className="w-full">
                      Mehr erfahren
                    </Button>
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)]">
                  <h3 className="font-semibold text-[var(--theme-text)] mb-2">
                    Fragen?
                  </h3>
                  <p className="text-sm text-[var(--theme-textSecondary)] mb-4">
                    Wir beraten Sie gerne persönlich.
                  </p>
                  <Button variant="secondary" href="/kontakt" className="w-full">
                    Kontakt aufnehmen
                  </Button>
                </div>
              </div>
            </motion.aside>
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-[var(--theme-surface)]">
        <Container size="wide">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--theme-text)] mb-4">
              Bereit für präzise Lichtmessung?
            </h2>
            <p className="text-[var(--theme-textSecondary)] mb-8">
              Kontaktieren Sie uns für eine unverbindliche Beratung oder eine
              Vor-Ort-Demonstration des MR-1.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" href="/kontakt">
                Beratung anfragen
              </Button>
              <Button variant="secondary" href="/dashboard">
                Dashboard Demo
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  )
}
