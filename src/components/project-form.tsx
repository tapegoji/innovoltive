"use client"

import * as React from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const projectSchema = z.object({
  id: z.number(),
  header: z.string(), // Project name
  type: z.array(z.string()), // Project types (can be multiple)
  status: z.string(), // Project status
  reviewer: z.string(), // Project description
})

export type Project = z.infer<typeof projectSchema>

interface ProjectFormProps {
  project?: Project
  onSubmit: (project: Omit<Project, 'id'>) => void
  onCancel?: () => void
  isEditing?: boolean
}

export function ProjectForm({ project, onSubmit, onCancel, isEditing = false }: ProjectFormProps) {
  const [formData, setFormData] = React.useState({
    header: project?.header || '',
    type: project?.type || [],
    status: project?.status || 'Not Started',
    reviewer: project?.reviewer || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    if (onCancel) onCancel() // Close dialog after submit
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-header">Project Name</Label>
        <Input
          id="project-header"
          value={formData.header}
          onChange={(e) => setFormData(prev => ({ ...prev, header: e.target.value }))}
          placeholder="Enter project name"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Simulation Types</Label>
          <div className="space-y-3">
            {[
              { id: 'EM', label: 'Electromagnetics (EM)' },
              { id: 'HT', label: 'Heat Transfer (HT)' },
              { id: 'CFD', label: 'Computational Fluid Dynamics (CFD)' }
            ].map((simType) => (
              <div key={simType.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${simType.id}`}
                  checked={formData.type.includes(simType.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        type: [...prev.type, simType.id]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        type: prev.type.filter(t => t !== simType.id)
                      }))
                    }
                  }}
                />
                <Label
                  htmlFor={`type-${simType.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {simType.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger id="project-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="project-reviewer">Description</Label>
        <Input
          id="project-reviewer"
          value={formData.reviewer}
          onChange={(e) => setFormData(prev => ({ ...prev, reviewer: e.target.value }))}
          placeholder="Enter project description"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Project' : 'Add Project'}
        </Button>
      </DialogFooter>
    </form>
  )
}