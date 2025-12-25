"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { css } from "styled-system/css"
import { ArrowLeft, Save, Check, Loader2, AlertCircle } from "lucide-react"
import { DesignMap } from "@/components/map/design-map"
import { ToolPalette } from "@/components/toolbar/tool-palette"
import { CostPanel } from "@/components/calculator/cost-panel"
import { useProjectStore } from "@/stores/project-store"
import { useAutoSave } from "@/hooks/use-auto-save"
import type { Project } from "@/lib/actions/projects"

interface ProjectEditorProps {
  project: Project
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const [mapReady, setMapReady] = useState(false)
  const { loadFromProject, projectName, saveStatus } = useProjectStore()
  const { save, isSaving, lastSaved } = useAutoSave()

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
        height: "100vh",
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
        })}
      >
        <div className={css({ display: "flex", alignItems: "center", gap: "4" })}>
          <Link
            href="/projects"
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              color: "gray.600",
              fontSize: "sm",
              textDecoration: "none",
              _hover: { color: "gray.900" },
            })}
          >
            <ArrowLeft size={16} />
            Projects
          </Link>
          <div
            className={css({
              height: "4",
              width: "1px",
              bg: "gray.200",
            })}
          />
          <h1
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "gray.900",
            })}
          >
            {projectName}
          </h1>
        </div>

        <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
          {/* Save status indicator */}
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              px: "4",
              py: "2",
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
              <Loader2 size={16} className={css({ animation: "spin 1s linear infinite" })} />
            ) : (
              <Save size={16} />
            )}
            Save
          </button>
        </div>
      </header>

      {/* Main content */}
      <div
        className={css({
          display: "flex",
          flex: 1,
          overflow: "hidden",
        })}
      >
        {/* Tool Palette */}
        <ToolPalette />

        {/* Map */}
        <div className={css({ flex: 1, position: "relative" })}>
          <DesignMap
            center={[project.lng, project.lat]}
            zoom={18}
            onMapReady={handleMapReady}
          />

          {/* Load design when map is ready */}
          {mapReady && <DesignLoader designData={project.design_data} />}
        </div>

        {/* Cost Panel */}
        <CostPanel />
      </div>
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
