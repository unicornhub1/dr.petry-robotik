'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  BarChart3,
  Bell,
  User,
  Lock,
  Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import type { SidebarItem } from './Sidebar'
import { ThemeToggle } from '@/components/ui'
import { NotificationBell } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'

// Pages that are blocked when account is not approved
const RESTRICTED_PATHS = [
  '/dashboard/orders',
  '/dashboard/results',
]

const customerNavItems: SidebarItem[] = [
  { label: 'Übersicht', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sportanlagen', href: '/dashboard/facilities', icon: MapPin },
  { label: 'Aufträge', href: '/dashboard/orders', icon: ClipboardList },
  { label: 'Ergebnisse', href: '/dashboard/results', icon: BarChart3 },
  { label: 'Nachrichten', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profil', href: '/dashboard/profile', icon: User },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, isApproved, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Only show restriction AFTER profile is loaded - prevents flash
  const isRestricted = !isLoading && profile !== null && !isApproved && RESTRICTED_PATHS.some((p) => pathname.startsWith(p))

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)] flex">
      <Sidebar
        items={customerNavItems}
        title="Kundenportal"
        userEmail={profile?.email}
        onSignOut={handleSignOut}
      />

      {/* Main content offset for sidebar */}
      <div className="flex-1 flex flex-col ml-16 md:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--theme-background)]/80 backdrop-blur-xl border-b border-[var(--theme-border)] shrink-0">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left: pending approval badge */}
            <div className="flex items-center gap-3">
              {!isLoading && profile !== null && !isApproved && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Account wird geprüft
                  </span>
                  <span className="hidden sm:inline text-xs text-amber-600/60 dark:text-amber-400/60">
                    &mdash; Einige Funktionen sind eingeschränkt
                  </span>
                </div>
              )}
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative flex-1 p-4 lg:p-8 overflow-auto">
          {children}

          {/* Full-page approval overlay for restricted pages */}
          {isRestricted && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                backgroundColor: 'color-mix(in srgb, var(--theme-background) 85%, transparent)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center max-w-md px-6">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.15))',
                    border: '1px solid rgba(245,158,11,0.25)',
                  }}
                >
                  <Lock size={28} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">
                  Account-Freigabe erforderlich
                </h2>
                <p className="text-sm text-[var(--theme-textSecondary)] mb-6 leading-relaxed">
                  Diese Funktion steht Ihnen zur Verfügung, sobald Ihr Account von unserem Team
                  freigeschaltet wurde. Wir melden uns in Kürze bei Ihnen.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <Clock size={14} />
                  <span>Freigabe wird bearbeitet</span>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
