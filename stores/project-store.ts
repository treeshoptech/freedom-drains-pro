import { create } from "zustand"
import type { Project } from "@/lib/actions/projects"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface ProjectStore {
  // Current project
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void

  // Project metadata
  projectName: string
  setProjectName: (name: string) => void
  projectAddress: string
  setProjectAddress: (address: string) => void
  projectLat: number
  setProjectLat: (lat: number) => void
  projectLng: number
  setProjectLng: (lng: number) => void

  // Customer info
  customerName: string
  setCustomerName: (name: string) => void
  customerPhone: string
  setCustomerPhone: (phone: string) => void
  customerEmail: string
  setCustomerEmail: (email: string) => void
  notes: string
  setNotes: (notes: string) => void

  // Save status
  saveStatus: SaveStatus
  setSaveStatus: (status: SaveStatus) => void
  lastSaved: Date | null
  setLastSaved: (date: Date | null) => void

  // Dirty flag (unsaved changes)
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void

  // Reset to defaults
  resetProject: () => void

  // Load from project
  loadFromProject: (project: Project) => void
}

const defaultState = {
  currentProject: null,
  projectName: "",
  projectAddress: "",
  projectLat: 29.0258, // New Smyrna Beach default
  projectLng: -80.927,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  notes: "",
  saveStatus: "idle" as SaveStatus,
  lastSaved: null,
  isDirty: false,
}

export const useProjectStore = create<ProjectStore>((set) => ({
  ...defaultState,

  setCurrentProject: (project) => set({ currentProject: project }),

  setProjectName: (name) => set({ projectName: name, isDirty: true }),
  setProjectAddress: (address) => set({ projectAddress: address, isDirty: true }),
  setProjectLat: (lat) => set({ projectLat: lat }),
  setProjectLng: (lng) => set({ projectLng: lng }),

  setCustomerName: (name) => set({ customerName: name, isDirty: true }),
  setCustomerPhone: (phone) => set({ customerPhone: phone, isDirty: true }),
  setCustomerEmail: (email) => set({ customerEmail: email, isDirty: true }),
  setNotes: (notes) => set({ notes: notes, isDirty: true }),

  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastSaved: (date) => set({ lastSaved: date }),

  setIsDirty: (dirty) => set({ isDirty: dirty }),

  resetProject: () => set(defaultState),

  loadFromProject: (project) =>
    set({
      currentProject: project,
      projectName: project.name,
      projectAddress: project.address,
      projectLat: project.lat,
      projectLng: project.lng,
      customerName: project.customer_name || "",
      customerPhone: project.customer_phone || "",
      customerEmail: project.customer_email || "",
      notes: project.notes || "",
      saveStatus: "saved",
      lastSaved: new Date(project.updated_at),
      isDirty: false,
    }),
}))
