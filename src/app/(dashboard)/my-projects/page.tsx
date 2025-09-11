import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconFolder, IconExternalLink } from '@tabler/icons-react'
import { currentUser } from '@clerk/nextjs/server'

const projects = [
  {
    id: 1,
    title: "Project 1",
    description: "3D CAD modeling and simulation workspace",
    link: "/canvas",
    icon: IconFolder,
    status: "Active",
    lastModified: "2 hours ago"
  }
]

export default async function MyProjectsPage() {
  const user = await currentUser()
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground mt-2">
            Please sign in to view your projects
          </p>
        </div>
      </div>
    )
  }

  const userName = user?.firstName ? `${user.firstName}'s` : 'My'

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{userName} Projects</h1>
        <p className="text-muted-foreground mt-2">
          Manage and access your CAD projects and simulations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <project.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                </div>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {project.status}
                </span>
              </div>
              <CardDescription className="mt-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last modified: {project.lastModified}
                </span>
                <Link href={project.link}>
                  <Button variant="default" size="sm" className="flex items-center space-x-2">
                    <span>Open</span>
                    <IconExternalLink size={16} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <IconFolder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground">
            Create your first project to get started with CAD modeling and simulation.
          </p>
        </div>
      )}
    </div>
  )
}