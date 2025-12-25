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

export interface DesignFeature extends Feature<LineString | Point | Polygon> {
  id: string | number
  properties: {
    elementType: ElementType
    lengthFt?: number
    areaFt?: number
    label?: string
  }
}

interface DesignStore {
  features: DesignFeature[]
  addFeature: (feature: DesignFeature) => void
  updateFeature: (id: string, feature: DesignFeature) => void
  removeFeature: (id: string) => void
  clearFeatures: () => void
  getTotalLF: () => number
  getFeaturesByType: (type: ElementType) => DesignFeature[]
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
}))
