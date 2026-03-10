'use client'

import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  BarChart3,
  Bell,
  User,
} from 'lucide-react'
import Sidebar from './Sidebar'
import type { SidebarItem } from './Sidebar'
import { ThemeToggle } from '@/components/ui'
import { NotificationBell } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'

const customerNavItems: SidebarItem[] = [
  { label: 'Uebersicht', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sportanlagen', href: '/dashboard/facilities', icon: MapPin },
  { label: 'Auftraege', href: '/dashboard/orders', icon: ClipboardList },
  { label: 'Ergebnisse', href: '/dashboard/results', icon: BarChart3 },
  { label: 'Nachrichten', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profil', href: '/dashboard/profile', icon: User },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, isApproved, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email
    : ''

  return (
    <div className="min-h-screen bg-[var(--theme-background)] flex">
      <Sidebar items={customerNavItems} title="Kundenportal" />

      {/* Main content offset for sidebar */}
      <div className="flex-1 flex flex-col ml-16 md:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--theme-background)]/80 backdrop-blur-xl border-b border-[var(--theme-border)] shrink-0">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left: pending approval badge */}
            <div className="flex items-center gap-3">
              {!isApproved && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                  Account wird geprueft
                </span>
              )}
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
              {displayName && (
                <span className="hidden md:block text-sm font-medium text-[var(--theme-text)] ml-2">
                  {displayName}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)] transition-colors border border-[var(--theme-border)]"
              >
                Abmelden
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
