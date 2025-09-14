'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createProject } from '@/lib/actions'
import { ProjectForm, ProjectFormData } from '@/components/projects/project-form'
import { toast } from 'sonner'

interface AddProjectDialogProps {
  onProjectAdded?: () => void
}

export function AddProjectDialog({ onProjectAdded }: AddProjectDialogProps) {
  const { user } = useUser()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [formData, setFormData] = React.useState<ProjectFormData>({
    name: '',
    description: '',
    types: [],
    status: 'active'
  })

  const handleSubmit = async () => {
    setError(null)
    setSuccess(false)
    
    if (!user?.id) {
      setError('Please sign in to create a project')
      return
    }

    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    if (formData.types.length === 0) {
      setError('Please select at least one project type')
      return
    }

    setLoading(true)
    try {
      const result = await createProject({
        name: formData.name,
        description: formData.description,
        type: formData.types.join(','), // Join array into comma-separated string
        status: formData.status,
        userId: user.id
      })

      if (!result.success) {
        setError(result.error || 'Failed to create project')
        return
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        types: [],
        status: 'active'
      })
      
      setSuccess(true)
      onProjectAdded?.()
      toast.success('Project created successfully!')
      
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 1500)
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setError(null)
    setSuccess(false)
    setFormData({
      name: '',
      description: '',
      types: [],
      status: 'active'
    })
  }

  const handleButtonClick = () => {
    setOpen(true)
    setError(null)
    setSuccess(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          className="flex items-center gap-2"
          onClick={handleButtonClick}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Project</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new CAD modeling and simulation project
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ProjectForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
          submitLabel="Create Project"
          error={error}
          success={success}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}