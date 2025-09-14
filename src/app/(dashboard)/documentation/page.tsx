'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  IconBook, 
  IconRocket, 
  IconSettings, 
  IconShare, 
  IconCopy, 
  IconTrash, 
  IconArchive, 
  IconAtom, 
  IconEdit, 
  IconGlobe, 
  IconUsers, 
  IconEye,
  IconUser,
  IconDevices,
  IconPlus,
  IconList,
  IconGrid3x3,
  IconChevronRight,
  IconChevronLeft,
  IconMenu2
} from '@tabler/icons-react'
import { useSearchParams, useRouter } from 'next/navigation'

// Define sections
const sections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: IconBook,
    description: 'Table of contents and guide overview'
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: IconRocket,
    description: 'Create your first project and understand simulation types'
  },
  {
    id: 'project-management',
    title: 'Project Management',
    icon: IconSettings,
    description: 'Navigate, edit, and duplicate projects'
  },
  {
    id: 'sharing-collaboration',
    title: 'Sharing & Collaboration',
    icon: IconShare,
    description: 'Share projects privately or make them public'
  },
  {
    id: 'project-organization',
    title: 'Project Organization',
    icon: IconArchive,
    description: 'Organize projects with statuses and archiving'
  },
  {
    id: 'canvas-workspace',
    title: '3D Canvas Workspace',
    icon: IconDevices,
    description: 'Work with the 3D modeling environment'
  },
  {
    id: 'quick-reference',
    title: 'Quick Reference',
    icon: IconMenu2,
    description: 'Common actions and shortcuts'
  }
]

export default function DocumentationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlSection = searchParams.get('section')
  
  const [currentSection, setCurrentSection] = React.useState(urlSection || 'overview')
  
  // Update URL when section changes
  const updateSection = (sectionId: string) => {
    setCurrentSection(sectionId)
    if (sectionId === 'overview') {
      router.push('/documentation')
    } else {
      router.push(`/documentation?section=${sectionId}`)
    }
  }
  
  // Update state when URL changes
  React.useEffect(() => {
    setCurrentSection(urlSection || 'overview')
  }, [urlSection])
  
  const currentIndex = sections.findIndex(s => s.id === currentSection)
  const canGoBack = currentIndex > 0
  const canGoNext = currentIndex < sections.length - 1

  const handlePrevious = () => {
    if (canGoBack) {
      updateSection(sections[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      updateSection(sections[currentIndex + 1].id)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">User Guide</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Complete guide to using the CAD modeling and simulation platform. Navigate through sections using the cards below or the navigation buttons.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.slice(1).map((section) => {
          const IconComponent = section.icon
          return (
            <Card 
              key={section.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20"
              onClick={() => updateSection(section.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Quick Start</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          New to the platform? Start with <strong>"Getting Started"</strong> to create your first project, 
          then explore <strong>"Project Management"</strong> to learn essential operations.
        </p>
      </div>
    </div>
  )

  const renderGettingStarted = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IconRocket className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Getting Started</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPlus className="h-5 w-5" />
              Creating Your First Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Navigate to My Projects</h4>
              <p className="text-sm text-muted-foreground">
                From the dashboard, click on "My Projects" to access your personal workspace.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Click "New Project"</h4>
              <p className="text-sm text-muted-foreground">
                Click the blue "New Project" button to open the project creation dialog.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. Fill Project Details</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enter a descriptive project name</li>
                <li>• Add an optional description</li>
                <li>• Select project type(s) - see simulation types below</li>
                <li>• Choose project status (Active, Completed, Paused, Archived)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">4. Start Modeling</h4>
              <p className="text-sm text-muted-foreground">
                Once created, click on your project name to open the 3D canvas workspace.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconAtom className="h-5 w-5" />
              Simulation Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-blue-600 border-blue-200">EM</Badge>
                <span className="font-medium">Electromagnetic</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Electromagnetic field simulation and modeling for antenna design, RF circuits, and EMI/EMC analysis.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-red-600 border-red-200">HT</Badge>
                <span className="font-medium">Heat Transfer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Thermal analysis and heat dissipation modeling for component cooling and thermal management.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-green-600 border-green-200">CFD</Badge>
                <span className="font-medium">CFD Simulation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Computational fluid dynamics analysis for airflow, pressure, and fluid behavior studies.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Pro Tip:</strong> You can select multiple simulation types for comprehensive multi-physics analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderProjectManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IconSettings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Project Management</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconDevices className="h-5 w-5" />
              Project Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">View Modes</h4>
              <div className="flex items-center gap-2 mb-2">
                <IconList className="h-4 w-4" />
                <span className="text-sm">List View - Detailed table format</span>
              </div>
              <div className="flex items-center gap-2">
                <IconGrid3x3 className="h-4 w-4" />
                <span className="text-sm">Grid View - Card-based layout</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Opening Projects</h4>
              <p className="text-sm text-muted-foreground">
                Click on any project name to open it in the 3D canvas workspace for modeling and simulation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconEdit className="h-5 w-5" />
              Editing Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Edit Project Details</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Click the three-dot menu (⋮) next to any project and select "Edit" to modify:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Project name and description</li>
                <li>• Simulation types (EM, HT, CFD)</li>
                <li>• Project status</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCopy className="h-5 w-5" />
              Duplicating Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Create Copies</h4>
              <p className="text-sm text-muted-foreground">
                From the project menu, select "Duplicate" to create an exact copy of your project with all settings and geometry.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Copy Public Projects</h4>
              <p className="text-sm text-muted-foreground">
                In "Demo Projects", use the "Copy to My Projects" button to add public projects to your workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSharingCollaboration = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IconShare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Sharing & Collaboration</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Private Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Share with Specific Users</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li>1. Click the menu (⋮) next to your project</li>
                <li>2. Select "Share" from the dropdown</li>
                <li>3. Enter email addresses of users to share with</li>
                <li>4. Choose permissions for each user:</li>
              </ol>
              
              <div className="ml-6 mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <IconEye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm"><strong>Viewer:</strong> Can view and copy the project</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconEdit className="h-4 w-4 text-green-500" />
                  <span className="text-sm"><strong>Editor:</strong> Can view, edit, and modify the project</span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Users must have accounts on the platform to receive shared projects.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconGlobe className="h-5 w-5" />
              Public Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Make Project Public</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li>1. Open the Share dialog for your project</li>
                <li>2. Select "Make public" from the dropdown</li>
                <li>3. Confirm that you want to make it publicly accessible</li>
                <li>4. Click "Share Project" to apply changes</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Public Project Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Appears in the "Demo Projects" section</li>
                <li>• Accessible to anyone with the link</li>
                <li>• Others can copy it to their workspace</li>
                <li>• Great for showcasing your work</li>
              </ul>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Tip:</strong> Public projects are read-only for others. They can copy but not modify your original.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderProjectOrganization = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IconArchive className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Project Organization</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
              <span className="text-sm">Status Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                <span className="text-sm">Currently working on</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600 border-blue-200">Completed</Badge>
                <span className="text-sm">Finished projects</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">Paused</Badge>
                <span className="text-sm">Temporarily on hold</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-gray-600 border-gray-200">Archived</Badge>
                <span className="text-sm">Long-term storage</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconArchive className="h-5 w-5" />
              Archiving Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Archive Old Projects</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use the "Archive" option in the project menu to move completed or unused projects to archived status.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keeps workspace organized</li>
                <li>• Projects remain accessible</li>
                <li>• Can be reactivated anytime</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrash className="h-5 w-5" />
              Deleting Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Permanent Deletion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use the "Delete" option carefully - this action cannot be undone.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Bulk Operations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select multiple projects using checkboxes</li>
                <li>• Use "Delete (X)" button for bulk deletion</li>
                <li>• Confirm deletion in the dialog</li>
              </ul>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> Deleted projects cannot be recovered. Consider archiving instead.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCanvasWorkspace = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IconDevices className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">3D Canvas Workspace</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconDevices className="h-5 w-5" />
              Canvas Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">3D Viewport</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Interactive 3D modeling environment</li>
                <li>• Orbit controls for camera navigation</li>
                <li>• Gizmo viewport for orientation reference</li>
                <li>• Real-time geometry visualization</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Control Panel</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Draggable and resizable panel</li>
                <li>• Geometry creation tools</li>
                <li>• Mesh generation controls</li>
                <li>• Simulation parameters</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Demo Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Explore Examples</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Visit the "Demo Projects" section to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Browse public projects from other users</li>
                <li>• Learn from example simulations</li>
                <li>• Copy projects to your workspace</li>
                <li>• Get inspiration for your own work</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Learning Resource</h4>
              <p className="text-sm text-muted-foreground">
                Demo projects serve as excellent learning materials to understand different simulation setups and modeling techniques.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderQuickReference = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IconMenu2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Quick Reference</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Common Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Project Creation</h4>
              <div className="text-sm text-muted-foreground">
                My Projects <IconChevronRight className="inline h-3 w-3 mx-1" /> New Project
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Open Project</h4>
              <div className="text-sm text-muted-foreground">
                Click project name in list/grid view
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Share Project</h4>
              <div className="text-sm text-muted-foreground">
                Project Menu (⋮) <IconChevronRight className="inline h-3 w-3 mx-1" /> Share
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Duplicate Project</h4>
              <div className="text-sm text-muted-foreground">
                Project Menu (⋮) <IconChevronRight className="inline h-3 w-3 mx-1" /> Duplicate
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Archive Project</h4>
              <div className="text-sm text-muted-foreground">
                Project Menu (⋮) <IconChevronRight className="inline h-3 w-3 mx-1" /> Archive
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Copy Demo Project</h4>
              <div className="text-sm text-muted-foreground">
                Demo Projects <IconChevronRight className="inline h-3 w-3 mx-1" /> Copy to My Projects
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'overview':
        return renderOverview()
      case 'getting-started':
        return renderGettingStarted()
      case 'project-management':
        return renderProjectManagement()
      case 'sharing-collaboration':
        return renderSharingCollaboration()
      case 'project-organization':
        return renderProjectOrganization()
      case 'canvas-workspace':
        return renderCanvasWorkspace()
      case 'quick-reference':
        return renderQuickReference()
      default:
        return renderOverview()
    }
  }

  const currentSectionData = sections.find(s => s.id === currentSection)

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <IconBook className="h-4 w-4" />
          <span>Documentation</span>
          <IconChevronRight className="h-3 w-3" />
          <span className="text-foreground">{currentSectionData?.title}</span>
        </div>
        
        {currentSection !== 'overview' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => updateSection('overview')}
            className="mb-4"
          >
            <IconChevronLeft className="h-4 w-4 mr-1" />
            Back to Contents
          </Button>
        )}
      </div>

      {/* Current section content */}
      <div className="min-h-[400px]">
        {renderCurrentSection()}
      </div>

      {/* Navigation buttons */}
      {currentSection !== 'overview' && (
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={!canGoBack}
            className="flex items-center gap-2"
          >
            <IconChevronLeft className="h-4 w-4" />
            {canGoBack ? sections[currentIndex - 1].title : 'Previous'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => updateSection('overview')}
          >
            Table of Contents
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNext} 
            disabled={!canGoNext}
            className="flex items-center gap-2"
          >
            {canGoNext ? sections[currentIndex + 1].title : 'Next'}
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}