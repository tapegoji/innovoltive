'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        status: formData.status,
        user_id: user.id,
        date_modified: new Date().toISOString(),
        size: '0 KB' // Default size for new projects
      }

      console.log('Creating project:', projectData)

      const { data, error } = await supabase
        .from('user_projects')
        .insert([projectData])
        .select()

      if (error) {
        console.error('Error creating project:', error)
        alert(`Failed to create project: ${error.message}`)
        return
      }

      console.log('Project created successfully:', data)
      
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
                <div className="grid grid-cols-1 gap-3">
                  {projectTypes.map((type) => (
                    <Card 
                      key={type.value}
                      className={`cursor-pointer transition-colors ${
                        formData.type === type.value 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={() => {}}
                            className="text-primary"
                          />
                          <CardTitle className="text-sm">{type.label}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-xs">
                          {type.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
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