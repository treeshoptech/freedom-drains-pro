import { create } from "zustand"
import type { Feature, LineString, Point, Polygon } from "geojson"

export type ElementType =
  | "hydroblox-run"
  | "parallel-row"
  | "transition-box"
  | "stormwater-box"
  | "flow-arrow"
  | "standing-water"
  | "problem-area"
  | "existing-swale"
  | "existing-french-drain"
  | "existing-pipe"
  | "downspout"

// Pricing for elements
export const ELEMENT_PRICES: Partial<Record<ElementType, number>> = {
  "transition-box": 400,
  "stormwater-box": 750,
}

export type FeatureStatus = "working" | "failed"

export interface DesignFeature extends Feature<LineString | Point | Polygon> {
  id: string | number
  properties: {
    elementType: ElementType
    lengthFt?: number
    areaFt?: number
    price?: number
    label?: string
    status?: FeatureStatus
  }
}

interface DesignStore {
  features: DesignFeature[]
  addFeature: (feature: DesignFeature) => void
  updateFeature: (id: string, feature: DesignFeature) => void
  removeFeature: (id: string) => void
  clearFeatures: () => void
  toggleFailedStatus: (id: string) => void
  getTotalLF: () => number
  getTotalCost: () => number
  getFeaturesByType: (type: ElementType) => DesignFeature[]
  getCountByType: (type: ElementType) => number
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  features: [],

  addFeature: (feature) =>
    set((state) => ({
      features: [...state.features, feature],
    })),

  updateFeature: (id, feature) =>
    set((state) => ({
      features: state.features.map((f) => (f.id === id ? feature : f)),
    })),

  removeFeature: (id) =>
    set((state) => ({
      features: state.features.filter((f) => f.id !== id),
    })),

  clearFeatures: () => set({ features: [] }),

  toggleFailedStatus: (id) =>
    set((state) => ({
      features: state.features.map((f) => {
        if (String(f.id) === id) {
          return {
            ...f,
            properties: {
              ...f.properties,
              status: f.properties.status === "failed" ? "working" : "failed",
            },
          }
        }
        return f
      }),
    })),

  getTotalLF: () => {
    const { features } = get()
    return features.reduce((total, f) => {
      if (f.properties.lengthFt) {
        return total + f.properties.lengthFt
      }
      return total
    }, 0)
  },

  getFeaturesByType: (type) => {
    const { features } = get()
    return features.filter((f) => f.properties.elementType === type)
  },

  getCountByType: (type) => {
    const { features } = get()
    return features.filter((f) => f.properties.elementType === type).length
  },

  getTotalCost: () => {
    const { features } = get()
    return features.reduce((total, f) => {
      if (f.properties.price) {
        return total + f.properties.price
      }
      return total
    }, 0)
  },
}))
