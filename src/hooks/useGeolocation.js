import { useState, useEffect, useCallback } from "react"

export function useGeolocation(options = {}) {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
        setLoading(false)
      },
      (err) => {
        let message = "Unable to retrieve your location"
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access."
            break
          case err.POSITION_UNAVAILABLE:
            message = "Location information unavailable"
            break
          case err.TIMEOUT:
            message = "Location request timed out"
            break
        }
        setError(message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
        ...options,
      }
    )
  }, [])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  return { location, error, loading, refresh: getLocation }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in metres
}

export function isWithinRadius(userLat, userLon, officeLat, officeLon, radius = 500) {
  const distance = calculateDistance(userLat, userLon, officeLat, officeLon)
  return { within: distance <= radius, distance: Math.round(distance) }
}
