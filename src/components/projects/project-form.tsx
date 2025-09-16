'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { types } from "@/lib/definitions"
import { useState, useEffect } from "react"
import { Project } from "@/lib/definitions"
import { useFormStatus } from 'react-dom'
import { Loader2Icon } from 'lucide-react'

type ProjectFormMode = 'create' | 'edit' | 'copy'

interface ProjectFormProps {
  mode: ProjectFormMode
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  action: (formData: FormData) => void
}

interface FormConfig {
  title: string
  description: string
  submitText: string
  loadingText: string
  showStatusField: boolean
  getDefaultName: (project?: Project) => string
}

const formConfigs: Record<ProjectFormMode, FormConfig> = {
  create: {
    title: "Create a new project",
    description: "Add your project details here. Click save when you're done.",
    submitText: "Add Project",
    loadingText: "Creating...",
    showStatusField: false,
    getDefaultName: () => "",
  },
  edit: {
    title: "Update project",
    description: "Update your project details here. Click save when you're done.",
    submitText: "Save",
    loadingText: "Saving...",
    showStatusField: true,
    getDefaultName: (project) => project?.name || "",
  },
  copy: {
    title: "Copy project",
    description: "Copy your project details here. Click copy when you're done.",
    submitText: "Copy Project",
    loadingText: "Copying...",
    showStatusField: true,
    getDefaultName: (project) => project ? `${project.name} (Copy)` : "",
  },
}

export function ProjectForm({ mode, open, onOpenChange, project, action }: ProjectFormProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const config = formConfigs[mode]

  // Initialize selected types when project changes
  useEffect(() => {
    if (project && project.type) {
      const projectTypes = project.type.split(',').map(t => t.trim())
      setSelectedTypes(projectTypes)
    } else if (mode === 'create') {
      setSelectedTypes([])
    }
  }, [project, mode])

  const now = new Date()
  const clientTime = now.toString()

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {pending ? config.loadingText : config.submitText}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[425px]">
        <form action={action}>
          <input type="hidden" name="clientTime" value={clientTime} />
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>
              {config.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Project name" 
                defaultValue={config.getDefaultName(project)}
                required
                autoFocus={false}
              />
            </div>
            <div className="grid gap-3">
              <Label>Type (select multiple)</Label>
              <div className="flex flex-col gap-2">
                {types.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      name="type"
                      value={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type.value])
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type.value))
                        }
                      }}
                    />
                    <Label htmlFor={type.value}>{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            {config.showStatusField && (
              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={project?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Project description"
                defaultValue={project?.description || ""}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}