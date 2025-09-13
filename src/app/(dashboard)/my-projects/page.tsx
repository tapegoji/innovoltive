'use client'

import React from 'react'
import Link from 'next/link'
import { IconFolder } from '@tabler/icons-react'
import { FileExplorer, FileItem } from '@/components/file-explorer'
import { useUser } from '@clerk/nextjs'
import { AddProjectDialog } from '@/components/add-project-dialog'
import { supabase } from '@/lib/supabase'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default function MyProjectsPage() {
  const { user } = useUser()
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")
  const [projects, setProjects] = React.useState<FileItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user?.id)
          .order('date_modified', { ascending: false })

        if (error) {
          console.error('Error fetching projects:', error)
          return
        }

        const formattedProjects: FileItem[] = data.map(project => ({
          id: project.id,
          name: project.name,
          type: project.type,
          description: project.description,
          dateModified: formatDate(project.date_modified),
          size: project.size,
          status: project.status,
          user: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'Unknown User'
        }))

        setProjects(formattedProjects)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProjects()
    }
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Projects</h1>
        <p className="text-muted-foreground">Please sign in to view your projects</p>
      </div>
    )
  }

  const userName = user?.firstName ? `${user.firstName}'s` : 'My'

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{userName} Projects</h1>
        </div>
        <AddProjectDialog onProjectAdded={() => window.location.reload()} />
      </div>
      <div className="relative flex-1">
        <FileExplorer
          items={projects}
          currentPath={[`${userName} Projects`]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          renderItemLink={(item, children) => (
            <Link href={`/canvas?project=${item.id}`}>{children}</Link>
          )}
        />
        
        {projects.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <IconFolder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground">Create your first project to get started with CAD modeling and simulation.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}