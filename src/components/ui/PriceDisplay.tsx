'use client'

interface PriceDisplayProps {
  priceInCents: number | null
  isApproved: boolean
  className?: string
}

function formatCents(cents: number): string {
  const euros = cents / 100
  return euros.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' EUR'
}

export default function PriceDisplay({
  priceInCents,
  isApproved,
  className = '',
}: PriceDisplayProps) {
  if (!isApproved) {
    return (
      <span
        className={`font-mono text-[var(--theme-textSecondary)] select-none ${className}`}
        aria-label="Preis nicht freigegeben"
        style={{ filter: 'blur(4px)', userSelect: 'none' }}
      >
        ---,-- EUR
      </span>
    )
  }

  if (priceInCents === null) {
    return (
      <span className={`text-[var(--theme-textTertiary)] ${className}`}>
        Auf Anfrage
      </span>
    )
  }

  return (
    <span className={`font-mono font-medium text-[var(--theme-text)] ${className}`}>
      {formatCents(priceInCents)}
    </span>
  )
}
