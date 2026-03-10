'use client'

import Badge from './Badge'

type OrderStatus =
  | 'requested'
  | 'confirmed'
  | 'scheduled'
  | 'measuring'
  | 'completed'
  | 'rejected'
  | 'individual_request'

interface StatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md'
}

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error'

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant }
> = {
  requested: { label: 'Angefragt', variant: 'warning' },
  confirmed: { label: 'Bestaetigt', variant: 'primary' },
  scheduled: { label: 'Geplant', variant: 'primary' },
  measuring: { label: 'In Messung', variant: 'warning' },
  completed: { label: 'Abgeschlossen', variant: 'success' },
  rejected: { label: 'Abgelehnt', variant: 'error' },
  individual_request: { label: 'Individualanfrage', variant: 'default' },
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}
