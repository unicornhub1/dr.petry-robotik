'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  Bot,
  Gauge,
  Battery,
  Wifi,
  Shield,
  Ruler,
  Timer,
  Thermometer,
  CheckCircle,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Container, Badge, SplitText, FloatingBadge } from '@/components/ui'

const ColorBends = dynamic(() => import('@/components/ui/ColorBends'), { ssr: false })
const GridMotion = dynamic(() => import('@/components/ui/GridMotion'), { ssr: false })

const specifications = [
  { icon: Ruler, label: 'Abmessungen', value: '60 x 45 x 35 cm' },
  { icon: Battery, label: 'Akkulaufzeit', value: 'bis zu 8 Stunden' },
  { icon: Gauge, label: 'Messgenauigkeit', value: '0.1 Lux' },
  { icon: Timer, label: 'Messpunkte/Stunde', value: 'bis zu 200' },
  { icon: Wifi, label: 'Konnektivität', value: '4G/5G, WLAN' },
  { icon: Thermometer, label: 'Betriebstemperatur', value: '-10°C bis +45°C' },
]

const vorteile = [
  'Vollautomatische Messung ohne Personal vor Ort',
  'Dokumentation nach DIN EN 12193 und DIN EN 12464',
  'Echtzeit-Datenübertragung ins Dashboard',
  'GPS-genaue Positionierung jedes Messpunkts',
  'Wetterfester Betrieb bei Regen und Schnee',
  'Hinderniserkennung und autonome Navigation',
]

const einsatzgebiete = [
  { title: 'Sportplätze', desc: 'Normgerechte Beleuchtungsmessung für Fußballplätze, Tennisanlagen und Stadien.' },
  { title: 'Industriehallen', desc: 'Arbeitsschutzgerechte Beleuchtungsprüfung in Produktions- und Lagerhallen.' },
  { title: 'Bürogebäude', desc: 'Ergonomische Lichtverhältnisse für produktives Arbeiten nach ASR A3.4.' },
  { title: 'Parkplätze', desc: 'Sicherheitsrelevante Beleuchtungsmessung für Parkflächen und Zufahrten.' },
]

export default function ProduktPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center -mt-20 pt-40 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 w-full h-full">
          <ColorBends
            colors={['#da4e24', '#ff6b3d', '#0098f3']}
            rotation={45}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0}
            parallax={0}
            noise={0.1}
            autoRotate={0}
            transparent
            quality="medium"
          />
          {/* Light Overlay */}
          <div className="absolute inset-0 bg-[var(--theme-background)]/60" />
        </div>

        <Container size="wide" className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="gradient" className="mb-4">
                Messroboter MR-1
              </Badge>
              <SplitText
                text="Autonome Lichtmessung der nächsten Generation"
                tag="h1"
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                splitType="words"
                delay={0.08}
              />
              <p className="text-lg text-[var(--theme-textSecondary)] mb-8 leading-relaxed">
                Der MR-1 ist unser autonomer Messroboter für professionelle
                Beleuchtungsmessungen. Mit hochpräziser Sensorik und intelligenter
                Navigation erfasst er Beleuchtungsdaten vollautomatisch.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" href="/kontakt">
                  Roboter anfragen
                </Button>
                <Button variant="secondary" href="/dashboard">
                  Dashboard Demo
                </Button>
              </div>
            </motion.div>

            {/* Robot Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Glow */}
              <div
                className="absolute -inset-6 rounded-[32px] blur-3xl opacity-30"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                }}
              />

              {/* Image with Animated Border */}
              <div
                className="relative rounded-[24px] bg-[var(--theme-border)] p-[1px] overflow-hidden"
                style={{ isolation: 'isolate' }}
              >
                <div
                  className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-100"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 320deg, var(--accent-primary) 340deg, transparent 360deg)`,
                  }}
                />
                <div className="relative z-[1] rounded-[23px] overflow-hidden bg-[var(--theme-background)]">
                  <img
                    src="/Bilder/iloveimg-compressed/Gemini_Generated_Image_zhdezazhdezazhde.png"
                    alt="Messroboter MR-1"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Floating Badges */}
              <FloatingBadge
                icon={<Gauge size={20} className="text-white" />}
                title="0.1 Lux"
                subtitle="Präzision"
                delay={0.6}
                gradientDirection="primary"
                className="absolute -top-4 -right-4 md:-top-6 md:-right-6"
              />
              <FloatingBadge
                icon={<Battery size={20} className="text-white" />}
                title="8h+"
                subtitle="Akkulaufzeit"
                delay={0.8}
                gradientDirection="secondary"
                className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6"
              />
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Grid Motion Gallery */}
      <section className="relative">
        <GridMotion
          items={[
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_zhdezazhdezazhde.png',
            <div key="spec-1" className="flex flex-col items-center justify-center h-full">
              <Gauge className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">0.1 Lux</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Präzision</span>
            </div>,
            '/Bilder/iloveimg-compressed/unnamed.jpg',
            <div key="spec-2" className="flex flex-col items-center justify-center h-full">
              <Battery className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">8h+</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Laufzeit</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_rkbqzyrkbqzyrkbq.png',
            <div key="spec-3" className="flex flex-col items-center justify-center h-full">
              <Shield className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">IP65</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Wetterfest</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_2xr9np2xr9np2xr9.png',
            <div key="spec-4" className="flex flex-col items-center justify-center h-full">
              <Wifi className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">5G</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Vernetzt</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_4rgybp4rgybp4rgy.png',
            <div key="spec-5" className="flex flex-col items-center justify-center h-full">
              <Bot className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">100%</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Autonom</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_zhdezazhdezazhde.png',
            <div key="spec-6" className="flex flex-col items-center justify-center h-full">
              <Timer className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">200+</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Messpunkte/h</span>
            </div>,
            '/Bilder/iloveimg-compressed/unnamed.jpg',
            <div key="spec-7" className="flex flex-col items-center justify-center h-full">
              <MapPin className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">GPS</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Tracking</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_rkbqzyrkbqzyrkbq.png',
            <div key="spec-8" className="flex flex-col items-center justify-center h-full">
              <Zap className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">Schnell</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Einsatzbereit</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_2xr9np2xr9np2xr9.png',
            <div key="spec-9" className="flex flex-col items-center justify-center h-full">
              <Ruler className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">Kompakt</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">60x45x35cm</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_4rgybp4rgybp4rgy.png',
            <div key="spec-10" className="flex flex-col items-center justify-center h-full">
              <Thermometer className="w-8 h-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-bold text-lg">-10 bis +45°C</span>
              <span className="text-sm text-[var(--theme-textSecondary)]">Betriebstemp.</span>
            </div>,
            '/Bilder/iloveimg-compressed/Gemini_Generated_Image_zhdezazhdezazhde.png',
          ]}
        />
      </section>

      {/* Specifications */}
      <section className="py-20">
        <Container size="wide">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="gradient" className="mb-4">
              Technische Daten
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--theme-text)]">
              Spezifikationen im Überblick
            </h2>
            <p className="text-lg text-[var(--theme-textSecondary)]">
              Der MR-1 vereint modernste Sensorik mit robuster Konstruktion.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specifications.map((spec, index) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-[1px] rounded-2xl overflow-hidden group"
                style={{ isolation: 'isolate' }}
              >
                <div
                  className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                  }}
                />
                <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-6 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    }}
                  >
                    <spec.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--theme-textSecondary)]">{spec.label}</p>
                    <p className="text-lg font-semibold text-[var(--theme-text)]">{spec.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Vorteile */}
      <section className="py-20">
        <Container size="wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="gradient" className="mb-4">
                Vorteile
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--theme-text)]">
                Warum der MR-1?
              </h2>
              <p className="text-lg text-[var(--theme-textSecondary)] mb-8">
                Unser Messroboter spart Zeit und Kosten bei gleichzeitig
                höherer Messgenauigkeit als manuelle Verfahren.
              </p>

              <div className="space-y-4">
                {vorteile.map((vorteil, index) => (
                  <motion.div
                    key={vorteil}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--theme-text)]">{vorteil}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                { icon: Bot, label: 'Autonom', value: '100%' },
                { icon: Gauge, label: 'Präzision', value: '0.1 Lux' },
                { icon: Shield, label: 'Wetterfest', value: 'IP65' },
                { icon: Timer, label: 'Laufzeit', value: '8h+' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="relative p-[1px] rounded-2xl overflow-hidden"
                  style={{ isolation: 'isolate' }}
                >
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                    }}
                  />
                  <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-6 text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-[var(--accent-primary)]" />
                    <p
                      className="text-2xl font-bold mb-1"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm text-[var(--theme-textSecondary)]">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Einsatzgebiete */}
      <section className="py-20 bg-[var(--theme-surface)]">
        <Container size="wide">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="gradient" className="mb-4">
              Anwendungsbereiche
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--theme-text)]">
              Einsatzgebiete
            </h2>
            <p className="text-lg text-[var(--theme-textSecondary)]">
              Der MR-1 ist vielseitig einsetzbar - überall dort, wo präzise
              Beleuchtungsmessungen gefragt sind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {einsatzgebiete.map((gebiet, index) => (
              <motion.div
                key={gebiet.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-[1px] rounded-2xl overflow-hidden group"
                style={{ isolation: 'isolate' }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                  }}
                />
                <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    >
                      <MapPin size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--theme-text)] mb-2">
                        {gebiet.title}
                      </h3>
                      <p className="text-[var(--theme-textSecondary)]">
                        {gebiet.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container size="wide">
          <motion.div
            className="relative p-[1px] rounded-3xl overflow-hidden"
            style={{ isolation: 'isolate' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-100"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 320deg, var(--accent-primary) 340deg, transparent 360deg)`,
              }}
            />
            <div className="relative z-10 bg-[var(--theme-background)] rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--theme-text)]">
                Interesse am MR-1?
              </h2>
              <p className="text-lg text-[var(--theme-textSecondary)] mb-8 max-w-2xl mx-auto">
                Kontaktieren Sie uns für ein unverbindliches Angebot oder
                eine Vor-Ort-Demonstration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" href="/kontakt">
                  Anfrage stellen
                </Button>
                <Button variant="secondary" href="/dashboard">
                  Dashboard Demo
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  )
}
