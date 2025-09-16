'use client'

import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { createProject } from "@/lib/actions"
import { ProjectForm } from "./project-form"

export function CreateNewProject() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="default" size="sm" onClick={() => setIsOpen(true)}>
        <IconPlus />
        <span className="hidden lg:inline">Create Project</span>
      </Button>
      <ProjectForm
        mode="create"
        open={isOpen}
        onOpenChange={setIsOpen}
        action={createProject}
      />
    </>
  )
}
