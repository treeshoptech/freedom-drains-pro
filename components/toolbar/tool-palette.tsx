"use client"

import {
  MousePointer,
  Minus,
  Square,
  Circle,
  ArrowRight,
  Droplets,
  AlertTriangle,
  Waves,
  GitBranch,
  Pipette,
  Home,
  Undo,
  Trash2,
  Save,
  Camera,
  LucideIcon,
} from "lucide-react"
import { css } from "styled-system/css"
import { useToolStore, type ToolType } from "@/stores/tool-store"

interface Tool {
  type: ToolType
  icon: LucideIcon
  label: string
  group: "general" | "hydroblox" | "water" | "existing"
}

interface Action {
  action: string
  icon: LucideIcon
  label: string
}

const tools: Tool[] = [
  { type: "select", icon: MousePointer, label: "Select", group: "general" },
  { type: "hydroblox-run", icon: Minus, label: "HydroBlox Run", group: "hydroblox" },
  { type: "parallel-row", icon: Minus, label: "Parallel Row", group: "hydroblox" },
  { type: "transition-box", icon: Square, label: "Transition Box", group: "hydroblox" },
  { type: "stormwater-box", icon: Circle, label: "Stormwater Box", group: "hydroblox" },
  { type: "flow-arrow", icon: ArrowRight, label: "Flow Arrow", group: "water" },
  { type: "standing-water", icon: Droplets, label: "Standing Water", group: "water" },
  { type: "problem-area", icon: AlertTriangle, label: "Problem Area", group: "water" },
  { type: "existing-swale", icon: Waves, label: "Existing Swale", group: "existing" },
  { type: "existing-french-drain", icon: GitBranch, label: "French Drain", group: "existing" },
  { type: "existing-pipe", icon: Pipette, label: "Pipe", group: "existing" },
  { type: "downspout", icon: Home, label: "Downspout", group: "existing" },
]

const actions: Action[] = [
  { action: "undo", icon: Undo, label: "Undo" },
  { action: "delete", icon: Trash2, label: "Delete Selected" },
  { action: "save", icon: Save, label: "Save Project" },
  { action: "screenshot", icon: Camera, label: "Screenshot" },
]

const groupLabels: Record<Tool["group"], string> = {
  general: "General",
  hydroblox: "HydroBlox",
  water: "Water Flow",
  existing: "Existing Features",
}

const groupOrder: Tool["group"][] = ["general", "hydroblox", "water", "existing"]

export function ToolPalette() {
  const { activeTool, setActiveTool } = useToolStore()

  const handleAction = (action: string) => {
    // TODO: Implement actions
    console.log("Action:", action)
  }

  const groupedTools = groupOrder.map((group) => ({
    group,
    label: groupLabels[group],
    tools: tools.filter((t) => t.group === group),
  }))

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        width: "200px",
        height: "100%",
        bg: "white",
        borderRight: "1px solid",
        borderColor: "gray.200",
        overflowY: "auto",
      })}
    >
      {/* Tool Groups */}
      <div className={css({ flex: 1, py: "2" })}>
        {groupedTools.map(({ group, label, tools: groupTools }) => (
          <div key={group} className={css({ mb: "3" })}>
            {/* Group Header */}
            <div
              className={css({
                px: "3",
                py: "1",
                fontSize: "xs",
                fontWeight: "semibold",
                color: "gray.500",
                textTransform: "uppercase",
                letterSpacing: "wide",
              })}
            >
              {label}
            </div>

            {/* Tools */}
            {groupTools.map((tool) => {
              const Icon = tool.icon
              const isActive = activeTool === tool.type

              return (
                <button
                  key={tool.type}
                  onClick={() => setActiveTool(tool.type)}
                  title={tool.label}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "2",
                    width: "100%",
                    px: "3",
                    py: "2",
                    fontSize: "sm",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    bg: isActive ? "blue.50" : "transparent",
                    color: isActive ? "blue.700" : "gray.700",
                    borderLeft: "3px solid",
                    borderColor: isActive ? "blue.500" : "transparent",
                    _hover: {
                      bg: isActive ? "blue.50" : "gray.50",
                    },
                  })}
                >
                  <Icon size={18} />
                  <span>{tool.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className={css({
          height: "1px",
          bg: "gray.200",
          mx: "3",
        })}
      />

      {/* Action Buttons */}
      <div className={css({ py: "2" })}>
        <div
          className={css({
            px: "3",
            py: "1",
            fontSize: "xs",
            fontWeight: "semibold",
            color: "gray.500",
            textTransform: "uppercase",
            letterSpacing: "wide",
          })}
        >
          Actions
        </div>
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <button
              key={action.action}
              onClick={() => handleAction(action.action)}
              title={action.label}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "2",
                width: "100%",
                px: "3",
                py: "2",
                fontSize: "sm",
                textAlign: "left",
                cursor: "pointer",
                color: "gray.700",
                transition: "all 0.15s",
                _hover: {
                  bg: "gray.50",
                },
              })}
            >
              <Icon size={18} />
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
