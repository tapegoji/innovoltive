import { columns } from "@/components/projects/columns"
import { DataTable } from "@/components/projects/data-table"
import { fetchPublicProjects } from '@/lib/actions'
import { ProjectData } from '@/lib/definitions'

// Force dynamic rendering for authentication-dependent content
export const dynamic = 'force-dynamic'

export default async function Page() {
  
  let projects: ProjectData[] = []

  try {
    // Fetch public projects using direct PostgreSQL formatted for data table
    projects = await fetchPublicProjects()
  } catch (err) {
    console.error('Failed to fetch projects:', err)
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