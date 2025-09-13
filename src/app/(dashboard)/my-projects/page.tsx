'use client'

import React from 'react'
import Link from 'next/link'
import { IconFolder } from '@tabler/icons-react'
import { FileExplorer, FileItem } from '@/components/file-explorer'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { Project } from '@/types/database'
import { AddProjectDialog } from '@/components/add-project-dialog'

function formatDateModified(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
  return date.toLocaleDateString()
}

function projectToFileItem(project: Project): FileItem {
  return {
    id: project.id,
    name: project.name,
    type: project.type,
    description: project.description,
    dateModified: formatDateModified(project.updated_at),
    size: project.size,
    status: project.status
  }
}

export default function MyProjectsPage() {
  const { user } = useUser()
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")
  const [projects, setProjects] = React.useState<FileItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetchProjects()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleProjectAdded = () => {
    // Refetch projects when a new one is added
    if (user?.id) {
      fetchProjects()
    }
  }

  const fetchProjects = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('Starting to fetch projects for user:', user.id)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)
      
      const { data, error: supabaseError } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      console.log('Supabase response:', { data, error: supabaseError })

      if (supabaseError) throw supabaseError

      const fileItems = (data || []).map(projectToFileItem)
      console.log('Converted to file items:', fileItems)
      setProjects(fileItems)
    } catch (err) {
      console.error('Error fetching projects:', err)
      console.error('Error details:', {
        name: (err as any)?.name,
        message: (err as any)?.message,
        code: (err as any)?.code,
        details: (err as any)?.details,
        hint: (err as any)?.hint,
        stack: (err as any)?.stack
      })
      setError(`Failed to load projects: ${(err as any)?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Projects</h1>
        <p className="text-muted-foreground">Please sign in to view your projects</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Projects</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Projects</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <IconFolder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Error loading projects</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const userName = user?.firstName ? `${user.firstName}'s` : 'My'

  return (
    <div className="h-[calc(100vh-4rem)]">
      <FileExplorer
        items={projects}
        currentPath={[`${userName} Projects`]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        toolbarActions={<AddProjectDialog onProjectAdded={handleProjectAdded} />}
        renderItemLink={(item, children) => (
          <Link href={`/canvas?project=${item.id}`}>{children}</Link>
        )}
      />
      
      {projects.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <IconFolder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Click "New Project" above to create your first CAD modeling and simulation project.</p>
          </div>
        </div>
      )}
    </div>
  )
}