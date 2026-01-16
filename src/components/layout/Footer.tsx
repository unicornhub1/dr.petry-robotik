'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Linkedin, ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/icons'
import { Container } from '@/components/ui'
import { siteConfig } from '@/lib/config'

const footerLinks = {
  produkt: [
    { name: 'Funktionen', href: '/produkt#funktionen' },
    { name: 'Spezifikationen', href: '/produkt#specs' },
    { name: 'Einsatzgebiete', href: '/produkt#einsatz' },
  ],
  service: [
    { name: 'Roboter mieten', href: '/kontakt' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'API-Dokumentation', href: '/docs' },
  ],
  unternehmen: [
    { name: 'Blog', href: '/blog' },
    { name: 'Kontakt', href: '/kontakt' },
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
  ]
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-surfaceAlt)]">
      <Container size="wide">
        <div className="py-16 lg:py-20">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Logo className="mb-6" />
              <p className="text-[var(--theme-textSecondary)] max-w-sm mb-6 leading-relaxed">
                Professionelle Lichtmessung mit autonomen Messrobotern.
                Hochpräzise Daten, vollautomatisch erfasst.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a
                  href={`mailto:${siteConfig.company.email}`}
                  className="flex items-center gap-3 text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  <Mail size={16} />
                  <span className="text-sm">{siteConfig.company.email}</span>
                </a>
                <a
                  href={`tel:${siteConfig.company.phone}`}
                  className="flex items-center gap-3 text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  <Phone size={16} />
                  <span className="text-sm">{siteConfig.company.phone}</span>
                </a>
                <div className="flex items-start gap-3 text-[var(--theme-textSecondary)]">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{siteConfig.company.address}</span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-semibold text-[var(--theme-text)] mb-4">Produkt</h4>
              <ul className="space-y-3">
                {footerLinks.produkt.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--theme-text)] mb-4">Service</h4>
              <ul className="space-y-3">
                {footerLinks.service.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--theme-text)] mb-4">Unternehmen</h4>
              <ul className="space-y-3">
                {footerLinks.unternehmen.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Social */}
              <div className="mt-6 pt-6 border-t border-[var(--theme-border)]">
                <h4 className="font-semibold text-[var(--theme-text)] mb-4">Social</h4>
                <motion.a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                  <ArrowUpRight size={12} />
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[var(--theme-border)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--theme-textTertiary)]">
              {currentYear} {siteConfig.company.name}. Alle Rechte vorbehalten.
            </p>
            <p className="text-xs text-[var(--theme-textTertiary)]">
              Made with precision by UnicornFactory
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
