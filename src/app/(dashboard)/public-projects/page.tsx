import { publicProjectColumns } from "@/components/public-projects/columns"
import { PublicProjectsDataTable } from "@/components/public-projects/public-projects-data-table"
import { fetchPublicProjects, DatabaseError } from '@/lib/data_db'
import { ProjectData } from '@/lib/data_db'

export default async function PublicProjectsPage() {
  let projects: ProjectData[] = []
  let error: string | null = null

  try {
    // Fetch public projects using direct PostgreSQL formatted for data table
    projects = await fetchPublicProjects()
  } catch (err) {
    console.error('Failed to fetch public projects:', err)
    if (err instanceof DatabaseError) {
      error = err.message
    } else {
      error = 'An unexpected error occurred. Please try again later.'
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Public Projects</h1>
          <p className="text-muted-foreground">
          </p>
        </div>
      </div>    
      
      {error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Failed to load public projects: {error}
          </p>
        </div>
      ) : (
        <PublicProjectsDataTable columns={publicProjectColumns} data={projects} />
      )}
    </main>
  )
}