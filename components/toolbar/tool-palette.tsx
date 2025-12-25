"use client"

import { useState, useRef, useEffect } from "react"
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
  Copy,
  Download,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  X,
  LucideIcon,
} from "lucide-react"
import { css } from "styled-system/css"
import { useToolStore, type ToolType } from "@/stores/tool-store"
import { useMapStore } from "@/stores/map-store"
import { useScreenshot } from "@/hooks/use-screenshot"
import { useIsMobile } from "@/hooks/use-media-query"
import { ELEMENT_COLORS } from "@/hooks/use-draw"

interface Tool {
  type: ToolType
  icon: LucideIcon
  label: string
  group: "general" | "hydroblox" | "water" | "existing"
  lineStyle?: "solid" | "dashed" | "dotted"
}

interface Action {
  action: string
  icon: LucideIcon
  label: string
}

const tools: Tool[] = [
  { type: "select", icon: MousePointer, label: "Select", group: "general" },
  { type: "hydroblox-run", icon: Minus, label: "HydroBlox Run", group: "hydroblox", lineStyle: "solid" },
  { type: "parallel-row", icon: Minus, label: "Parallel Row", group: "hydroblox", lineStyle: "dashed" },
  { type: "transition-box", icon: Square, label: "Transition Box", group: "hydroblox" },
  { type: "stormwater-box", icon: Circle, label: "Stormwater Box", group: "hydroblox" },
  { type: "flow-arrow", icon: ArrowRight, label: "Flow Arrow", group: "water", lineStyle: "solid" },
  { type: "standing-water", icon: Droplets, label: "Standing Water", group: "water" },
  { type: "problem-area", icon: AlertTriangle, label: "Problem Area", group: "water" },
  { type: "existing-swale", icon: Waves, label: "Existing Swale", group: "existing", lineStyle: "dashed" },
  { type: "existing-french-drain", icon: GitBranch, label: "French Drain", group: "existing", lineStyle: "dotted" },
  { type: "existing-pipe", icon: Pipette, label: "Pipe", group: "existing", lineStyle: "solid" },
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
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileToolPalette />
  }

  return <DesktopToolPalette />
}

// Desktop version - sidebar
function DesktopToolPalette() {
  const { activeTool, setActiveTool } = useToolStore()
  const map = useMapStore((state) => state.map)
  const { copyToClipboard, download } = useScreenshot(map)
  const [screenshotMenuOpen, setScreenshotMenuOpen] = useState(false)
  const [screenshotStatus, setScreenshotStatus] = useState<"idle" | "success" | "error">("idle")
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setScreenshotMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (screenshotStatus !== "idle") {
      const timer = setTimeout(() => setScreenshotStatus("idle"), 2000)
      return () => clearTimeout(timer)
    }
  }, [screenshotStatus])

  const handleCopyToClipboard = async (includeOverlay: boolean) => {
    const success = await copyToClipboard({ includeOverlay })
    setScreenshotStatus(success ? "success" : "error")
    setScreenshotMenuOpen(false)
  }

  const handleDownload = async (includeOverlay: boolean) => {
    const filename = includeOverlay ? "drainage-design-quote.png" : "drainage-design.png"
    await download({ filename, includeOverlay })
    setScreenshotMenuOpen(false)
  }

  const handleAction = (action: string) => {
    if (action === "screenshot") {
      setScreenshotMenuOpen(!screenshotMenuOpen)
      return
    }
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
        "@media (min-width: 768px) and (max-width: 1023px)": {
          width: "180px",
        },
      })}
    >
      {/* Tool Groups */}
      <div className={css({ flex: 1, py: "2" })}>
        {groupedTools.map(({ group, label, tools: groupTools }) => (
          <div key={group} className={css({ mb: "3" })}>
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

            {groupTools.map((tool) => {
              const Icon = tool.icon
              const isActive = activeTool === tool.type
              const color = ELEMENT_COLORS[tool.type]

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
                  {/* Color indicator */}
                  {color && (
                    <span
                      className={css({
                        width: "14px",
                        height: tool.lineStyle ? "4px" : "14px",
                        borderRadius: tool.lineStyle ? "1px" : "sm",
                        flexShrink: 0,
                      })}
                      style={{
                        backgroundColor: color,
                        ...(tool.lineStyle === "dashed" && {
                          background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 4px, transparent 4px, transparent 6px)`,
                        }),
                        ...(tool.lineStyle === "dotted" && {
                          background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 4px)`,
                        }),
                      }}
                    />
                  )}
                  {!color && <Icon size={18} />}
                  <span>{tool.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={css({ height: "1px", bg: "gray.200", mx: "3" })} />

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
          const isScreenshot = action.action === "screenshot"

          if (isScreenshot) {
            return (
              <div key={action.action} ref={menuRef} className={css({ position: "relative" })}>
                <button
                  onClick={() => handleAction(action.action)}
                  title={action.label}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    px: "3",
                    py: "2",
                    fontSize: "sm",
                    textAlign: "left",
                    cursor: "pointer",
                    color: screenshotStatus === "success" ? "green.600" : "gray.700",
                    bg: screenshotMenuOpen ? "gray.50" : "transparent",
                    transition: "all 0.15s",
                    _hover: { bg: "gray.50" },
                  })}
                >
                  <span className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                    {screenshotStatus === "success" ? <Check size={18} /> : <Icon size={18} />}
                    <span>{screenshotStatus === "success" ? "Copied!" : action.label}</span>
                  </span>
                  <ChevronDown size={14} />
                </button>

                {screenshotMenuOpen && (
                  <div
                    className={css({
                      position: "absolute",
                      left: "100%",
                      top: 0,
                      ml: "1",
                      bg: "white",
                      border: "1px solid",
                      borderColor: "gray.200",
                      borderRadius: "lg",
                      shadow: "lg",
                      py: "1",
                      minWidth: "200px",
                      zIndex: 50,
                    })}
                  >
                    <div className={css({ px: "3", py: "1", fontSize: "xs", fontWeight: "semibold", color: "gray.500", textTransform: "uppercase" })}>
                      Copy to Clipboard
                    </div>
                    <button onClick={() => handleCopyToClipboard(false)} className={css({ display: "flex", alignItems: "center", gap: "2", width: "100%", px: "3", py: "2", fontSize: "sm", textAlign: "left", cursor: "pointer", color: "gray.700", _hover: { bg: "gray.50" } })}>
                      <Copy size={16} />
                      Map Only
                    </button>
                    <button onClick={() => handleCopyToClipboard(true)} className={css({ display: "flex", alignItems: "center", gap: "2", width: "100%", px: "3", py: "2", fontSize: "sm", textAlign: "left", cursor: "pointer", color: "gray.700", _hover: { bg: "gray.50" } })}>
                      <FileText size={16} />
                      With Cost Overlay
                    </button>
                    <div className={css({ height: "1px", bg: "gray.100", my: "1" })} />
                    <div className={css({ px: "3", py: "1", fontSize: "xs", fontWeight: "semibold", color: "gray.500", textTransform: "uppercase" })}>
                      Download PNG
                    </div>
                    <button onClick={() => handleDownload(false)} className={css({ display: "flex", alignItems: "center", gap: "2", width: "100%", px: "3", py: "2", fontSize: "sm", textAlign: "left", cursor: "pointer", color: "gray.700", _hover: { bg: "gray.50" } })}>
                      <Download size={16} />
                      Map Only
                    </button>
                    <button onClick={() => handleDownload(true)} className={css({ display: "flex", alignItems: "center", gap: "2", width: "100%", px: "3", py: "2", fontSize: "sm", textAlign: "left", cursor: "pointer", color: "gray.700", _hover: { bg: "gray.50" } })}>
                      <FileText size={16} />
                      With Cost Overlay
                    </button>
                  </div>
                )}
              </div>
            )
          }

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
                _hover: { bg: "gray.50" },
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

// Mobile version - bottom bar with expandable drawer
function MobileToolPalette() {
  const { activeTool, setActiveTool } = useToolStore()
  const map = useMapStore((state) => state.map)
  const { copyToClipboard, download } = useScreenshot(map)
  const [expanded, setExpanded] = useState(false)
  const [screenshotMenuOpen, setScreenshotMenuOpen] = useState(false)
  const [screenshotStatus, setScreenshotStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    if (screenshotStatus !== "idle") {
      const timer = setTimeout(() => setScreenshotStatus("idle"), 2000)
      return () => clearTimeout(timer)
    }
  }, [screenshotStatus])

  const handleCopyToClipboard = async (includeOverlay: boolean) => {
    const success = await copyToClipboard({ includeOverlay })
    setScreenshotStatus(success ? "success" : "error")
    setScreenshotMenuOpen(false)
  }

  const handleDownload = async (includeOverlay: boolean) => {
    const filename = includeOverlay ? "drainage-design-quote.png" : "drainage-design.png"
    await download({ filename, includeOverlay })
    setScreenshotMenuOpen(false)
  }

  // Quick access tools for bottom bar
  const quickTools = [
    tools.find((t) => t.type === "select")!,
    tools.find((t) => t.type === "hydroblox-run")!,
    tools.find((t) => t.type === "transition-box")!,
    tools.find((t) => t.type === "stormwater-box")!,
  ]

  const groupedTools = groupOrder.map((group) => ({
    group,
    label: groupLabels[group],
    tools: tools.filter((t) => t.group === group),
  }))

  return (
    <>
      {/* Bottom bar */}
      <div
        className={css({
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          bg: "white",
          borderTop: "1px solid",
          borderColor: "gray.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          px: "2",
          zIndex: 40,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        })}
      >
        {quickTools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.type

          return (
            <button
              key={tool.type}
              onClick={() => setActiveTool(tool.type)}
              title={tool.label}
              className={css({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "44px",
                minHeight: "44px",
                p: "2",
                borderRadius: "lg",
                cursor: "pointer",
                bg: isActive ? "blue.50" : "transparent",
                color: isActive ? "blue.600" : "gray.600",
                transition: "all 0.15s",
              })}
            >
              <Icon size={22} />
              <span className={css({ fontSize: "2xs", mt: "0.5" })}>{tool.label.split(" ")[0]}</span>
            </button>
          )
        })}

        {/* More tools button */}
        <button
          onClick={() => setExpanded(true)}
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "44px",
            minHeight: "44px",
            p: "2",
            borderRadius: "lg",
            cursor: "pointer",
            bg: "transparent",
            color: "gray.600",
            transition: "all 0.15s",
          })}
        >
          <MoreHorizontal size={22} />
          <span className={css({ fontSize: "2xs", mt: "0.5" })}>More</span>
        </button>

        {/* Actions */}
        <button
          onClick={() => {
            setScreenshotMenuOpen(!screenshotMenuOpen)
          }}
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "44px",
            minHeight: "44px",
            p: "2",
            borderRadius: "lg",
            cursor: "pointer",
            bg: screenshotStatus === "success" ? "green.50" : "transparent",
            color: screenshotStatus === "success" ? "green.600" : "gray.600",
            transition: "all 0.15s",
          })}
        >
          {screenshotStatus === "success" ? <Check size={22} /> : <Camera size={22} />}
          <span className={css({ fontSize: "2xs", mt: "0.5" })}>
            {screenshotStatus === "success" ? "Done" : "Share"}
          </span>
        </button>
      </div>

      {/* Screenshot menu */}
      {screenshotMenuOpen && (
        <>
          <div
            className={css({
              position: "fixed",
              inset: 0,
              bg: "black/30",
              zIndex: 45,
            })}
            onClick={() => setScreenshotMenuOpen(false)}
          />
          <div
            className={css({
              position: "fixed",
              bottom: "70px",
              right: "8px",
              bg: "white",
              borderRadius: "xl",
              shadow: "xl",
              py: "2",
              minWidth: "200px",
              zIndex: 50,
            })}
          >
            <div className={css({ px: "4", py: "2", fontSize: "xs", fontWeight: "semibold", color: "gray.500", textTransform: "uppercase" })}>
              Copy to Clipboard
            </div>
            <button
              onClick={() => handleCopyToClipboard(false)}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "3",
                width: "100%",
                px: "4",
                py: "3",
                fontSize: "sm",
                textAlign: "left",
                cursor: "pointer",
                color: "gray.700",
                _active: { bg: "gray.100" },
              })}
            >
              <Copy size={18} />
              Map Only
            </button>
            <button
              onClick={() => handleCopyToClipboard(true)}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "3",
                width: "100%",
                px: "4",
                py: "3",
                fontSize: "sm",
                textAlign: "left",
                cursor: "pointer",
                color: "gray.700",
                _active: { bg: "gray.100" },
              })}
            >
              <FileText size={18} />
              With Quote
            </button>
            <div className={css({ height: "1px", bg: "gray.100", my: "1" })} />
            <div className={css({ px: "4", py: "2", fontSize: "xs", fontWeight: "semibold", color: "gray.500", textTransform: "uppercase" })}>
              Download
            </div>
            <button
              onClick={() => handleDownload(false)}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "3",
                width: "100%",
                px: "4",
                py: "3",
                fontSize: "sm",
                textAlign: "left",
                cursor: "pointer",
                color: "gray.700",
                _active: { bg: "gray.100" },
              })}
            >
              <Download size={18} />
              Map Only
            </button>
            <button
              onClick={() => handleDownload(true)}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "3",
                width: "100%",
                px: "4",
                py: "3",
                fontSize: "sm",
                textAlign: "left",
                cursor: "pointer",
                color: "gray.700",
                _active: { bg: "gray.100" },
              })}
            >
              <FileText size={18} />
              With Quote
            </button>
          </div>
        </>
      )}

      {/* Expanded drawer */}
      {expanded && (
        <>
          <div
            className={css({
              position: "fixed",
              inset: 0,
              bg: "black/30",
              zIndex: 45,
            })}
            onClick={() => setExpanded(false)}
          />
          <div
            className={css({
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "70vh",
              bg: "white",
              borderTopRadius: "2xl",
              zIndex: 50,
              overflowY: "auto",
              animation: "slideUp 0.2s ease-out",
            })}
          >
            {/* Handle */}
            <div className={css({ display: "flex", justifyContent: "center", py: "3" })}>
              <div
                className={css({
                  width: "40px",
                  height: "4px",
                  bg: "gray.300",
                  borderRadius: "full",
                })}
              />
            </div>

            {/* Header */}
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: "4",
                pb: "3",
                borderBottom: "1px solid",
                borderColor: "gray.100",
              })}
            >
              <h2 className={css({ fontSize: "lg", fontWeight: "semibold", color: "gray.900" })}>
                Tools
              </h2>
              <button
                onClick={() => setExpanded(false)}
                className={css({
                  p: "2",
                  borderRadius: "full",
                  color: "gray.500",
                  _active: { bg: "gray.100" },
                })}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tools grid */}
            <div className={css({ p: "4" })}>
              {groupedTools.map(({ group, label, tools: groupTools }) => (
                <div key={group} className={css({ mb: "4" })}>
                  <div
                    className={css({
                      fontSize: "xs",
                      fontWeight: "semibold",
                      color: "gray.500",
                      textTransform: "uppercase",
                      letterSpacing: "wide",
                      mb: "2",
                    })}
                  >
                    {label}
                  </div>
                  <div
                    className={css({
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "2",
                    })}
                  >
                    {groupTools.map((tool) => {
                      const Icon = tool.icon
                      const isActive = activeTool === tool.type
                      const color = ELEMENT_COLORS[tool.type]

                      return (
                        <button
                          key={tool.type}
                          onClick={() => {
                            setActiveTool(tool.type)
                            setExpanded(false)
                          }}
                          className={css({
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            p: "3",
                            minHeight: "70px",
                            borderRadius: "xl",
                            cursor: "pointer",
                            bg: isActive ? "blue.50" : "gray.50",
                            color: isActive ? "blue.600" : "gray.700",
                            border: "2px solid",
                            borderColor: isActive ? "blue.200" : "transparent",
                            transition: "all 0.15s",
                            _active: { transform: "scale(0.95)" },
                          })}
                        >
                          {/* Color indicator for mobile */}
                          {color ? (
                            <span
                              className={css({
                                width: tool.lineStyle ? "24px" : "20px",
                                height: tool.lineStyle ? "6px" : "20px",
                                borderRadius: tool.lineStyle ? "2px" : "md",
                                mb: "1",
                              })}
                              style={{
                                backgroundColor: color,
                                ...(tool.lineStyle === "dashed" && {
                                  background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 5px, transparent 5px, transparent 8px)`,
                                }),
                                ...(tool.lineStyle === "dotted" && {
                                  background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 6px)`,
                                }),
                              }}
                            />
                          ) : (
                            <Icon size={24} />
                          )}
                          <span
                            className={css({
                              fontSize: "xs",
                              mt: "1",
                              textAlign: "center",
                              lineHeight: "tight",
                            })}
                          >
                            {tool.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className={css({ mb: "4" })}>
                <div
                  className={css({
                    fontSize: "xs",
                    fontWeight: "semibold",
                    color: "gray.500",
                    textTransform: "uppercase",
                    letterSpacing: "wide",
                    mb: "2",
                  })}
                >
                  Actions
                </div>
                <div
                  className={css({
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "2",
                  })}
                >
                  {actions
                    .filter((a) => a.action !== "screenshot")
                    .map((action) => {
                      const Icon = action.icon

                      return (
                        <button
                          key={action.action}
                          onClick={() => {
                            console.log("Action:", action.action)
                            setExpanded(false)
                          }}
                          className={css({
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            p: "3",
                            minHeight: "70px",
                            borderRadius: "xl",
                            cursor: "pointer",
                            bg: "gray.50",
                            color: "gray.700",
                            transition: "all 0.15s",
                            _active: { transform: "scale(0.95)" },
                          })}
                        >
                          <Icon size={24} />
                          <span
                            className={css({
                              fontSize: "xs",
                              mt: "1",
                              textAlign: "center",
                              lineHeight: "tight",
                            })}
                          >
                            {action.label}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Safe area padding */}
            <div className={css({ height: "env(safe-area-inset-bottom)" })} />
          </div>
        </>
      )}
    </>
  )
}
