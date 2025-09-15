// import { ProjectsDataTable } from '@/components/projects/projects-data'
// import { getPublicProjects } from '@/lib/actions'
// import { currentUser } from '@clerk/nextjs/server'

export default async function DemoProjectsPage() {
  // const user = await currentUser()
  // const result = await getPublicProjects()

  return (
    <div className="container mx-auto p-6">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Demo Projects</h1>
        <p className="text-muted-foreground mt-2">
          Explore public CAD projects and simulation examples shared by the community
        </p>
      </div>

      {result.success ? (
        // <ProjectsDataTable 
        //   data={result.projects || []}
        //   userId={user?.id || ''} 
        //   isPublicView={true}
        // />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Failed to load public projects: {result.error}
          </p>
        </div>
      )} */}
    </div>
  )
}