'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/icons/Logo'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.')
      return
    }

    setError(undefined)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (authError) {
        console.error('Auth error:', authError.message, authError)
        setError(`Fehler: ${authError.message}`)
      } else {
        setIsSent(true)
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)] flex flex-col items-center justify-center px-4">
      {/* Back to homepage */}
      <motion.div
        className="absolute top-6 left-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] transition-colors"
        >
          <ArrowLeft size={16} />
          Zurück zur Startseite
        </Link>
      </motion.div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Card */}
        <div className="relative p-[1px] rounded-2xl overflow-hidden" style={{ isolation: 'isolate' }}>
          {/* Glow border */}
          <div
            className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-60"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 300deg, var(--accent-primary) 330deg, transparent 360deg)`,
            }}
          />

          <div className="relative z-10 bg-[var(--theme-background)] rounded-2xl p-8 md:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo />
            </div>

            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-2xl font-bold text-[var(--theme-text)] mb-2 text-center">
                    Willkommen zurück
                  </h1>
                  <p className="text-[var(--theme-textSecondary)] text-center mb-8 text-sm">
                    Wir senden Ihnen einen sicheren Login-Link an Ihre E-Mail-Adresse.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="E-Mail-Adresse"
                      type="email"
                      placeholder="ihre@email.de"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError(undefined)
                      }}
                      error={error}
                      leftIcon={<Mail size={16} />}
                      autoComplete="email"
                      required
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Wird gesendet...' : 'Login-Link senden'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-[var(--theme-textSecondary)]">
                      Noch kein Konto?{' '}
                      <Link
                        href="/onboarding"
                        className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors font-medium"
                      >
                        Jetzt registrieren
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="text-center"
                >
                  {/* Mail icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    }}
                  >
                    <Mail size={32} className="text-white" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-3">
                    Link gesendet!
                  </h2>
                  <p className="text-[var(--theme-textSecondary)] mb-2 text-sm">
                    Wir haben einen Login-Link an folgende Adresse gesendet:
                  </p>
                  <p className="font-semibold text-[var(--theme-text)] mb-8 text-sm">
                    {email}
                  </p>

                  <p className="text-xs text-[var(--theme-textTertiary)] mb-4">
                    Bitte prüfen Sie auch Ihren Spam-Ordner.
                  </p>

                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="flex items-center gap-2 mx-auto text-sm text-[var(--theme-textSecondary)] hover:text-[var(--accent-primary)] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Wird gesendet...' : 'Link nicht erhalten? Erneut senden'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
