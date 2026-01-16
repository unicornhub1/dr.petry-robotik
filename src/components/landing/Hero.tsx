'use client'

import { motion } from 'framer-motion'
import { Bot, Radio, Gauge, Clock, Wifi, MapPin, Zap, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Badge, Container, ColorBends, SplitText, FloatingBadge } from '@/components/ui'

export default function Hero() {
  return (
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
        />
        {/* Light Overlay */}
        <div className="absolute inset-0 bg-[var(--theme-background)]/60" />
      </div>
      <Container size="wide" className="relative z-10">
        {/* Text Content - Centered */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Badge variant="gradient">
              Autonome Messtechnik
            </Badge>
          </motion.div>

          <SplitText
            text="Präzise Lichtmessung. Vollautomatisch."
            tag="h1"
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            splitType="words"
            delay={0.08}
          />

          <motion.p
            className="text-lg md:text-xl text-[var(--theme-textSecondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Unser autonomer Messroboter erfasst Beleuchtungsdaten mit
            wissenschaftlicher Präzision - rund um die Uhr, ohne Personalaufwand.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button variant="primary" href="/kontakt">
              Roboter anfragen
            </Button>
            <Button variant="secondary" href="/produkt">
              Mehr erfahren
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Image with Floating Specs */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Glow Effect */}
          <div
            className="absolute -inset-6 rounded-[32px] blur-3xl opacity-30"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            }}
          />

          {/* Image with Animated Border (like BentoCards) */}
          <div
            className="relative rounded-[24px] bg-[var(--theme-border)] p-[1px] overflow-hidden group"
            style={{ isolation: 'isolate' }}
          >
            {/* Rotating Glow Beam - wie bei BentoCard */}
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

            {/* Image Container */}
            <div className="relative z-[1] rounded-[23px] overflow-hidden bg-[var(--theme-background)]">
              <img
                src="/Bilder/iloveimg-compressed/unnamed.jpg"
                alt="Messroboter MR-1 auf Sportplatz"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Floating Badges - Asynchron wie Dashboard Section */}

          {/* Top Right */}
          <FloatingBadge
            icon={<Bot size={20} className="text-white" />}
            title="MR-1"
            subtitle="Messroboter"
            delay={0.6}
            gradientDirection="primary"
            className="absolute -top-4 -right-4 md:-top-6 md:-right-6"
          />

          {/* Bottom Left */}
          <FloatingBadge
            icon={<Gauge size={20} className="text-white" />}
            title="0.1 Lux"
            subtitle="Messgenauigkeit"
            delay={0.8}
            gradientDirection="secondary"
            className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6"
          />
        </motion.div>
      </Container>
    </section>
  )
}
