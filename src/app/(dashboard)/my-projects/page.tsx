'use client'

import React from 'react'
import Link from 'next/link'
import { IconFolder } from '@tabler/icons-react'
import { FileExplorer, FileItem } from '@/components/file-explorer'
import { useUser } from '@clerk/nextjs'

const projects: FileItem[] = [
  { id: "1", name: "Electromagnetic Analysis", type: "em", description: "3D electromagnetic field simulation and modeling", dateModified: "2 hours ago", size: "15.2 MB", status: "active" },
  { id: "2", name: "Heat Transfer Study", type: "ht", description: "Thermal analysis and heat dissipation modeling", dateModified: "1 day ago", size: "8.7 MB", status: "completed" },
  { id: "3", name: "CFD Simulation Model", type: "cfd", description: "Computational fluid dynamics analysis", dateModified: "3 days ago", size: "42.1 MB", status: "active" },
  { id: "4", name: "Multiphysics Analysis", type: "mp", description: "Combined electromagnetic and thermal simulation", dateModified: "1 week ago", size: "6.3 MB", status: "paused" },
  { id: "5", name: "EM Motor Design", type: "em", description: "Electric motor electromagnetic optimization", dateModified: "2 weeks ago", size: "12.8 MB", status: "archived" },
  { id: "6", name: "Cooling System CFD", type: "cfd", description: "Airflow and cooling system optimization", dateModified: "3 weeks ago", size: "28.4 MB", status: "completed" }
]

export default function MyProjectsPage() {
  const { user } = useUser()
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Projects</h1>
        <p className="text-muted-foreground">Please sign in to view your projects</p>
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
  )
}