'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, Loader2, Sparkles } from 'lucide-react'
import type { MapPickerProps } from './MapPicker'
import { detectFacilityType } from '@/lib/osm/detect-facility'

// Default center: Germany
const DEFAULT_LAT = 51.1657
const DEFAULT_LNG = 10.4515
const DEFAULT_ZOOM = 6

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

export default function MapPickerClient({ latitude, longitude, onChange, onFacilityDetected }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detectedInfo, setDetectedInfo] = useState<{ type: string; name?: string } | null>(null)

  const currentLat = latitude ?? DEFAULT_LAT
  const currentLng = longitude ?? DEFAULT_LNG

  const tryDetectFacility = useCallback(async (lat: number, lng: number) => {
    if (!onFacilityDetected) return
    setDetecting(true)
    setDetectedInfo(null)
    try {
      const result = await detectFacilityType(lat, lng)
      if (result) {
        setDetectedInfo({ type: result.type, name: result.osmName })
        onFacilityDetected(result.type, result.osmName)
      }
    } finally {
      setDetecting(false)
    }
  }, [onFacilityDetected])

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'de' } }
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }, [])

  // Initialize leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    let isMounted = true

    const initMap = async () => {
      const L = (await import('leaflet')).default
      // Load leaflet CSS dynamically
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Fix default icon paths
      // @ts-expect-error leaflet icon internal
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!isMounted || !mapContainerRef.current) return

      const initLat = latitude ?? DEFAULT_LAT
      const initLng = longitude ?? DEFAULT_LNG
      const zoom = latitude ? 14 : DEFAULT_ZOOM

      const map = L.map(mapContainerRef.current, {
        center: [initLat, initLng],
        zoom,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map)

      marker.on('dragend', async () => {
        const pos = marker.getLatLng()
        const address = await reverseGeocode(pos.lat, pos.lng)
        onChange(pos.lat, pos.lng, address)
        tryDetectFacility(pos.lat, pos.lng)
      })

      map.on('click', async (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng])
        const address = await reverseGeocode(e.latlng.lat, e.latlng.lng)
        onChange(e.latlng.lat, e.latlng.lng, address)
        tryDetectFacility(e.latlng.lat, e.latlng.lng)
      })

      mapRef.current = map
      markerRef.current = marker

      if (isMounted) setIsMapReady(true)
    }

    initMap()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external lat/lng changes
  useEffect(() => {
    if (!isMapReady || !markerRef.current || !mapRef.current) return
    if (latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude])
      mapRef.current.setView([latitude, longitude], 14)
    }
  }, [latitude, longitude, isMapReady])

  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) return
    setIsSearching(true)
    setShowResults(false)

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchValue)}&format=json&limit=5&countrycodes=de,at,ch`,
        { headers: { 'Accept-Language': 'de' } }
      )
      const data: NominatimResult[] = await res.json()
      setSearchResults(data)
      setShowResults(true)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchValue])

  const handleSelectResult = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      if (markerRef.current && mapRef.current) {
        markerRef.current.setLatLng([lat, lng])
        mapRef.current.setView([lat, lng], 14)
      }

      onChange(lat, lng, result.display_name)
      setSearchValue(result.display_name)
      setShowResults(false)
      tryDetectFacility(lat, lng)
    },
    [onChange, tryDetectFacility]
  )

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-textTertiary)]"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Adresse suchen..."
              className="
                w-full pl-9 pr-4 py-2.5 text-sm
                bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--radius-lg)]
                text-[var(--theme-text)] placeholder:text-[var(--theme-textTertiary)]
                outline-none focus:border-[var(--accent-primary)]
                transition-colors duration-[var(--transition-fast)]
              "
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2.5 text-sm font-medium rounded-[var(--radius-lg)] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primaryHover)] disabled:opacity-50 transition-colors duration-[var(--transition-fast)]"
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Suchen'}
          </button>
        </div>

        {/* Search results dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-[1000] overflow-hidden">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(result)}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-[var(--theme-surfaceHover)] transition-colors duration-[var(--transition-fast)] border-b border-[var(--theme-border)] last:border-0"
              >
                <MapPin size={14} className="flex-shrink-0 mt-0.5 text-[var(--accent-primary)]" />
                <span className="text-sm text-[var(--theme-text)] line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-[var(--radius-xl)] border border-[var(--theme-border)] overflow-hidden"
        style={{ minHeight: 256 }}
      />

      {/* Facility detection info */}
      {detecting && (
        <div className="flex items-center gap-2 text-xs text-[var(--theme-textSecondary)]">
          <Loader2 size={12} className="animate-spin" />
          <span>Sportanlage wird erkannt...</span>
        </div>
      )}
      {!detecting && detectedInfo && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
          <Sparkles size={14} className="text-[var(--accent-primary)] shrink-0" />
          <span className="text-xs text-[var(--theme-text)]">
            Erkannt: <strong>{detectedInfo.type}</strong>
            {detectedInfo.name && <span className="text-[var(--theme-textSecondary)]"> ({detectedInfo.name})</span>}
          </span>
        </div>
      )}

      {/* Coordinates display */}
      {latitude && longitude && (
        <p className="text-xs text-[var(--theme-textTertiary)]">
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      )}
    </div>
  )
}
