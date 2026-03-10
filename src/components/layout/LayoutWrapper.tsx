'use client'

import { usePathname } from 'next/navigation'
import { Header, Footer } from '@/components/layout'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isShell =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/onboarding')

  if (isShell) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </>
  )
}
