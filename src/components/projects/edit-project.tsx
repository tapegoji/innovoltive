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
import { updateProject } from "@/lib/actions"
import { Project } from "@/lib/definitions"

interface EditProjectProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProject({ project, open, onOpenChange }: EditProjectProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  // Initialize selected types when project changes
  useEffect(() => {
    if (project && project.type) {
      const projectTypes = project.type.split(',').map(t => t.trim())
      setSelectedTypes(projectTypes)
    }
  }, [project])

  const now = new Date()
  const clientTime = now.toString()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={updateProject.bind(null, project.id)}>
          <input type="hidden" name="clientTime" value={clientTime} />
          <DialogHeader>
            <DialogTitle>Update project</DialogTitle>
            <DialogDescription>
              Update your project details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Project name" 
                defaultValue={project.name}
                required 
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
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Project description"
                defaultValue={project.description}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
