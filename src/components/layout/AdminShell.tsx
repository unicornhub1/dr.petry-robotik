'use client'

import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  MapPin,
  CreditCard,
  CalendarDays,
  BarChart3,
  Bell,
  Mail,
} from 'lucide-react'
import Sidebar from './Sidebar'
import type { SidebarItem } from './Sidebar'
import { ThemeToggle } from '@/components/ui'
import { NotificationBell } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'

const adminNavItems: SidebarItem[] = [
  { label: 'Übersicht', href: '/admin', icon: LayoutDashboard },
  { label: 'Nutzer', href: '/admin/users', icon: Users },
  { label: 'Aufträge', href: '/admin/orders', icon: ClipboardList },
  { label: 'Pakete', href: '/admin/packages', icon: Package },
  { label: 'Platzarten', href: '/admin/facility-types', icon: MapPin },
  { label: 'Preise', href: '/admin/pricing', icon: CreditCard },
  { label: 'Termine', href: '/admin/schedule', icon: CalendarDays },
  { label: 'Ergebnisse', href: '/admin/results', icon: BarChart3 },
  { label: 'Nachrichten', href: '/admin/notifications', icon: Bell },
  { label: 'E-Mail Templates', href: '/admin/email-templates', icon: Mail },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)] flex">
      <Sidebar
        items={adminNavItems}
        title="Admin"
        userEmail={profile?.email}
        onSignOut={handleSignOut}
      />

      {/* Main content offset for sidebar */}
      <div className="flex-1 flex flex-col ml-16 md:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--theme-background)]/80 backdrop-blur-xl border-b border-[var(--theme-border)] shrink-0">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left: admin label */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                Admin
              </span>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
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
