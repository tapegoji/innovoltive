'use client'

import React from 'react'
import Link from 'next/link'
import { IconFolder } from '@tabler/icons-react'
import { FileExplorer, FileItem } from '@/components/file-explorer'
import { AddProjectDialog } from '@/components/add-project-dialog'

interface MyProjectsClientProps {
  projects: FileItem[]
  userName: string
  onProjectAdded?: () => void
}

export function MyProjectsClient({ projects, userName, onProjectAdded }: MyProjectsClientProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{userName} Projects</h1>
        </div>
        <AddProjectDialog onProjectAdded={onProjectAdded || (() => window.location.reload())} />
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