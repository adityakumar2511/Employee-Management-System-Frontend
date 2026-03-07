"use client"
import { useState } from "react"
import { MapPin, Navigation, Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function LocationPicker({
  center,
  radius = 500,
  onLocationSelect,
  readonly = false,
  height = "400px",
}) {
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState(false)
  const [gpsError, setGpsError] = useState("")

  const detectLocation = () => {
    setDetecting(true)
    setGpsError("")
    setDetected(false)

    if (!navigator.geolocation) {
      setGpsError("GPS not supported in this browser")
      setDetecting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationSelect?.({
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        })
        setDetecting(false)
        setDetected(true)
        setTimeout(() => setDetected(false), 3000)
      },
      () => {
        setGpsError("Location access denied. Please enter coordinates manually.")
        setDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const googleMapsUrl = center
    ? `https://www.google.com/maps?q=${center.lat},${center.lng}&z=16`
    : "https://www.google.com/maps"

  // ─── Readonly / Preview mode ──────────────────────────────────────────────
  if (readonly) {
    return (
      <div
        style={{ height }}
        className="rounded-xl border bg-muted/30 flex flex-col items-center justify-center gap-4 p-6"
      >
        {center ? (
          <>
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-base">Office Location Set</p>
              <p className="text-muted-foreground text-sm mt-1 font-mono">
                {Number(center.lat).toFixed(6)}, {Number(center.lng).toFixed(6)}
              </p>
              <p className="text-blue-600 text-sm mt-1">Radius: {radius}m</p>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on Google Maps
            </a>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground opacity-30" />
            </div>
            <p className="text-muted-foreground text-sm">No location set</p>
          </>
        )}
      </div>
    )
  }

  // ─── Edit mode ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* GPS Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={detectLocation}
        disabled={detecting}
      >
        {detecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Detecting your location...
          </>
        ) : detected ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            Location detected successfully!
          </>
        ) : (
          <>
            <Navigation className="h-4 w-4" />
            Use My Current Location (GPS)
          </>
        )}
      </Button>

      {gpsError && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          ⚠️ {gpsError}
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t" />
        <span className="text-xs text-muted-foreground">or enter manually</span>
        <div className="flex-1 border-t" />
      </div>

      {/* Manual lat/lng inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Latitude</Label>
          <Input
            placeholder="28.6139"
            value={center?.lat || ""}
            onChange={(e) => {
              const lat = parseFloat(e.target.value)
              if (!isNaN(lat)) {
                onLocationSelect?.({ lat, lng: center?.lng || 0 })
              } else if (e.target.value === "" || e.target.value === "-") {
                onLocationSelect?.({ lat: 0, lng: center?.lng || 0 })
              }
            }}
            className="mt-1.5 font-mono"
          />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input
            placeholder="77.2090"
            value={center?.lng || ""}
            onChange={(e) => {
              const lng = parseFloat(e.target.value)
              if (!isNaN(lng)) {
                onLocationSelect?.({ lat: center?.lat || 0, lng })
              } else if (e.target.value === "" || e.target.value === "-") {
                onLocationSelect?.({ lat: center?.lat || 0, lng: 0 })
              }
            }}
            className="mt-1.5 font-mono"
          />
        </div>
      </div>

      {/* How to get coordinates from Google Maps */}
      <div className="rounded-xl border border-dashed p-4 space-y-2 bg-muted/20">
        <p className="font-medium text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          Google Maps se coordinates kaise lein?
        </p>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              maps.google.com
            </a>{" "}
            kholo
          </li>
          <li>Apna office location search karo</li>
          <li>Location pe right-click karo</li>
          <li>
            Sabse upar coordinates dikhenge (jaise{" "}
            <span className="font-mono">28.6139, 77.2090</span>) — click karo
            copy ho jaayenge
          </li>
          <li>Upar ke inputs mein paste karo</li>
        </ol>
      </div>

      {/* Location set confirmation */}
      {center?.lat && center?.lng && (
        <div className="rounded-xl border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                ✓ Location Set
              </p>
              <p className="text-xs text-blue-600 font-mono">
                {Number(center.lat).toFixed(4)}, {Number(center.lng).toFixed(4)}
              </p>
            </div>
          </div>
         <a 
            href={`https://www.google.com/maps?q=${center.lat},${center.lng}&z=16`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline flex-shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
            Verify
          </a>
        </div>
      )}
    </div>
  )
}