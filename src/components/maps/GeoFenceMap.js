"use client"
import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

export default function GeoFenceMap({
  center,
  radius = 500,
  userLocation = null,
  onLocationSelect = null,
  readonly = false,
  height = "400px",
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)
  const userMarkerRef = useRef(null)
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)

  const defaultCenter = center || { lat: 28.6139, lng: 77.209 }

  // ─── Map initialize karo ───────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return // already initialized

    let L
    let map

    const init = async () => {
      const leaflet = await import("leaflet")
      await import("leaflet/dist/leaflet.css")
      L = leaflet.default

      // Fix default icons
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      if (!containerRef.current) return

      // Map create karo
      map = L.map(containerRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 15,
        zoomControl: true,
      })

      // Tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Office marker icon
      const officeIcon = L.divIcon({
        html: `<div style="
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          background:#3b82f6;border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          transform:rotate(-45deg);
        "></div>`,
        className: "",
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      })

      // Initial marker + circle
      if (center) {
        markerRef.current = L.marker([center.lat, center.lng], { icon: officeIcon })
          .addTo(map)
          .bindPopup(`<b>📍 Office</b><br/>Radius: ${radius}m`)

        circleRef.current = L.circle([center.lat, center.lng], {
          radius,
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "6 4",
        }).addTo(map)
      }

      // User location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:14px;height:14px;border-radius:50%;
            background:#ef4444;border:3px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          className: "",
          iconAnchor: [7, 7],
        })
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("📍 Your Location")
      }

      // Click handler
      if (!readonly && onLocationSelect) {
        map.on("click", (e) => {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
        })
      }

      mapInstanceRef.current = map
      mapRef.current = L
      setLoading(false)
    }

    init()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // sirf ek baar initialize

  // ─── Center change hone pe marker + circle update karo ────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = mapRef.current
    if (!map || !L || !center) return

    const latlng = [center.lat, center.lng]

    // Office marker update
    const officeIcon = L.divIcon({
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:#3b82f6;border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        transform:rotate(-45deg);
      "></div>`,
      className: "",
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    })

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng)
    } else {
      markerRef.current = L.marker(latlng, { icon: officeIcon })
        .addTo(map)
        .bindPopup(`<b>📍 Office</b><br/>Radius: ${radius}m`)
    }

    // Circle update
    if (circleRef.current) {
      circleRef.current.setLatLng(latlng)
      circleRef.current.setRadius(radius)
    } else {
      circleRef.current = L.circle(latlng, {
        radius,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      }).addTo(map)
    }

    // Map ka center bhi update karo smoothly
    map.setView(latlng, map.getZoom(), { animate: true })

  }, [center?.lat, center?.lng, radius])

  // ─── User location update ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = mapRef.current
    if (!map || !L || !userLocation) return

    const userIcon = L.divIcon({
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:#ef4444;border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      className: "",
      iconAnchor: [7, 7],
    })

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("📍 Your Location")
    }
  }, [userLocation?.lat, userLocation?.lng])

  return (
    <div style={{ height }} className="relative rounded-xl overflow-hidden border">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 rounded-xl">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 animate-pulse" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map container — ye div leaflet use karta hai */}
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Click hint */}
      {!readonly && !loading && (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border px-3 py-1.5 text-xs shadow-md pointer-events-none">
          📍 Click on map to set location
        </div>
      )}

      {readonly && !loading && (
        <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border px-3 py-1.5 text-xs shadow-md pointer-events-none">
          👁️ Preview
        </div>
      )}
    </div>
  )
}