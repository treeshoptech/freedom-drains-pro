"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { css } from "styled-system/css"
import {
  Plus,
  Search,
  Trash2,
  MapPin,
  DollarSign,
  Clock,
  Loader2,
  X,
  ChevronRight,
  FolderOpen,
} from "lucide-react"
import { AddressSearch } from "@/components/address-search"
import { listProjects, deleteProject } from "@/lib/actions/projects"
import type { ProjectListItem } from "@/lib/actions/projects"

export default function HomePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setIsLoading(true)
    const { projects, error } = await listProjects()
    if (projects) {
      setProjects(projects)
    }
    setIsLoading(false)
  }

  async function handleDelete(id: string) {
    const { success } = await deleteProject(id)
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
    setDeleteConfirm(null)
  }

  // Filter projects by search query
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return { bg: "gray.100", text: "gray.600" }
      case "quoted":
        return { bg: "blue.100", text: "blue.700" }
      case "approved":
        return { bg: "green.100", text: "green.700" }
      case "completed":
        return { bg: "purple.100", text: "purple.700" }
      default:
        return { bg: "gray.100", text: "gray.600" }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={css({
        minHeight: "100vh",
        bg: "gray.50",
      })}
    >
      {/* Header */}
      <header
        className={css({
          bg: "white",
          borderBottom: "1px solid",
          borderColor: "gray.200",
          position: "sticky",
          top: 0,
          zIndex: 20,
        })}
      >
        <div
          className={css({
            maxWidth: "1200px",
            mx: "auto",
            px: "4",
            py: "4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "4",
            "@media (max-width: 640px)": {
              flexDirection: "column",
              alignItems: "stretch",
            },
          })}
        >
          <h1
            className={css({
              fontSize: "xl",
              fontWeight: "bold",
              color: "blue.600",
              whiteSpace: "nowrap",
            })}
          >
            Freedom Drains Pro
          </h1>

          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "3",
              flex: 1,
              maxWidth: "500px",
              "@media (max-width: 640px)": {
                maxWidth: "100%",
              },
            })}
          >
            <div className={css({ position: "relative", flex: 1 })}>
              <Search
                size={18}
                className={css({
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "gray.400",
                  pointerEvents: "none",
                })}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={css({
                  width: "100%",
                  pl: "10",
                  pr: "4",
                  py: "2.5",
                  fontSize: "sm",
                  border: "1px solid",
                  borderColor: "gray.300",
                  borderRadius: "lg",
                  bg: "white",
                  outline: "none",
                  _focus: { borderColor: "blue.500" },
                  _placeholder: { color: "gray.400" },
                })}
              />
            </div>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "2",
                px: "4",
                py: "2.5",
                bg: "blue.500",
                color: "white",
                borderRadius: "lg",
                fontSize: "sm",
                fontWeight: "semibold",
                cursor: "pointer",
                whiteSpace: "nowrap",
                _hover: { bg: "blue.600" },
              })}
            >
              <Plus size={18} />
              <span className={css({ "@media (max-width: 480px)": { display: "none" } })}>
                New Project
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={css({
          maxWidth: "1200px",
          mx: "auto",
          px: "4",
          py: "6",
        })}
      >
        {isLoading ? (
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: "20",
            })}
          >
            <Loader2 size={32} className={css({ animation: "spin 1s linear infinite", color: "blue.500" })} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: "20",
              textAlign: "center",
            })}
          >
            <div
              className={css({
                width: "80px",
                height: "80px",
                bg: "gray.100",
                borderRadius: "2xl",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: "4",
              })}
            >
              <FolderOpen size={36} className={css({ color: "gray.400" })} />
            </div>
            <h2 className={css({ fontSize: "lg", fontWeight: "semibold", color: "gray.900", mb: "2" })}>
              {searchQuery ? "No projects found" : "No projects yet"}
            </h2>
            <p className={css({ fontSize: "sm", color: "gray.500", mb: "6", maxWidth: "300px" })}>
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first drainage design project to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewProjectModal(true)}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "2",
                  px: "5",
                  py: "3",
                  bg: "blue.500",
                  color: "white",
                  borderRadius: "lg",
                  fontSize: "sm",
                  fontWeight: "semibold",
                  cursor: "pointer",
                  _hover: { bg: "blue.600" },
                })}
              >
                <Plus size={18} />
                Create First Project
              </button>
            )}
          </div>
        ) : (
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "4",
              "@media (max-width: 640px)": {
                gridTemplateColumns: "1fr",
              },
            })}
          >
            {filteredProjects.map((project) => {
              const statusColors = getStatusColor(project.status)
              return (
                <div
                  key={project.id}
                  className={css({
                    bg: "white",
                    borderRadius: "xl",
                    border: "1px solid",
                    borderColor: "gray.200",
                    overflow: "hidden",
                    transition: "all 0.15s",
                    _hover: { shadow: "md", borderColor: "gray.300" },
                  })}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className={css({
                      display: "block",
                      p: "4",
                      textDecoration: "none",
                      cursor: "pointer",
                    })}
                  >
                    <div
                      className={css({
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        mb: "3",
                      })}
                    >
                      <div className={css({ minWidth: 0, flex: 1 })}>
                        <h3
                          className={css({
                            fontSize: "base",
                            fontWeight: "semibold",
                            color: "gray.900",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          })}
                        >
                          {project.name}
                        </h3>
                        <div
                          className={css({
                            display: "flex",
                            alignItems: "center",
                            gap: "1.5",
                            mt: "1",
                          })}
                        >
                          <MapPin size={14} className={css({ color: "gray.400", flexShrink: 0 })} />
                          <span
                            className={css({
                              fontSize: "sm",
                              color: "gray.500",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            })}
                          >
                            {project.address}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className={css({ color: "gray.300", flexShrink: 0 })} />
                    </div>

                    <div
                      className={css({
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pt: "3",
                        borderTop: "1px solid",
                        borderColor: "gray.100",
                      })}
                    >
                      <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
                        <span
                          className={css({
                            px: "2",
                            py: "0.5",
                            fontSize: "xs",
                            fontWeight: "medium",
                            borderRadius: "md",
                            textTransform: "capitalize",
                            bg: statusColors.bg,
                            color: statusColors.text,
                          })}
                        >
                          {project.status}
                        </span>
                        <div
                          className={css({
                            display: "flex",
                            alignItems: "center",
                            gap: "1",
                          })}
                        >
                          <DollarSign size={14} className={css({ color: "gray.400" })} />
                          <span className={css({ fontSize: "sm", fontWeight: "semibold", color: "gray.700" })}>
                            {project.total_cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div
                        className={css({
                          display: "flex",
                          alignItems: "center",
                          gap: "1",
                        })}
                      >
                        <Clock size={12} className={css({ color: "gray.400" })} />
                        <span className={css({ fontSize: "xs", color: "gray.400" })}>
                          {formatDate(project.updated_at)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Delete button row */}
                  <div
                    className={css({
                      display: "flex",
                      justifyContent: "flex-end",
                      px: "4",
                      pb: "3",
                    })}
                  >
                    {deleteConfirm === project.id ? (
                      <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                        <span className={css({ fontSize: "xs", color: "red.600" })}>Delete?</span>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className={css({
                            px: "2",
                            py: "1",
                            fontSize: "xs",
                            fontWeight: "medium",
                            color: "white",
                            bg: "red.500",
                            borderRadius: "md",
                            cursor: "pointer",
                            _hover: { bg: "red.600" },
                          })}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className={css({
                            px: "2",
                            py: "1",
                            fontSize: "xs",
                            fontWeight: "medium",
                            color: "gray.600",
                            bg: "gray.100",
                            borderRadius: "md",
                            cursor: "pointer",
                            _hover: { bg: "gray.200" },
                          })}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(project.id)}
                        className={css({
                          display: "flex",
                          alignItems: "center",
                          gap: "1",
                          px: "2",
                          py: "1",
                          fontSize: "xs",
                          color: "gray.400",
                          borderRadius: "md",
                          cursor: "pointer",
                          _hover: { color: "red.500", bg: "red.50" },
                        })}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal onClose={() => setShowNewProjectModal(false)} />
      )}
    </div>
  )
}

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    lat: number
    lng: number
  } | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = () => {
    if (!selectedLocation) return

    setIsCreating(true)
    router.push(
      `/projects/new?address=${encodeURIComponent(selectedLocation.address)}&lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={css({
          position: "fixed",
          inset: 0,
          bg: "black/50",
          zIndex: 40,
        })}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={css({
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "500px",
          bg: "white",
          borderRadius: "2xl",
          shadow: "2xl",
          zIndex: 50,
          overflow: "hidden",
          "@media (max-width: 640px)": {
            top: "auto",
            bottom: 0,
            left: 0,
            transform: "none",
            maxWidth: "100%",
            borderBottomRadius: 0,
          },
        })}
      >
        {/* Header */}
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: "5",
            py: "4",
            borderBottom: "1px solid",
            borderColor: "gray.200",
          })}
        >
          <h2 className={css({ fontSize: "lg", fontWeight: "semibold", color: "gray.900" })}>
            New Project
          </h2>
          <button
            onClick={onClose}
            className={css({
              p: "2",
              color: "gray.400",
              borderRadius: "lg",
              cursor: "pointer",
              _hover: { bg: "gray.100", color: "gray.600" },
            })}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={css({ p: "5" })}>
          <label
            className={css({
              display: "block",
              fontSize: "sm",
              fontWeight: "medium",
              color: "gray.700",
              mb: "2",
            })}
          >
            Property Address
          </label>
          <AddressSearch
            value={address}
            onChange={setAddress}
            onSelect={setSelectedLocation}
            placeholder="Start typing an address..."
            autoFocus
          />

          {selectedLocation && (
            <div
              className={css({
                mt: "4",
                p: "3",
                bg: "green.50",
                borderRadius: "lg",
                border: "1px solid",
                borderColor: "green.200",
              })}
            >
              <div className={css({ fontSize: "sm", fontWeight: "medium", color: "green.800" })}>
                Location selected
              </div>
              <div className={css({ fontSize: "xs", color: "green.600", mt: "1" })}>
                {selectedLocation.address}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={css({
            display: "flex",
            gap: "3",
            px: "5",
            py: "4",
            borderTop: "1px solid",
            borderColor: "gray.100",
            bg: "gray.50",
          })}
        >
          <button
            onClick={onClose}
            className={css({
              flex: 1,
              py: "3",
              fontSize: "sm",
              fontWeight: "medium",
              color: "gray.700",
              bg: "white",
              border: "1px solid",
              borderColor: "gray.300",
              borderRadius: "lg",
              cursor: "pointer",
              _hover: { bg: "gray.50" },
            })}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedLocation || isCreating}
            className={css({
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2",
              py: "3",
              fontSize: "sm",
              fontWeight: "semibold",
              color: "white",
              bg: "blue.500",
              borderRadius: "lg",
              cursor: "pointer",
              _hover: { bg: "blue.600" },
              _disabled: { opacity: 0.5, cursor: "not-allowed" },
            })}
          >
            {isCreating ? (
              <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
            ) : (
              <MapPin size={18} />
            )}
            {isCreating ? "Opening..." : "Open in Designer"}
          </button>
        </div>

        {/* Safe area */}
        <div className={css({ height: "env(safe-area-inset-bottom)" })} />
      </div>
    </>
  )
}
