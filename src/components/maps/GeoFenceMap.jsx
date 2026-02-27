"use client"
import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"

// Dynamic import for leaflet (SSR-incompatible)
export default function GeoFenceMap({ 
  center, 
  radius = 500, 
  userLocation = null, 
  onLocationSelect = null,
  readonly = false,
  height = "400px" 
}) {
  const [MapComponents, setMapComponents] = useState(null)

  useEffect(() => {
    // Dynamically import leaflet components
    import("react-leaflet").then((leaflet) => {
      import("leaflet").then((L) => {
        // Fix default marker icons
        delete L.default.Icon.Default.prototype._getIconUrl
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })
        setMapComponents({ ...leaflet, L: L.default })
      })
    })
  }, [])

  if (!MapComponents) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border bg-muted"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents } = MapComponents

  const defaultCenter = center || { lat: 28.6139, lng: 77.2090 } // Delhi default

  function LocationSelector() {
    useMapEvents({
      click(e) {
        if (!readonly && onLocationSelect) {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
        }
      },
    })
    return null
  }

  return (
    <div style={{ height }} className="relative">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Geo-fence circle */}
        {center && (
          <>
            <Circle
              center={[center.lat, center.lng]}
              radius={radius}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 2,
                dashArray: "6 4",
              }}
            />
            <Marker position={[center.lat, center.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>Office Location</strong>
                  <br />
                  Radius: {radius}m
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={new MapComponents.L.DivIcon({
              html: `<div style="
                width: 16px; height: 16px; border-radius: 50%;
                background: #ef4444; border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>`,
              className: "",
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <span className="text-sm font-medium">Your Location</span>
            </Popup>
          </Marker>
        )}

        {!readonly && <LocationSelector />}
      </MapContainer>

      {!readonly && (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-card/90 backdrop-blur-sm border px-3 py-1.5 text-xs shadow">
          📍 Click on map to set office location
        </div>
      )}
    </div>
  )
}
