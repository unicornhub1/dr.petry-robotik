'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

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
      {/* Title */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--theme-border)] shrink-0">
        <span className="hidden md:block font-semibold text-[var(--theme-text)] truncate text-sm">
          {title}
        </span>
        {/* Icon placeholder on mobile so header has consistent height */}
        <div className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--theme-background)]">
          <span className="text-xs font-bold text-[var(--theme-textSecondary)]">
            {title.slice(0, 2).toUpperCase()}
          </span>
        </div>
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
