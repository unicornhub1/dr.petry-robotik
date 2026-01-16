'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projekte', href: '/dashboard/projekte', icon: FolderOpen },
  { name: 'Messungen', href: '/dashboard/messungen', icon: BarChart3 },
  { name: 'Roboter', href: '/dashboard/roboter', icon: Bot },
  { name: 'Einstellungen', href: '/dashboard/einstellungen', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[var(--theme-surface)] border-r border-[var(--theme-border)] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--theme-border)]">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                }}
              >
                <Bot size={18} className="text-white" />
              </div>
              <span className="font-semibold text-[var(--theme-text)]">MR-1 Dashboard</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--theme-background)] text-[var(--theme-textSecondary)]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Back to Homepage */}
          <div className="px-4 pt-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[var(--theme-textSecondary)] hover:bg-[var(--theme-background)] hover:text-[var(--theme-text)] transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Zur Startseite
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--theme-textSecondary)] hover:bg-[var(--theme-background)] hover:text-[var(--theme-text)] transition-colors group"
              >
                <item.icon size={20} className="group-hover:text-[var(--accent-primary)] transition-colors" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[var(--theme-border)]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-background)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-semibold">
                MP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--theme-text)] truncate">Max Petry</p>
                <p className="text-xs text-[var(--theme-textSecondary)] truncate">admin@dr-petry.de</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-[var(--theme-surface)] text-[var(--theme-textSecondary)]">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--theme-background)]/80 backdrop-blur-xl border-b border-[var(--theme-border)]">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[var(--theme-surface)] text-[var(--theme-textSecondary)]"
              >
                <Menu size={20} />
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] w-80">
                <Search size={18} className="text-[var(--theme-textTertiary)]" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  className="flex-1 bg-transparent text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)] outline-none"
                />
                <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 rounded bg-[var(--theme-background)] text-[10px] text-[var(--theme-textTertiary)] border border-[var(--theme-border)]">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <button className="relative p-2 rounded-lg hover:bg-[var(--theme-surface)] text-[var(--theme-textSecondary)]">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
              </button>

              <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-[var(--theme-border)]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-sm font-semibold">
                  MP
                </div>
                <ChevronDown size={16} className="text-[var(--theme-textSecondary)]" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
