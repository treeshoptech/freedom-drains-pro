import Link from "next/link"
import { css } from "styled-system/css"
import { listProjects } from "@/lib/actions/projects"
import { Plus, MapPin, Calendar, DollarSign } from "lucide-react"

export default async function ProjectsPage() {
  const { projects, error } = await listProjects()

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
          px: "6",
          py: "4",
        })}
      >
        <div
          className={css({
            maxWidth: "1200px",
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <h1
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              color: "gray.900",
            })}
          >
            Projects
          </h1>
          <Link
            href="/"
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
              textDecoration: "none",
              _hover: { bg: "blue.600" },
            })}
          >
            <Plus size={18} />
            New Project
          </Link>
        </div>
      </header>

      {/* Content */}
      <main
        className={css({
          maxWidth: "1200px",
          mx: "auto",
          px: "6",
          py: "8",
        })}
      >
        {error ? (
          <div
            className={css({
              bg: "red.50",
              color: "red.700",
              px: "4",
              py: "3",
              borderRadius: "lg",
            })}
          >
            Error loading projects: {error}
          </div>
        ) : !projects || projects.length === 0 ? (
          <div
            className={css({
              textAlign: "center",
              py: "16",
            })}
          >
            <p
              className={css({
                fontSize: "lg",
                color: "gray.500",
                mb: "4",
              })}
            >
              No projects yet
            </p>
            <Link
              href="/"
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "2",
                px: "4",
                py: "2",
                bg: "blue.500",
                color: "white",
                borderRadius: "lg",
                fontSize: "sm",
                fontWeight: "medium",
                textDecoration: "none",
                _hover: { bg: "blue.600" },
              })}
            >
              <Plus size={18} />
              Create your first project
            </Link>
          </div>
        ) : (
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "4",
            })}
          >
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={css({
                  display: "block",
                  bg: "white",
                  borderRadius: "lg",
                  border: "1px solid",
                  borderColor: "gray.200",
                  p: "4",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  _hover: {
                    borderColor: "blue.300",
                    shadow: "md",
                  },
                })}
              >
                <div
                  className={css({
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: "3",
                  })}
                >
                  <h2
                    className={css({
                      fontSize: "lg",
                      fontWeight: "semibold",
                      color: "gray.900",
                    })}
                  >
                    {project.name}
                  </h2>
                  <StatusBadge status={project.status} />
                </div>

                <div
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "2",
                    color: "gray.500",
                    fontSize: "sm",
                    mb: "2",
                  })}
                >
                  <MapPin size={14} />
                  <span className={css({ color: "gray.600" })}>
                    {project.address}
                  </span>
                </div>

                <div
                  className={css({
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: "4",
                    pt: "3",
                    borderTop: "1px solid",
                    borderColor: "gray.100",
                  })}
                >
                  <div
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "1",
                      color: "gray.500",
                      fontSize: "xs",
                    })}
                  >
                    <Calendar size={12} />
                    {formatDate(project.updated_at)}
                  </div>
                  <div
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "1",
                      color: "blue.600",
                      fontWeight: "semibold",
                      fontSize: "lg",
                    })}
                  >
                    <DollarSign size={16} />
                    {project.total_cost.toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft: { bg: "gray.100", color: "gray.600" },
    quoted: { bg: "blue.100", color: "blue.700" },
    approved: { bg: "green.100", color: "green.700" },
    completed: { bg: "purple.100", color: "purple.700" },
  }

  const { bg, color } = colors[status] || colors.draft

  return (
    <span
      className={css({
        px: "2",
        py: "0.5",
        borderRadius: "full",
        fontSize: "xs",
        fontWeight: "medium",
        textTransform: "capitalize",
        bg,
        color,
      })}
    >
      {status}
    </span>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
