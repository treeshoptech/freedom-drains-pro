import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects"
import { ProjectEditor } from "./project-editor"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  const { project, error } = await getProject(id)

  if (error || !project) {
    notFound()
  }

  return <ProjectEditor project={project} />
}
