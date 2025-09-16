import { columns } from "@/components/projects/columns"
import { DataTable } from "@/components/projects/data-table"
import { fetchPublicProjects } from '@/lib/actions'
import { ProjectData, DatabaseError } from '@/lib/definitions'

export default async function Page() {
  
  let projects: ProjectData[] = []
  let error: string | null = null

  try {
    // Fetch public projects using direct PostgreSQL formatted for data table
    projects = await fetchPublicProjects()
  } catch (err) {
    console.error('Failed to fetch projects:', err)
    if (err instanceof DatabaseError) {
      error = err.message
    } else {
      error = 'An unexpected error occurred. Please try again later.'
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Public Projects</h1>
      </div>    
      <DataTable columns={columns} data={projects} />
    </main>
  )
}