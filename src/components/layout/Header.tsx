'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/icons'
import { ThemeToggle } from '@/components/ui'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/lib/config'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Container matching Hero width */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center justify-between w-full px-4 py-2.5 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: 'var(--header-bg)',
              backdropFilter: 'var(--header-blur)',
              WebkitBackdropFilter: 'var(--header-blur)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--header-border)',
            }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Navigation Links - Centered */}
            <div className="flex items-center gap-1">
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-surfaceHover)] transition-all duration-200 text-sm font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Theme Toggle + CTA */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="primary" href="/kontakt">
                Anfrage stellen
              </Button>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <nav
            className="flex lg:hidden items-center justify-between w-full px-4 py-2.5 rounded-xl"
            style={{
              backgroundColor: 'var(--header-bg)',
              backdropFilter: 'var(--header-blur)',
              WebkitBackdropFilter: 'var(--header-blur)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--header-border)',
            }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-surfaceHover)] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop - Dark blur matching the header style */}
            <motion.div
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.nav
              className="relative h-full flex flex-col items-center justify-center gap-6 pt-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
            >
              {siteConfig.navigation.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Button variant="primary" href="/kontakt" onClick={() => setIsMobileMenuOpen(false)}>
                  Anfrage stellen
                </Button>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
