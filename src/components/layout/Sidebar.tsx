'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import Logo from '@/components/icons/Logo'

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface SidebarProps {
  items: SidebarItem[]
  title: string
}

function isActive(pathname: string, href: string): boolean {
  const segments = href.split('/').filter(Boolean)
  // Root items: exact match (e.g. /dashboard or /admin with only 1 path segment after /)
  if (segments.length <= 1) {
    return pathname === href
  }
  // Deeper items: prefix match
  return pathname === href || pathname.startsWith(href + '/')
}

export default function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 z-40 h-full w-16 md:w-64 bg-[var(--theme-surface)] border-r border-[var(--theme-border)] flex flex-col">
      {/* Logo + Title */}
      <div className="h-16 flex items-center px-3 border-b border-[var(--theme-border)] shrink-0">
        <Link href="/" className="hidden md:flex items-center gap-2 min-w-0">
          <Logo className="h-7 w-auto shrink-0" />
        </Link>
        <Link href="/" className="md:hidden flex items-center justify-center w-10 h-10">
          <Logo className="h-6 w-auto" showText={false} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {items.map((item) => {
          const active = isActive(pathname ?? '', item.href)
          const Icon = item.icon

          return (
            <motion.div key={item.href} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${
                  active
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] hover:text-[var(--theme-text)]'
                }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${active ? 'text-[var(--accent-primary)]' : ''}`}
                />
                <span className="hidden md:block text-sm font-medium truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="hidden md:flex ml-auto items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-semibold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                {/* Mobile badge dot */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="md:hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>
    </aside>
  )
}
