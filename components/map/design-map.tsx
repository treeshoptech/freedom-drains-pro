"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import { css } from "styled-system/css"
import { Lock, Unlock } from "lucide-react"
import { useDraw } from "@/hooks/use-draw"
import { useMapStore } from "@/stores/map-store"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

// Default center: New Smyrna Beach, FL
const DEFAULT_CENTER: [number, number] = [-80.9270, 29.0258]
const DEFAULT_ZOOM = 18

interface DesignMapProps {
  center?: [number, number]
  zoom?: number
  enableDrawing?: boolean
  onMapReady?: (map: mapboxgl.Map) => void
}

function isValidCoordinate(coord: number | undefined | null): coord is number {
  return typeof coord === "number" && !isNaN(coord) && isFinite(coord)
}

function validateCenter(center: [number, number] | undefined): [number, number] {
  if (!center) return DEFAULT_CENTER

  const [lng, lat] = center

  // Validate longitude (-180 to 180) and latitude (-90 to 90)
  if (
    isValidCoordinate(lng) &&
    isValidCoordinate(lat) &&
    lng >= -180 && lng <= 180 &&
    lat >= -90 && lat <= 90
  ) {
    return [lng, lat]
  }

  console.warn("Invalid map center coordinates, using default:", center)
  return DEFAULT_CENTER
}

export function DesignMap({
  center,
  zoom = DEFAULT_ZOOM,
  enableDrawing = true,
  onMapReady,
}: DesignMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const setGlobalMap = useMapStore((state) => state.setMap)

  // Validate center coordinates
  const validCenter = validateCenter(center)
  const validZoom = isValidCoordinate(zoom) ? zoom : DEFAULT_ZOOM

  // Initialize drawing tools
  useDraw(enableDrawing ? mapInstance : null)

  // Handle map lock/unlock
  const toggleLock = useCallback(() => {
    if (!mapRef.current) return

    const newLockState = !isLocked
    setIsLocked(newLockState)

    if (newLockState) {
      // Disable all interactions except drawing
      mapRef.current.dragPan.disable()
      mapRef.current.scrollZoom.disable()
      mapRef.current.boxZoom.disable()
      mapRef.current.dragRotate.disable()
      mapRef.current.keyboard.disable()
      mapRef.current.doubleClickZoom.disable()
      mapRef.current.touchZoomRotate.disable()
    } else {
      // Re-enable all interactions
      mapRef.current.dragPan.enable()
      mapRef.current.scrollZoom.enable()
      mapRef.current.boxZoom.enable()
      mapRef.current.dragRotate.enable()
      mapRef.current.keyboard.enable()
      mapRef.current.doubleClickZoom.enable()
      mapRef.current.touchZoomRotate.enable()
    }
  }, [isLocked])

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: validCenter,
      zoom: validZoom,
      preserveDrawingBuffer: true, // Required for screenshots
    })

    mapRef.current = newMap

    // Add navigation control
    newMap.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Add scale control
    newMap.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 100, unit: "imperial" }),
      "bottom-left"
    )

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Update map center when props change (for new projects)
  useEffect(() => {
    if (!mapRef.current) return

    const currentCenter = mapRef.current.getCenter()
    if (
      Math.abs(currentCenter.lng - validCenter[0]) > 0.0001 ||
      Math.abs(currentCenter.lat - validCenter[1]) > 0.0001
    ) {
      mapRef.current.flyTo({
        center: validCenter,
        zoom: validZoom,
        duration: 1000,
      })
    }
  }, [validCenter, validZoom])

  return (
    <div className={css({ position: "relative", width: "100%", height: "100%" })}>
      <div
        ref={mapContainer}
        className={css({
          width: "100%",
          height: "100%",
          minHeight: "400px",
        })}
      />

      {/* Lock/Unlock Button */}
      <button
        onClick={toggleLock}
        title={isLocked ? "Unlock map panning" : "Lock map position"}
        className={css({
          position: "absolute",
          top: "120px",
          right: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "30px",
          height: "30px",
          bg: "white",
          border: "none",
          borderRadius: "4px",
          shadow: "md",
          cursor: "pointer",
          color: isLocked ? "blue.600" : "gray.600",
          _hover: { bg: "gray.50" },
        })}
      >
        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>

      {/* Lock indicator */}
      {isLocked && (
        <div
          className={css({
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "2",
            px: "3",
            py: "1.5",
            bg: "blue.600",
            color: "white",
            borderRadius: "full",
            fontSize: "xs",
            fontWeight: "medium",
            shadow: "md",
          })}
        >
          <Lock size={12} />
          Map Locked
        </div>
      )}
    </div>
  )
}
