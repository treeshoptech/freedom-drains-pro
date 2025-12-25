"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import { useDraw } from "@/hooks/use-draw"
import { useMapStore } from "@/stores/map-store"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface DesignMapProps {
  center?: [number, number]
  zoom?: number
  enableDrawing?: boolean
  onMapReady?: (map: mapboxgl.Map) => void
}

export function DesignMap({
  center = [-80.9270, 29.0258], // New Smyrna Beach default
  zoom = 18,
  enableDrawing = true,
  onMapReady,
}: DesignMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
  const setGlobalMap = useMapStore((state) => state.setMap)

  // Initialize drawing tools
  useDraw(enableDrawing ? mapInstance : null)

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center,
      zoom,
      preserveDrawingBuffer: true, // Required for screenshots
    })

    mapRef.current = newMap

    newMap.addControl(new mapboxgl.NavigationControl(), "top-right")

    newMap.on("load", () => {
      setMapInstance(newMap)
      setGlobalMap(newMap)
      if (onMapReady) {
        onMapReady(newMap)
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      setMapInstance(null)
      setGlobalMap(null)
    }
  }, [center, zoom, onMapReady, setGlobalMap])

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
