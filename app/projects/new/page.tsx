"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { css } from "styled-system/css"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { DesignMap } from "@/components/map/design-map"
import { ToolPalette } from "@/components/toolbar/tool-palette"
import { CostPanel } from "@/components/calculator/cost-panel"
import { useProjectStore } from "@/stores/project-store"
import { useDesignStore } from "@/stores/design-store"
import { useIsMobile } from "@/hooks/use-media-query"
import { saveProject } from "@/lib/actions/projects"

function NewProjectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSaving, setIsSaving] = useState(false)
  const isMobile = useIsMobile()

  const address = searchParams.get("address") || ""
  const lat = parseFloat(searchParams.get("lat") || "29.0258")
  const lng = parseFloat(searchParams.get("lng") || "-80.927")

  const {
    setProjectName,
    setProjectAddress,
    setProjectLat,
    setProjectLng,
    projectName,
  } = useProjectStore()

  const features = useDesignStore((state) => state.features)
  const clearFeatures = useDesignStore((state) => state.clearFeatures)

  // Initialize project data
  useEffect(() => {
    // Clear any existing features
    clearFeatures()

    // Set project defaults from URL params
    const name = address.split(",")[0] || "New Project"
    setProjectName(name)
    setProjectAddress(address)
    setProjectLat(lat)
    setProjectLng(lng)
  }, [address, lat, lng, setProjectName, setProjectAddress, setProjectLat, setProjectLng, clearFeatures])

  const handleSave = async () => {
    if (!projectName || !address) return

    setIsSaving(true)

    const designData = {
      type: "FeatureCollection" as const,
      features: features,
    }

    const { project, error } = await saveProject({
      name: projectName,
      address: address,
      lat: lat,
      lng: lng,
      designData,
    })

    if (error) {
      console.error("Save error:", error)
      setIsSaving(false)
      return
    }

    if (project) {
      // Navigate to the saved project
      router.push(`/projects/${project.id}`)
    }
  }

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
      })}
    >
      {/* Header */}
      <header
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "4",
          py: "3",
          bg: "white",
          borderBottom: "1px solid",
          borderColor: "gray.200",
          zIndex: 30,
          "@media (max-width: 767px)": {
            px: "3",
            py: "2",
          },
        })}
      >
        <div className={css({ display: "flex", alignItems: "center", gap: "3", minWidth: 0 })}>
          <Link
            href="/"
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1",
              px: "2",
              py: "2",
              minWidth: "44px",
              minHeight: "44px",
              color: "gray.600",
              textDecoration: "none",
              borderRadius: "lg",
              _hover: { color: "gray.900", bg: "gray.50" },
            })}
          >
            <ArrowLeft size={20} />
            <span
              className={css({
                fontSize: "sm",
                "@media (max-width: 767px)": {
                  display: "none",
                },
              })}
            >
              Cancel
            </span>
          </Link>
          <div className={css({ minWidth: 0 })}>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name"
              className={css({
                fontSize: "lg",
                fontWeight: "semibold",
                color: "gray.900",
                border: "none",
                outline: "none",
                bg: "transparent",
                width: "100%",
                _placeholder: { color: "gray.400" },
                "@media (max-width: 767px)": {
                  fontSize: "base",
                  maxWidth: "180px",
                },
              })}
            />
            <p
              className={css({
                fontSize: "xs",
                color: "gray.500",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "@media (max-width: 767px)": {
                  maxWidth: "180px",
                },
              })}
            >
              {address}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2",
            px: "4",
            py: "2",
            minWidth: "44px",
            minHeight: "44px",
            bg: "blue.500",
            color: "white",
            borderRadius: "lg",
            fontSize: "sm",
            fontWeight: "medium",
            cursor: "pointer",
            _hover: { bg: "blue.600" },
            _disabled: { opacity: 0.5, cursor: "not-allowed" },
          })}
        >
          {isSaving ? (
            <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
          ) : (
            <Save size={18} />
          )}
          <span
            className={css({
              "@media (max-width: 767px)": {
                display: "none",
              },
            })}
          >
            Save Project
          </span>
        </button>
      </header>

      {/* Main content */}
      <div
        className={css({
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        })}
      >
        {/* Tool Palette - Desktop */}
        {!isMobile && <ToolPalette />}

        {/* Map */}
        <div
          className={css({
            flex: 1,
            position: "relative",
            "@media (max-width: 767px)": {
              pb: "60px",
            },
          })}
        >
          <DesignMap center={[lng, lat]} zoom={18} />
        </div>

        {/* Cost Panel - Desktop */}
        {!isMobile && <CostPanel />}
      </div>

      {/* Mobile components */}
      {isMobile && (
        <>
          <ToolPalette />
          <CostPanel />
        </>
      )}
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          })}
        >
          <Loader2 size={32} className={css({ animation: "spin 1s linear infinite", color: "blue.500" })} />
        </div>
      }
    >
      <NewProjectContent />
    </Suspense>
  )
}
