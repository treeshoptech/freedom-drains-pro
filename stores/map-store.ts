import { create } from "zustand"
import type mapboxgl from "mapbox-gl"

interface MapStore {
  map: mapboxgl.Map | null
  setMap: (map: mapboxgl.Map | null) => void
}

export const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (map) => set({ map }),
}))
