"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface DesignMapProps {
  center?: [number, number]
  zoom?: number
  onMapReady?: (map: mapboxgl.Map) => void
}

export function DesignMap({
  center = [-80.9270, 29.0258], // New Smyrna Beach default
  zoom = 18,
  onMapReady,
}: DesignMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center,
      zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    map.current.on("load", () => {
      if (onMapReady && map.current) {
        onMapReady(map.current)
      }
    })

    return () => {
      map.current?.remove()
    }
  }, [center, zoom, onMapReady])

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
      }}
    />
  )
}
