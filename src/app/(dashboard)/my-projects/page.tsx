import { columns } from "@/components/projects/columns"
import { DataTable } from "@/components/projects/data-table"
import { fetchUserProjects } from '@/lib/actions'
import { ProjectData } from '@/lib/definitions'

export default async function Page() {
  
  let projects: ProjectData[] = []

  try {
    // Fetch user projects using direct PostgreSQL formatted for data table
    projects = await fetchUserProjects()
  } catch (err) {
    console.error('Failed to fetch projects:', err)
  }

  return (
    <main className="flex min-h-screen flex-col p-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">My Projects</h1>
      </div>    
      <DataTable columns={columns} data={projects} />
    </main>
  )
}