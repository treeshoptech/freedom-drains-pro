"use client"

import { useEffect, useRef, useCallback } from "react"
import { useProjectStore } from "@/stores/project-store"
import { useDesignStore, type DesignFeature } from "@/stores/design-store"
import { saveProject } from "@/lib/actions/projects"

const DEBOUNCE_MS = 2000 // 2 seconds

export function useAutoSave() {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const {
    currentProject,
    projectName,
    projectAddress,
    projectLat,
    projectLng,
    customerName,
    customerPhone,
    customerEmail,
    notes,
    isDirty,
    setIsDirty,
    setSaveStatus,
    setLastSaved,
    setCurrentProject,
  } = useProjectStore()

  const features = useDesignStore((state) => state.features)

  // Save function
  const save = useCallback(async () => {
    if (!projectName || !projectAddress) {
      return { success: false, error: "Name and address required" }
    }

    setSaveStatus("saving")

    const designData = {
      type: "FeatureCollection" as const,
      features: features as DesignFeature[],
    }

    const { project, error } = await saveProject({
      id: currentProject?.id,
      name: projectName,
      address: projectAddress,
      lat: projectLat,
      lng: projectLng,
      designData,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      notes: notes || undefined,
    })

    if (error) {
      setSaveStatus("error")
      return { success: false, error }
    }

    if (project) {
      setCurrentProject(project)
      setSaveStatus("saved")
      setLastSaved(new Date())
      setIsDirty(false)
      return { success: true, project }
    }

    return { success: false, error: "Unknown error" }
  }, [
    currentProject?.id,
    projectName,
    projectAddress,
    projectLat,
    projectLng,
    customerName,
    customerPhone,
    customerEmail,
    notes,
    features,
    setSaveStatus,
    setLastSaved,
    setIsDirty,
    setCurrentProject,
  ])

  // Manual save
  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    return save()
  }, [save])

  // Auto-save with debounce when features change
  useEffect(() => {
    // Only auto-save if we have a project and it's dirty
    if (!currentProject?.id || !isDirty) return

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      save()
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [features, isDirty, currentProject?.id, save])

  // Mark as dirty when features change
  useEffect(() => {
    if (currentProject?.id && features.length > 0) {
      setIsDirty(true)
    }
  }, [features, currentProject?.id, setIsDirty])

  return {
    save: saveNow,
    isSaving: useProjectStore((state) => state.saveStatus === "saving"),
    saveStatus: useProjectStore((state) => state.saveStatus),
    lastSaved: useProjectStore((state) => state.lastSaved),
  }
}
