'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox'

export interface ProjectFormData {
  name: string
  description: string
  types: string[]
  status: 'active' | 'completed' | 'paused' | 'archived'
}

interface ProjectFormProps {
  data: ProjectFormData
  onChange: (data: ProjectFormData) => void
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
  submitLabel: string
  error?: string | null
  success?: boolean
}

const projectTypes = [
  { value: 'em', label: 'Electromagnetic (EM)', description: 'Electromagnetic field simulation and modeling' },
  { value: 'ht', label: 'Heat Transfer (HT)', description: 'Thermal analysis and heat dissipation modeling' },
  { value: 'cfd', label: 'CFD Simulation', description: 'Computational fluid dynamics analysis' },
  { value: 'folder', label: 'Folder', description: 'Organization folder for grouping projects' }
]

export function ProjectForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
  error,
  success
}: ProjectFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const handleTypeChange = (typeValue: string, checked: boolean) => {
    const newTypes = checked
      ? [...data.types, typeValue]
      : data.types.filter(t => t !== typeValue)
    
    onChange({
      ...data,
      types: newTypes
    })
  }

  return (
    <>
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mb-4">
          <p className="text-green-800 dark:text-green-200 text-sm font-medium">
            Operation completed successfully!
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm font-medium">
            {error}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="project-name">
            Project Name *
          </Label>
          <Input
            id="project-name"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Enter project name"
            required
            disabled={isLoading || success}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description">
            Description
          </Label>
          <Input
            id="project-description"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Brief description of your project"
            disabled={isLoading || success}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Project Type * (Select one or more)
          </Label>
          <div className="space-y-3">
            {projectTypes.map((type) => (
              <div key={type.value} className="flex items-start space-x-3">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={data.types.includes(type.value)}
                  onCheckedChange={(checked) => handleTypeChange(type.value, !!checked)}
                  disabled={isLoading || success}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor={`type-${type.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-status">
            Status
          </Label>
          <Select
            value={data.status}
            onValueChange={(value: ProjectFormData['status']) => onChange({ ...data, status: value })}
            disabled={isLoading || success}
          >
            <SelectTrigger id="project-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || success || !data.name.trim() || data.types.length === 0}
          >
            {isLoading ? `${submitLabel}...` : success ? 'Done!' : submitLabel}
          </Button>
        </div>
      </form>
    </>
  )
}