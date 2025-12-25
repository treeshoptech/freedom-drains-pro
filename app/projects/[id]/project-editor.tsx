"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { css } from "styled-system/css"
import { ArrowLeft, Save, Check, Loader2, AlertCircle, Menu } from "lucide-react"
import { DesignMap } from "@/components/map/design-map"
import { ToolPalette } from "@/components/toolbar/tool-palette"
import { CostPanel } from "@/components/calculator/cost-panel"
import { useProjectStore } from "@/stores/project-store"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useIsMobile } from "@/hooks/use-media-query"
import type { Project } from "@/lib/actions/projects"

interface ProjectEditorProps {
  project: Project
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const [mapReady, setMapReady] = useState(false)
  const { loadFromProject, projectName, saveStatus } = useProjectStore()
  const { save, isSaving, lastSaved } = useAutoSave()
  const isMobile = useIsMobile()

  // Load project data on mount
  useEffect(() => {
    loadFromProject(project)
  }, [project, loadFromProject])

  const handleMapReady = useCallback(() => {
    setMapReady(true)
  }, [])

  const handleSave = async () => {
    await save()
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
            href="/projects"
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "44px",
              minHeight: "44px",
              color: "gray.600",
              textDecoration: "none",
              borderRadius: "lg",
              _hover: { color: "gray.900", bg: "gray.50" },
              "@media (max-width: 767px)": {
                minWidth: "40px",
                minHeight: "40px",
              },
            })}
          >
            <ArrowLeft size={20} />
            <span
              className={css({
                ml: "1",
                fontSize: "sm",
                "@media (max-width: 767px)": {
                  display: "none",
                },
              })}
            >
              Projects
            </span>
          </Link>
          <div
            className={css({
              height: "4",
              width: "1px",
              bg: "gray.200",
              "@media (max-width: 767px)": {
                display: "none",
              },
            })}
          />
          <h1
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "gray.900",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "@media (max-width: 767px)": {
                fontSize: "base",
                maxWidth: "150px",
              },
            })}
          >
            {projectName}
          </h1>
        </div>

        <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
          {/* Save status indicator - hidden on mobile */}
          <div
            className={css({
              "@media (max-width: 767px)": {
                display: "none",
              },
            })}
          >
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>

          {/* Save button */}
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
              "@media (max-width: 767px)": {
                px: "3",
              },
            })}
          >
            {isSaving ? (
              <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
            ) : saveStatus === "saved" ? (
              <Check size={18} />
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
              {isSaving ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save"}
            </span>
          </button>
        </div>
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
        {/* Tool Palette - Desktop sidebar / Mobile bottom bar */}
        {!isMobile && <ToolPalette />}

        {/* Map */}
        <div
          className={css({
            flex: 1,
            position: "relative",
            "@media (max-width: 767px)": {
              // Account for mobile bottom bar
              pb: "60px",
            },
          })}
        >
          <DesignMap
            center={[project.lng, project.lat]}
            zoom={18}
            onMapReady={handleMapReady}
          />

          {/* Load design when map is ready */}
          {mapReady && <DesignLoader designData={project.design_data} />}
        </div>

        {/* Cost Panel - Desktop sidebar / Mobile FAB + sheet */}
        {!isMobile && <CostPanel />}
      </div>

      {/* Mobile-only components */}
      {isMobile && (
        <>
          <ToolPalette />
          <CostPanel />
        </>
      )}
    </div>
  )
}

function SaveIndicator({
  status,
  lastSaved,
}: {
  status: string
  lastSaved: Date | null
}) {
  if (status === "saving") {
    return (
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "2",
          color: "gray.500",
          fontSize: "sm",
        })}
      >
        <Loader2 size={14} className={css({ animation: "spin 1s linear infinite" })} />
        Saving...
      </div>
    )
  }

  if (status === "saved" && lastSaved) {
    return (
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "2",
          color: "green.600",
          fontSize: "sm",
        })}
      >
        <Check size={14} />
        Saved
      </div>
    )
  }

  if (status === "error") {
    return (
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "2",
          color: "red.600",
          fontSize: "sm",
        })}
      >
        <AlertCircle size={14} />
        Save failed
      </div>
    )
  }

  return null
}

// Component to load design after map is ready
function DesignLoader({
  designData,
}: {
  designData: Project["design_data"]
}) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return

    // Import and use the design store to load features
    import("@/stores/design-store").then(({ useDesignStore }) => {
      const { clearFeatures, addFeature } = useDesignStore.getState()

      // Clear existing features
      clearFeatures()

      // Add features from project
      if (designData?.features) {
        designData.features.forEach((feature) => {
          addFeature(feature)
        })
      }

      setLoaded(true)
    })
  }, [designData, loaded])

  return null
}
