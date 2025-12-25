"use client"

import { useCallback } from "react"
import type mapboxgl from "mapbox-gl"
import { useProjectStore } from "@/stores/project-store"
import { useDesignStore } from "@/stores/design-store"
import { calculateTotal } from "@/lib/pricing/calculator"

interface ScreenshotOptions {
  includeOverlay?: boolean
  filename?: string
}

export function useScreenshot(map: mapboxgl.Map | null) {
  const projectName = useProjectStore((state) => state.projectName)
  const projectAddress = useProjectStore((state) => state.projectAddress)
  const features = useDesignStore((state) => state.features)

  // Capture map canvas as blob
  const capture = useCallback(
    async (options: ScreenshotOptions = {}): Promise<Blob | null> => {
      if (!map) return null

      const { includeOverlay = false } = options

      // Get map canvas
      const mapCanvas = map.getCanvas()

      if (includeOverlay) {
        // Create a new canvas to composite map + overlay
        const canvas = document.createElement("canvas")
        canvas.width = mapCanvas.width
        canvas.height = mapCanvas.height
        const ctx = canvas.getContext("2d")!

        // Draw map
        ctx.drawImage(mapCanvas, 0, 0)

        // Draw overlay
        drawCostOverlay(ctx, canvas.width, canvas.height)

        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob)
          }, "image/png")
        })
      }

      // Simple capture without overlay
      return new Promise((resolve) => {
        mapCanvas.toBlob((blob) => {
          resolve(blob)
        }, "image/png")
      })
    },
    [map]
  )

  // Draw cost overlay on canvas
  const drawCostOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const pricing = calculateTotal(features)
      const date = new Date().toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })

      // Scale for high DPI displays
      const scale = window.devicePixelRatio || 1
      const padding = 20 * scale
      const boxWidth = 280 * scale
      const boxHeight = 100 * scale
      const fontSize = 14 * scale
      const largeFontSize = 24 * scale

      // Position in bottom-right corner
      const x = width - boxWidth - padding
      const y = height - boxHeight - padding

      // Semi-transparent background
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
      ctx.shadowBlur = 10 * scale
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2 * scale
      ctx.beginPath()
      ctx.roundRect(x, y, boxWidth, boxHeight, 8 * scale)
      ctx.fill()

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Company name
      ctx.fillStyle = "#1e40af"
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`
      ctx.fillText("Freedom Drains Pro", x + padding, y + padding + fontSize)

      // Address
      ctx.fillStyle = "#6b7280"
      ctx.font = `${fontSize * 0.9}px system-ui, sans-serif`
      const displayAddress =
        projectAddress.length > 35
          ? projectAddress.substring(0, 35) + "..."
          : projectAddress
      ctx.fillText(displayAddress || "No address", x + padding, y + padding + fontSize * 2.2)

      // Date
      ctx.fillText(date, x + padding, y + padding + fontSize * 3.4)

      // Total cost
      ctx.fillStyle = "#059669"
      ctx.font = `bold ${largeFontSize}px system-ui, sans-serif`
      ctx.textAlign = "right"
      ctx.fillText(
        `$${pricing.total.toLocaleString()}`,
        x + boxWidth - padding,
        y + boxHeight - padding
      )
      ctx.textAlign = "left"
    },
    [features, projectAddress]
  )

  // Download as PNG file
  const download = useCallback(
    async (options: ScreenshotOptions = {}) => {
      const { filename = "drainage-design.png", includeOverlay = false } = options
      const blob = await capture({ includeOverlay })
      if (!blob) return false

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return true
    },
    [capture]
  )

  // Copy to clipboard
  const copyToClipboard = useCallback(
    async (options: ScreenshotOptions = {}) => {
      const blob = await capture(options)
      if (!blob) return false

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ])
        return true
      } catch (error) {
        console.error("Failed to copy to clipboard:", error)
        return false
      }
    },
    [capture]
  )

  // Get data URL for preview
  const getDataURL = useCallback(
    async (options: ScreenshotOptions = {}): Promise<string | null> => {
      if (!map) return null

      const { includeOverlay = false } = options
      const mapCanvas = map.getCanvas()

      if (includeOverlay) {
        const canvas = document.createElement("canvas")
        canvas.width = mapCanvas.width
        canvas.height = mapCanvas.height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(mapCanvas, 0, 0)
        drawCostOverlay(ctx, canvas.width, canvas.height)
        return canvas.toDataURL("image/png")
      }

      return mapCanvas.toDataURL("image/png")
    },
    [map, drawCostOverlay]
  )

  return {
    capture,
    download,
    copyToClipboard,
    getDataURL,
  }
}
