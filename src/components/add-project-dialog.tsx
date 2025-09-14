'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createProject } from '@/lib/actions'

interface AddProjectDialogProps {
  onProjectAdded?: () => void
}

export function AddProjectDialog({ onProjectAdded }: AddProjectDialogProps) {
  const { user } = useUser()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    types: [] as string[], // Changed to array for multiple selections
    status: 'active' as 'active' | 'completed' | 'paused' | 'archived'
  })

  const projectTypes = [
    { value: 'em', label: 'Electromagnetic (EM)', description: 'Electromagnetic field simulation and modeling' },
    { value: 'ht', label: 'Heat Transfer (HT)', description: 'Thermal analysis and heat dissipation modeling' },
    { value: 'cfd', label: 'CFD Simulation', description: 'Computational fluid dynamics analysis' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        types: [], // Reset to empty array
        status: 'active'
      })
      
      setSuccess(true)
      onProjectAdded?.()
      
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

  const handleButtonClick = () => {
    setOpen(true)
    setError(null)
    setSuccess(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2"
          onClick={handleButtonClick}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new CAD modeling and simulation project
          </DialogDescription>
        </DialogHeader>
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mb-4">
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">
              Project created successfully!
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
            <label htmlFor="name" className="text-sm font-medium">
              Project Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
              required
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your project"
              disabled={loading || success}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Project Type * (Select one or more)</label>
            <div className="space-y-2">
              {projectTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={type.value}
                    name="type"
                    value={type.value}
                    checked={formData.types.includes(type.value)}
                    onChange={(e) => {
                      const { checked, value } = e.target
                      setFormData(prev => ({
                        ...prev,
                        types: checked 
                          ? [...prev.types, value]
                          : prev.types.filter(t => t !== value)
                      }))
                    }}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    disabled={loading || success}
                  />
                  <label htmlFor={type.value} className="text-sm font-medium cursor-pointer">
                    {type.label}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {type.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || success}
            >
              {loading ? 'Creating...' : success ? 'Created!' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}