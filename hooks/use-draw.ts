"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Map, MapMouseEvent } from "mapbox-gl"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import * as turf from "@turf/turf"
import { useToolStore, type ToolType } from "@/stores/tool-store"
import { useDesignStore, type DesignFeature, type ElementType, ELEMENT_PRICES } from "@/stores/design-store"

// Color palette for different element types
export const ELEMENT_COLORS: Record<string, string> = {
  // HydroBlox - Blue tones
  "hydroblox-run": "#2563eb",    // Blue
  "parallel-row": "#06b6d4",     // Cyan
  "transition-box": "#3b82f6",   // Light blue
  "stormwater-box": "#0ea5e9",   // Sky blue

  // Water flow markers - Orange/Yellow
  "flow-arrow": "#f97316",       // Orange
  "standing-water": "#eab308",   // Yellow
  "problem-area": "#ef4444",     // Red

  // Existing features - Gray/Green
  "existing-swale": "#22c55e",   // Green (working)
  "existing-french-drain": "#10b981", // Emerald
  "existing-pipe": "#14b8a6",    // Teal
  "downspout": "#6b7280",        // Gray
}

// Labels for legend/display
export const ELEMENT_LABELS: Record<string, string> = {
  "hydroblox-run": "HydroBlox",
  "parallel-row": "Parallel",
  "transition-box": "T-Box",
  "stormwater-box": "Storm",
  "flow-arrow": "Flow",
  "standing-water": "Water",
  "problem-area": "Problem",
  "existing-swale": "Swale",
  "existing-french-drain": "French",
  "existing-pipe": "Pipe",
  "downspout": "DS",
}

// Tools that use click-to-place instead of draw mode
const clickToPlaceTools: ToolType[] = ["transition-box", "stormwater-box", "downspout"]

// Draw styles - used during active drawing (before feature is saved)
const drawStyles = [
  // Active line drawing - dashed to show it's not complete
  {
    id: "gl-draw-line-active",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
    paint: {
      "line-color": "#2563eb",
      "line-width": 4,
      "line-dasharray": [2, 2],
    },
  },
  // Inactive lines (shouldn't show - we use custom layers)
  {
    id: "gl-draw-line-inactive",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "false"]],
    paint: {
      "line-color": "#2563eb",
      "line-width": 4,
    },
  },
  // Points during drawing
  {
    id: "gl-draw-point",
    type: "circle",
    filter: ["==", "$type", "Point"],
    paint: {
      "circle-radius": 6,
      "circle-color": "#2563eb",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  },
  // Polygons fill
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["==", "$type", "Polygon"],
    paint: {
      "fill-color": "#2563eb",
      "fill-opacity": 0.15,
    },
  },
  // Polygon outline
  {
    id: "gl-draw-polygon-stroke",
    type: "line",
    filter: ["==", "$type", "Polygon"],
    paint: {
      "line-color": "#2563eb",
      "line-width": 2,
    },
  },
  // Vertex points
  {
    id: "gl-draw-vertex",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 5,
      "circle-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#2563eb",
    },
  },
  // Midpoints
  {
    id: "gl-draw-midpoint",
    type: "circle",
    filter: ["all", ["==", "meta", "midpoint"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 4,
      "circle-color": "#2563eb",
    },
  },
]

// Map tool types to draw modes and geometry types
const toolConfig: Record<
  ToolType,
  { mode: string; geometryType: "line" | "point" | "polygon" | null; clickToPlace?: boolean }
> = {
  select: { mode: "simple_select", geometryType: null },
  "hydroblox-run": { mode: "draw_line_string", geometryType: "line" },
  "parallel-row": { mode: "draw_line_string", geometryType: "line" },
  "transition-box": { mode: "simple_select", geometryType: "point", clickToPlace: true },
  "stormwater-box": { mode: "simple_select", geometryType: "point", clickToPlace: true },
  "flow-arrow": { mode: "draw_line_string", geometryType: "line" },
  "standing-water": { mode: "draw_polygon", geometryType: "polygon" },
  "problem-area": { mode: "draw_polygon", geometryType: "polygon" },
  "existing-swale": { mode: "draw_line_string", geometryType: "line" },
  "existing-french-drain": { mode: "draw_line_string", geometryType: "line" },
  "existing-pipe": { mode: "draw_line_string", geometryType: "line" },
  downspout: { mode: "simple_select", geometryType: "point", clickToPlace: true },
}

// Existing feature types that support failed status
const existingFeatureTypes: ElementType[] = [
  "existing-swale",
  "existing-french-drain",
  "existing-pipe",
  "downspout",
]

export function useDraw(map: Map | null) {
  const drawRef = useRef<MapboxDraw | null>(null)
  const { activeTool, setActiveTool } = useToolStore()
  const { addFeature, updateFeature, removeFeature, toggleFailedStatus } = useDesignStore()

  // Calculate length in feet for LineString
  const calculateLengthFt = useCallback((feature: GeoJSON.Feature): number => {
    if (feature.geometry.type !== "LineString") return 0
    const lengthMeters = turf.length(feature, { units: "meters" })
    return Math.round(lengthMeters * 3.28084)
  }, [])

  // Calculate area in square feet for Polygon
  const calculateAreaFt = useCallback((feature: GeoJSON.Feature): number => {
    if (feature.geometry.type !== "Polygon") return 0
    const areaMeters = turf.area(feature)
    return Math.round(areaMeters * 10.7639)
  }, [])

  // Initialize MapboxDraw
  useEffect(() => {
    if (!map || drawRef.current) return

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      styles: drawStyles,
    })

    map.addControl(draw)
    drawRef.current = draw

    // Handle feature creation
    const handleCreate = (e: { features: GeoJSON.Feature[] }) => {
      const feature = e.features[0]
      if (!feature) return

      const currentTool = useToolStore.getState().activeTool
      const elementType = currentTool as ElementType

      // Set initial status for existing feature types
      const isExistingType = existingFeatureTypes.includes(elementType)

      const designFeature: DesignFeature = {
        ...feature,
        properties: {
          elementType,
          lengthFt:
            feature.geometry.type === "LineString"
              ? calculateLengthFt(feature)
              : undefined,
          areaFt:
            feature.geometry.type === "Polygon"
              ? calculateAreaFt(feature)
              : undefined,
          status: isExistingType ? "working" : undefined,
        },
      } as DesignFeature

      addFeature(designFeature)

      // Switch back to select after drawing
      setActiveTool("select")
    }

    // Handle feature update
    const handleUpdate = (e: { features: GeoJSON.Feature[] }) => {
      e.features.forEach((feature) => {
        if (!feature.id) return

        const existingFeatures = useDesignStore.getState().features
        const existing = existingFeatures.find((f) => f.id === feature.id)
        if (!existing) return

        const updatedFeature: DesignFeature = {
          ...feature,
          properties: {
            ...existing.properties,
            lengthFt:
              feature.geometry.type === "LineString"
                ? calculateLengthFt(feature)
                : existing.properties.lengthFt,
            areaFt:
              feature.geometry.type === "Polygon"
                ? calculateAreaFt(feature)
                : existing.properties.areaFt,
          },
        } as DesignFeature

        updateFeature(String(feature.id), updatedFeature)
      })
    }

    // Handle feature deletion
    const handleDelete = (e: { features: GeoJSON.Feature[] }) => {
      e.features.forEach((feature) => {
        if (feature.id) {
          removeFeature(String(feature.id))
        }
      })
    }

    map.on("draw.create", handleCreate)
    map.on("draw.update", handleUpdate)
    map.on("draw.delete", handleDelete)

    return () => {
      map.off("draw.create", handleCreate)
      map.off("draw.update", handleUpdate)
      map.off("draw.delete", handleDelete)

      if (drawRef.current) {
        map.removeControl(drawRef.current)
        drawRef.current = null
      }
    }
  }, [map, addFeature, updateFeature, removeFeature, calculateLengthFt, calculateAreaFt, setActiveTool])

  // Switch draw mode based on active tool
  useEffect(() => {
    if (!drawRef.current) return

    const config = toolConfig[activeTool]
    if (config) {
      try {
        drawRef.current.changeMode(config.mode)
      } catch {
        // Mode change can fail if already in that mode
      }
    }
  }, [activeTool])

  // Handle click-to-place for boxes and downspouts
  useEffect(() => {
    if (!map) return

    const handleMapClick = (e: MapMouseEvent) => {
      const currentTool = useToolStore.getState().activeTool

      // Only handle click-to-place tools
      if (!clickToPlaceTools.includes(currentTool)) return

      const elementType = currentTool as ElementType
      const price = ELEMENT_PRICES[elementType] || 0
      const id = `${elementType}-${Date.now()}`

      // Set initial status for existing feature types (downspout)
      const isExistingType = existingFeatureTypes.includes(elementType)

      const designFeature: DesignFeature = {
        type: "Feature",
        id,
        geometry: {
          type: "Point",
          coordinates: [e.lngLat.lng, e.lngLat.lat],
        },
        properties: {
          elementType,
          price: price || undefined,
          status: isExistingType ? "working" : undefined,
        },
      }

      addFeature(designFeature)

      // Switch back to select after placing
      setActiveTool("select")
    }

    map.on("click", handleMapClick)

    return () => {
      map.off("click", handleMapClick)
    }
  }, [map, addFeature, setActiveTool])

  // Set up custom layers for rendering ALL features from design store
  useEffect(() => {
    if (!map) return

    // Create custom icons for boxes - returns ImageData compatible with Mapbox
    const createBoxIcon = (color: string, size: number, isTransition: boolean): { width: number; height: number; data: Uint8Array } | null => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      const scale = 4 // Higher resolution for crisp rendering
      canvas.width = size * scale
      canvas.height = size * scale
      ctx.scale(scale, scale)

      const padding = 2
      const boxSize = size - padding * 2
      const radius = isTransition ? 4 : 6

      // Draw shadow
      ctx.shadowColor = "rgba(0,0,0,0.3)"
      ctx.shadowBlur = 4
      ctx.shadowOffsetY = 2

      // Draw rounded rectangle background
      ctx.beginPath()
      ctx.roundRect(padding, padding, boxSize, boxSize, radius)
      ctx.fillStyle = color
      ctx.fill()

      // Remove shadow for stroke
      ctx.shadowColor = "transparent"

      // Draw white border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      if (isTransition) {
        // Draw "T" symbol for transition box
        ctx.fillStyle = "#ffffff"
        ctx.font = `bold ${boxSize * 0.5}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("T", size / 2, size / 2 + 1)
      } else {
        // Draw grid pattern for stormwater box (catch basin style)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1.5
        const gridPadding = padding + 4
        const gridSize = boxSize - 8

        // Horizontal lines
        for (let i = 0; i <= 2; i++) {
          const y = gridPadding + (gridSize / 2) * i
          ctx.beginPath()
          ctx.moveTo(gridPadding, y)
          ctx.lineTo(gridPadding + gridSize, y)
          ctx.stroke()
        }

        // Vertical lines
        for (let i = 0; i <= 2; i++) {
          const x = gridPadding + (gridSize / 2) * i
          ctx.beginPath()
          ctx.moveTo(x, gridPadding)
          ctx.lineTo(x, gridPadding + gridSize)
          ctx.stroke()
        }
      }

      // Convert to Mapbox-compatible format
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      return {
        width: canvas.width,
        height: canvas.height,
        data: new Uint8Array(imageData.data.buffer),
      }
    }

    // Create downspout icon (circular with arrow)
    const createDownspoutIcon = (color: string, size: number): { width: number; height: number; data: Uint8Array } | null => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      const scale = 4
      canvas.width = size * scale
      canvas.height = size * scale
      ctx.scale(scale, scale)

      const center = size / 2
      const radius = size / 2 - 3

      // Draw shadow
      ctx.shadowColor = "rgba(0,0,0,0.3)"
      ctx.shadowBlur = 3
      ctx.shadowOffsetY = 1

      // Draw circle
      ctx.beginPath()
      ctx.arc(center, center, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      ctx.shadowColor = "transparent"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw down arrow
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      const arrowSize = radius * 0.6
      ctx.moveTo(center, center + arrowSize * 0.5)
      ctx.lineTo(center - arrowSize * 0.5, center - arrowSize * 0.3)
      ctx.lineTo(center - arrowSize * 0.2, center - arrowSize * 0.3)
      ctx.lineTo(center - arrowSize * 0.2, center - arrowSize * 0.6)
      ctx.lineTo(center + arrowSize * 0.2, center - arrowSize * 0.6)
      ctx.lineTo(center + arrowSize * 0.2, center - arrowSize * 0.3)
      ctx.lineTo(center + arrowSize * 0.5, center - arrowSize * 0.3)
      ctx.closePath()
      ctx.fill()

      // Convert to Mapbox-compatible format
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      return {
        width: canvas.width,
        height: canvas.height,
        data: new Uint8Array(imageData.data.buffer),
      }
    }

    // Add images to map
    const transitionIcon = createBoxIcon(ELEMENT_COLORS["transition-box"], 32, true)
    const stormwaterIcon = createBoxIcon(ELEMENT_COLORS["stormwater-box"], 40, false)
    const downspoutIcon = createDownspoutIcon(ELEMENT_COLORS["downspout"], 28)
    const downspoutFailedIcon = createDownspoutIcon("#ef4444", 28)

    if (transitionIcon && !map.hasImage("transition-box-icon")) {
      map.addImage("transition-box-icon", transitionIcon, { pixelRatio: 4 })
    }
    if (stormwaterIcon && !map.hasImage("stormwater-box-icon")) {
      map.addImage("stormwater-box-icon", stormwaterIcon, { pixelRatio: 4 })
    }
    if (downspoutIcon && !map.hasImage("downspout-icon")) {
      map.addImage("downspout-icon", downspoutIcon, { pixelRatio: 4 })
    }
    if (downspoutFailedIcon && !map.hasImage("downspout-failed-icon")) {
      map.addImage("downspout-failed-icon", downspoutFailedIcon, { pixelRatio: 4 })
    }

    // Add source for ALL design features
    if (!map.getSource("design-features")) {
      map.addSource("design-features", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      })

      // ===== LINE LAYERS =====

      // HydroBlox Run - thick blue solid line
      map.addLayer({
        id: "hydroblox-runs",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "hydroblox-run"],
        paint: {
          "line-color": ELEMENT_COLORS["hydroblox-run"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 16, 4, 20, 8],
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      })

      // Parallel Row - thick cyan dashed line
      map.addLayer({
        id: "parallel-rows",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "parallel-row"],
        paint: {
          "line-color": ELEMENT_COLORS["parallel-row"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 16, 4, 20, 8],
          "line-dasharray": [4, 2],
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      })

      // Flow Arrow - orange with arrow pattern
      map.addLayer({
        id: "flow-arrows",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "flow-arrow"],
        paint: {
          "line-color": ELEMENT_COLORS["flow-arrow"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 16, 3, 20, 6],
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      })

      // Existing Swale - green dashed
      map.addLayer({
        id: "existing-swales",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "existing-swale"],
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "status"], "failed"],
            "#ef4444",
            ELEMENT_COLORS["existing-swale"],
          ],
          "line-width": ["interpolate", ["linear"], ["zoom"], 16, 3, 20, 6],
          "line-dasharray": [6, 3],
        },
      })

      // Existing French Drain - emerald dotted
      map.addLayer({
        id: "existing-french-drains",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "existing-french-drain"],
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "status"], "failed"],
            "#ef4444",
            ELEMENT_COLORS["existing-french-drain"],
          ],
          "line-width": ["interpolate", ["linear"], ["zoom"], 16, 3, 20, 6],
          "line-dasharray": [2, 2],
        },
      })

      // Existing Pipe - teal solid
      map.addLayer({
        id: "existing-pipes",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "existing-pipe"],
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "status"], "failed"],
            "#ef4444",
            ELEMENT_COLORS["existing-pipe"],
          ],
          "line-width": ["interpolate", ["linear"], ["zoom"], 16, 3, 20, 6],
        },
      })

      // ===== POLYGON LAYERS =====

      // Standing Water - yellow fill
      map.addLayer({
        id: "standing-water-fill",
        type: "fill",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "standing-water"],
        paint: {
          "fill-color": ELEMENT_COLORS["standing-water"],
          "fill-opacity": 0.3,
        },
      })
      map.addLayer({
        id: "standing-water-outline",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "standing-water"],
        paint: {
          "line-color": ELEMENT_COLORS["standing-water"],
          "line-width": 2,
        },
      })

      // Problem Area - red fill
      map.addLayer({
        id: "problem-area-fill",
        type: "fill",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "problem-area"],
        paint: {
          "fill-color": ELEMENT_COLORS["problem-area"],
          "fill-opacity": 0.25,
        },
      })
      map.addLayer({
        id: "problem-area-outline",
        type: "line",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "problem-area"],
        paint: {
          "line-color": ELEMENT_COLORS["problem-area"],
          "line-width": 2,
          "line-dasharray": [4, 2],
        },
      })

      // ===== POINT LAYERS (using HD icons) =====

      // Transition Box - rounded square with "T" symbol
      map.addLayer({
        id: "transition-boxes",
        type: "symbol",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "transition-box"],
        layout: {
          "icon-image": "transition-box-icon",
          "icon-size": ["interpolate", ["linear"], ["zoom"], 16, 0.7, 20, 1.4],
          "icon-allow-overlap": true,
        },
      })

      // Stormwater Box - larger rounded square with grid pattern
      map.addLayer({
        id: "stormwater-boxes",
        type: "symbol",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "stormwater-box"],
        layout: {
          "icon-image": "stormwater-box-icon",
          "icon-size": ["interpolate", ["linear"], ["zoom"], 16, 0.7, 20, 1.4],
          "icon-allow-overlap": true,
        },
      })

      // Downspout - circle with down arrow
      map.addLayer({
        id: "downspouts",
        type: "symbol",
        source: "design-features",
        filter: ["==", ["get", "elementType"], "downspout"],
        layout: {
          "icon-image": [
            "case",
            ["==", ["get", "status"], "failed"],
            "downspout-failed-icon",
            "downspout-icon",
          ],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 16, 0.7, 20, 1.4],
          "icon-allow-overlap": true,
        },
      })

      // ===== LABEL LAYERS =====
      // Labels appear when zoomed in (zoom >= 18)

      // Line labels
      map.addLayer({
        id: "line-labels",
        type: "symbol",
        source: "design-features",
        filter: ["==", ["geometry-type"], "LineString"],
        minzoom: 18,
        layout: {
          "symbol-placement": "line-center",
          "text-field": [
            "concat",
            ["get", "label"],
            " ",
            ["to-string", ["get", "lengthFt"]],
            "'"
          ],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 18, 11, 20, 14],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": [
            "match",
            ["get", "elementType"],
            "hydroblox-run", ELEMENT_COLORS["hydroblox-run"],
            "parallel-row", ELEMENT_COLORS["parallel-row"],
            "flow-arrow", ELEMENT_COLORS["flow-arrow"],
            "existing-swale", ELEMENT_COLORS["existing-swale"],
            "existing-french-drain", ELEMENT_COLORS["existing-french-drain"],
            "existing-pipe", ELEMENT_COLORS["existing-pipe"],
            "#2563eb"
          ],
          "text-halo-width": 2,
        },
      })

      // Point labels
      map.addLayer({
        id: "point-labels",
        type: "symbol",
        source: "design-features",
        filter: ["==", ["geometry-type"], "Point"],
        minzoom: 17,
        layout: {
          "text-field": ["get", "label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 17, 10, 20, 13],
          "text-offset": [0, 1.8],
          "text-anchor": "top",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": [
            "match",
            ["get", "elementType"],
            "transition-box", ELEMENT_COLORS["transition-box"],
            "stormwater-box", ELEMENT_COLORS["stormwater-box"],
            "downspout", ELEMENT_COLORS["downspout"],
            "#2563eb"
          ],
          "text-halo-width": 2,
        },
      })

      // Polygon labels
      map.addLayer({
        id: "polygon-labels",
        type: "symbol",
        source: "design-features",
        filter: ["==", ["geometry-type"], "Polygon"],
        minzoom: 17,
        layout: {
          "text-field": ["get", "label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 17, 12, 20, 16],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": [
            "match",
            ["get", "elementType"],
            "standing-water", ELEMENT_COLORS["standing-water"],
            "problem-area", ELEMENT_COLORS["problem-area"],
            "#2563eb"
          ],
          "text-halo-width": 2,
        },
      })
    }

    // Subscribe to design store changes
    const unsubscribe = useDesignStore.subscribe((state) => {
      const source = map.getSource("design-features")
      if (source && "setData" in source) {
        // Add label and id to all features for rendering
        const features = state.features.map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            id: f.id,
            label: ELEMENT_LABELS[f.properties.elementType] || f.properties.elementType,
          },
        }))
        source.setData({
          type: "FeatureCollection",
          features,
        })
      }
    })

    return () => {
      unsubscribe()
      // Clean up all layers and sources
      const layersToRemove = [
        "hydroblox-runs", "parallel-rows", "flow-arrows",
        "existing-swales", "existing-french-drains", "existing-pipes",
        "standing-water-fill", "standing-water-outline",
        "problem-area-fill", "problem-area-outline",
        "transition-boxes", "stormwater-boxes", "downspouts",
        "line-labels", "point-labels", "polygon-labels",
      ]
      layersToRemove.forEach((layer) => {
        if (map.getLayer(layer)) map.removeLayer(layer)
      })
      if (map.getSource("design-features")) map.removeSource("design-features")
    }
  }, [map])

  // Handle right-click to toggle failed status on existing features
  useEffect(() => {
    if (!map) return

    const handleContextMenu = (e: MapMouseEvent) => {
      e.preventDefault()

      // Check if clicked on an existing feature layer
      const layers = [
        "existing-swales",
        "existing-french-drains",
        "existing-pipes",
        "downspouts",
      ]

      const features = map.queryRenderedFeatures(e.point, { layers })
      if (features.length > 0) {
        const feature = features[0]
        const id = feature.properties?.id || feature.id
        if (id) {
          toggleFailedStatus(String(id))
        }
      }
    }

    map.on("contextmenu", handleContextMenu)

    return () => {
      map.off("contextmenu", handleContextMenu)
    }
  }, [map, toggleFailedStatus])

  // Delete selected features
  const deleteSelected = useCallback(() => {
    if (!drawRef.current) return

    const selected = drawRef.current.getSelected()
    if (selected.features.length > 0) {
      selected.features.forEach((f) => {
        if (f.id) {
          drawRef.current?.delete(String(f.id))
          removeFeature(String(f.id))
        }
      })
    }
  }, [removeFeature])

  // Get all drawn features
  const getAll = useCallback(() => {
    return drawRef.current?.getAll() || { type: "FeatureCollection", features: [] }
  }, [])

  // Toggle failed status for a specific feature
  const toggleFailed = useCallback(
    (id: string) => {
      toggleFailedStatus(id)
    },
    [toggleFailedStatus]
  )

  // Load design from saved project
  const loadDesign = useCallback(
    (designData: { type: "FeatureCollection"; features: DesignFeature[] }) => {
      if (!drawRef.current || !map) return

      // Clear existing features
      drawRef.current.deleteAll()
      useDesignStore.getState().clearFeatures()

      // Add features to design store (custom layers will render them)
      designData.features.forEach((feature) => {
        addFeature(feature)
      })

      // Fit map bounds to features
      if (designData.features.length > 0) {
        try {
          const bbox = turf.bbox(designData)
          if (bbox.every((v) => isFinite(v))) {
            map.fitBounds(
              [
                [bbox[0], bbox[1]],
                [bbox[2], bbox[3]],
              ],
              { padding: 50, maxZoom: 19 }
            )
          }
        } catch {
          // Ignore bbox errors for invalid geometries
        }
      }
    },
    [map, addFeature]
  )

  // Clear all features
  const clearAll = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll()
    }
    useDesignStore.getState().clearFeatures()
  }, [])

  return {
    draw: drawRef.current,
    deleteSelected,
    getAll,
    toggleFailed,
    loadDesign,
    clearAll,
  }
}
