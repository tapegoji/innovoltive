'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

interface AddProjectDialogProps {
  onProjectAdded?: () => void
}

export function AddProjectDialog({ onProjectAdded }: AddProjectDialogProps) {
  const { user } = useUser()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    type: 'em' as 'em' | 'ht' | 'cfd' | 'mp',
    status: 'active' as 'active' | 'completed' | 'paused' | 'archived'
  })

  console.log('AddProjectDialog rendered, user:', user?.id)
  console.log('Dialog open state:', open)

  const projectTypes = [
    { value: 'em', label: 'Electromagnetic (EM)', description: 'Electromagnetic field simulation and modeling' },
    { value: 'ht', label: 'Heat Transfer (HT)', description: 'Thermal analysis and heat dissipation modeling' },
    { value: 'cfd', label: 'CFD Simulation', description: 'Computational fluid dynamics analysis' },
    { value: 'mp', label: 'Multiphysics (MP)', description: 'Combined electromagnetic and thermal simulation' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      alert('Please sign in to create a project')
      return
    }

    if (!formData.name.trim()) {
      alert('Project name is required')
      return
    }

    setLoading(true)
    try {
      // Generate a unique ID for the project
      const projectId = crypto.randomUUID()

      const projectData = {
        id: projectId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        user_id: user.id,
        date_modified: new Date().toISOString(),
        size: '0 MB' // Default size for new projects
      }

      console.log('Creating project:', projectData)

      // First, insert the project
      const { data: projectResult, error: projectError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()

      if (projectError) {
        console.error('Error creating project:', projectError)
        alert(`Failed to create project: ${projectError.message}`)
        return
      }

      console.log('Project created successfully:', projectResult)

      // Then, create the user-project relationship
      const userProjectData = {
        user_id: user.id,
        project_id: projectId,
        role: 'owner'
      }

      const { data: userProjectResult, error: userProjectError } = await supabase
        .from('user_projects')
        .insert([userProjectData])

      if (userProjectError) {
        console.error('Error creating user-project relationship:', userProjectError)
        // Don't fail the whole operation, but log the error
        console.warn('Project created but user association failed')
      } else {
        console.log('User-project relationship created:', userProjectResult)
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'em',
        status: 'active'
      })
      
      setOpen(false)
      onProjectAdded?.()
      
    } catch (err) {
      console.error('Error creating project:', err)
      alert('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = () => {
    console.log('New Project button clicked!')
    console.log('Current open state:', open)
    setOpen(true)
    console.log('Setting open to: true')
  }

  return (
    <>
      <Button 
        className="flex items-center gap-2"
        onClick={handleButtonClick}
      >
        <Plus className="h-4 w-4" />
        New Project
      </Button>
      
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Create New Project</h2>
              <p className="text-muted-foreground">Create a new CAD modeling and simulation project</p>
            </div>
            
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
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Project Type *</label>
                <div className="space-y-2">
                  {projectTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type.value}
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, type: type.value as any }))
                          }
                        }}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
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

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}