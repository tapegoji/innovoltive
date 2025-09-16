'use client'

import { editProject } from "@/lib/actions"
import { Project } from "@/lib/definitions"
import { ProjectForm } from "./project-form"

interface EditProjectProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProject({ project, open, onOpenChange }: EditProjectProps) {
  const handleAction = (formData: FormData) => {
    return editProject(project.id, formData)
  }

  return (
    <ProjectForm
      mode="edit"
      open={open}
      onOpenChange={onOpenChange}
      project={project}
      action={handleAction}
    />
  )
}
