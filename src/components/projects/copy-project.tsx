'use client'

import { copyProject } from "@/lib/actions"
import { Project } from "@/lib/definitions"
import { ProjectForm } from "./project-form"

interface CopyProjectProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CopyProject({ project, open, onOpenChange }: CopyProjectProps) {
  const handleAction = (formData: FormData) => {
    return copyProject(project.id, formData)
  }

  return (
    <ProjectForm
      mode="copy"
      open={open}
      onOpenChange={onOpenChange}
      project={project}
      action={handleAction}
    />
  )
}
