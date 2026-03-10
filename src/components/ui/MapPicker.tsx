'use client'

import dynamic from 'next/dynamic'

export interface MapPickerProps {
  latitude?: number
  longitude?: number
  onChange: (lat: number, lng: number, address: string) => void
}

// Dynamic import with ssr:false to avoid leaflet SSR issues
const MapPickerClient = dynamic(() => import('./MapPickerClient'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-64 rounded-[var(--radius-xl)] border border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-center"
    >
      <span className="text-sm text-[var(--theme-textTertiary)]">Karte wird geladen...</span>
    </div>
  ),
})

export default function MapPicker(props: MapPickerProps) {
  return <MapPickerClient {...props} />
}
