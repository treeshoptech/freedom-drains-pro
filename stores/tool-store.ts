import { create } from "zustand"

export type ToolType =
  | "select"
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

interface ToolStore {
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void
}

export const useToolStore = create<ToolStore>((set) => ({
  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),
}))
