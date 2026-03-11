/**
 * Detects nearby sports facilities via OpenStreetMap Overpass API.
 * Maps OSM tags to our facility type names.
 */

const OVERPASS_API = 'https://overpass-api.de/api/interpreter'
const SEARCH_RADIUS = 100 // meters

interface OverpassElement {
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

export interface DetectedFacility {
  type: string // Matches facility_types.name
  osmName?: string // Name from OSM if available
}

// Maps OSM sport/leisure tags to our facility type names
const SPORT_TAG_MAP: Record<string, string> = {
  soccer: 'Fussballplatz',
  football: 'Fussballplatz',
  tennis: 'Tennisplatz',
  athletics: 'Leichtathletik',
  running: 'Leichtathletik',
}

const LEISURE_TAG_MAP: Record<string, string> = {
  sports_hall: 'Sporthalle',
  sports_centre: 'Sporthalle',
  track: 'Leichtathletik',
  pitch: 'Mehrzweckplatz',
}

const BUILDING_TAG_MAP: Record<string, string> = {
  sports_hall: 'Sporthalle',
}

function classifyElement(tags: Record<string, string>): string | null {
  // Most specific first: sport tag
  if (tags.sport) {
    const mapped = SPORT_TAG_MAP[tags.sport]
    if (mapped) return mapped
  }

  // Building tag
  if (tags.building) {
    const mapped = BUILDING_TAG_MAP[tags.building]
    if (mapped) return mapped
  }

  // Leisure tag
  if (tags.leisure) {
    const mapped = LEISURE_TAG_MAP[tags.leisure]
    if (mapped) return mapped
  }

  // Generic sports facility
  if (tags.leisure === 'pitch' || tags.leisure === 'stadium') {
    return 'Mehrzweckplatz'
  }

  // Parking
  if (tags.amenity === 'parking') {
    return 'Parkplatz/Aussengelaende'
  }

  return null
}

export async function detectFacilityType(
  lat: number,
  lng: number
): Promise<DetectedFacility | null> {
  const query = `
    [out:json][timeout:5];
    (
      way["leisure"~"pitch|sports_hall|sports_centre|track|stadium"](around:${SEARCH_RADIUS},${lat},${lng});
      way["building"="sports_hall"](around:${SEARCH_RADIUS},${lat},${lng});
      relation["leisure"~"pitch|sports_hall|sports_centre|track|stadium"](around:${SEARCH_RADIUS},${lat},${lng});
      node["leisure"~"pitch|sports_hall|sports_centre|track"](around:${SEARCH_RADIUS},${lat},${lng});
      way["amenity"="parking"](around:${SEARCH_RADIUS},${lat},${lng});
    );
    out tags;
  `

  try {
    const res = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!res.ok) return null

    const data: OverpassResponse = await res.json()

    if (!data.elements || data.elements.length === 0) return null

    // Find the best match (prefer elements with sport tag over generic leisure)
    let bestMatch: DetectedFacility | null = null

    for (const element of data.elements) {
      if (!element.tags) continue

      const type = classifyElement(element.tags)
      if (!type) continue

      const result: DetectedFacility = {
        type,
        osmName: element.tags.name,
      }

      // Prefer specific sport matches over generic
      if (element.tags.sport) {
        return result // Most specific, return immediately
      }

      if (!bestMatch) {
        bestMatch = result
      }
    }

    return bestMatch
  } catch {
    return null
  }
}
