"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Map, MapMouseEvent } from "mapbox-gl"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import * as turf from "@turf/turf"
import { useToolStore, type ToolType } from "@/stores/tool-store"
import { useDesignStore, type DesignFeature, type ElementType, ELEMENT_PRICES } from "@/stores/design-store"

// Tools that use click-to-place instead of draw mode
const clickToPlaceTools: ToolType[] = ["transition-box", "stormwater-box", "downspout"]

// Custom styles for different element types
const drawStyles = [
  // HydroBlox runs - blue solid line
  {
    id: "gl-draw-line-hydroblox",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    paint: {
      "line-color": "#2563eb",
      "line-width": 4,
    },
  },
  // Existing features - dashed lines
  {
    id: "gl-draw-line-existing",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
    paint: {
      "line-color": "#6b7280",
      "line-width": 3,
      "line-dasharray": [3, 2],
    },
  },
  // Points for boxes
  {
    id: "gl-draw-point",
    type: "circle",
    filter: ["==", "$type", "Point"],
    paint: {
      "circle-radius": 8,
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
      "fill-opacity": 0.2,
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
// Click-to-place tools use simple_select and handle clicks separately
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

  // Set up custom layers for rendering features from design store
  useEffect(() => {
    if (!map) return

    // Add source for point features (boxes, downspouts)
    if (!map.getSource("design-points")) {
      map.addSource("design-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      })

      // Layer for transition boxes (squares)
      map.addLayer({
        id: "transition-boxes",
        type: "circle",
        source: "design-points",
        filter: ["==", ["get", "elementType"], "transition-box"],
        paint: {
          "circle-radius": 12,
          "circle-color": "#2563eb",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      })

      // Layer for stormwater boxes (larger circles)
      map.addLayer({
        id: "stormwater-boxes",
        type: "circle",
        source: "design-points",
        filter: ["==", ["get", "elementType"], "stormwater-box"],
        paint: {
          "circle-radius": 18,
          "circle-color": "#2563eb",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      })

      // Layer for downspouts (gray circles)
      map.addLayer({
        id: "downspouts",
        type: "circle",
        source: "design-points",
        filter: ["==", ["get", "elementType"], "downspout"],
        paint: {
          "circle-radius": 10,
          "circle-color": [
            "case",
            ["==", ["get", "status"], "failed"],
            "#ef4444",
            "#6b7280",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })
    }

    // Add source for line features (existing drainage)
    if (!map.getSource("design-lines")) {
      map.addSource("design-lines", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      })

      // Layer for existing swales (dashed gray/red line)
      map.addLayer({
        id: "existing-swales",
        type: "line",
        source: "design-lines",
        filter: ["==", ["get", "elementType"], "existing-swale"],
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "status"], "failed"],
            "#ef4444",
            "#6b7280",
          ],
          "line-width": 3,
          "line-dasharray": [4, 4],
        },
      })

      // Layer for existing french drains (dotted gray/red line)
      map.addLayer({
        id: "existing-french-drains",
        type: "line",
        source: "design-lines",
        filter: ["==", ["get", "elementType"], "existing-french-drain"],
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "status"], "failed"],
            "#ef4444",
            "#6b7280",
          ],
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      })

      // Layer for existing pipes (solid gray/red line)
      map.addLayer({
        id: "existing-pipes",
        type: "line",
        source: "design-lines",
        filter: ["==", ["get", "elementType"], "existing-pipe"],
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "status"], "failed"],
            "#ef4444",
            "#6b7280",
          ],
          "line-width": 3,
        },
      })
    }

    // Subscribe to design store changes
    const unsubscribe = useDesignStore.subscribe((state) => {
      // Update point features (include id in properties for click detection)
      const pointSource = map.getSource("design-points")
      if (pointSource && "setData" in pointSource) {
        const pointFeatures = state.features
          .filter((f) => f.geometry.type === "Point")
          .map((f) => ({
            ...f,
            properties: { ...f.properties, id: f.id },
          }))
        pointSource.setData({
          type: "FeatureCollection",
          features: pointFeatures,
        })
      }

      // Update line features (only existing drainage types, include id in properties)
      const lineSource = map.getSource("design-lines")
      if (lineSource && "setData" in lineSource) {
        const existingTypes = ["existing-swale", "existing-french-drain", "existing-pipe"]
        const lineFeatures = state.features
          .filter(
            (f) =>
              f.geometry.type === "LineString" &&
              existingTypes.includes(f.properties.elementType)
          )
          .map((f) => ({
            ...f,
            properties: { ...f.properties, id: f.id },
          }))
        lineSource.setData({
          type: "FeatureCollection",
          features: lineFeatures,
        })
      }
    })

    return () => {
      unsubscribe()
      // Clean up layers and sources
      if (map.getLayer("transition-boxes")) map.removeLayer("transition-boxes")
      if (map.getLayer("stormwater-boxes")) map.removeLayer("stormwater-boxes")
      if (map.getLayer("downspouts")) map.removeLayer("downspouts")
      if (map.getLayer("existing-swales")) map.removeLayer("existing-swales")
      if (map.getLayer("existing-french-drains")) map.removeLayer("existing-french-drains")
      if (map.getLayer("existing-pipes")) map.removeLayer("existing-pipes")
      if (map.getSource("design-points")) map.removeSource("design-points")
      if (map.getSource("design-lines")) map.removeSource("design-lines")
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

      // Add features to design store (not to draw for custom-rendered types)
      const existingTypes = [
        "existing-swale",
        "existing-french-drain",
        "existing-pipe",
        "downspout",
        "transition-box",
        "stormwater-box",
      ]

      designData.features.forEach((feature) => {
        // Add to design store
        addFeature(feature)

        // Add line features to Mapbox Draw (except existing types which are custom-rendered)
        if (
          feature.geometry.type === "LineString" &&
          !existingTypes.includes(feature.properties.elementType)
        ) {
          drawRef.current?.add(feature)
        }

        // Add polygon features to Mapbox Draw
        if (feature.geometry.type === "Polygon") {
          drawRef.current?.add(feature)
        }
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
