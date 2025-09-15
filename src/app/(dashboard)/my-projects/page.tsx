import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { columns } from "@/components/data-table/columns"
import { DataTable } from "@/components/data-table/data-table"
import { fetchUserProjects, DatabaseError } from '@/lib/data_db'
import { ProjectData } from '@/lib/data_db'

export default async function Page() {
  
    // Get authenticated user
  const { userId } = await auth()
  const user = await currentUser()

  // Redirect if not authenticated
  if (!userId || !user) {
    redirect('/sign-in')
  }

  let projects: ProjectData[] = []
  let error: string | null = null

  try {
    // Fetch user projects using direct PostgreSQL formatted for data table
    projects = await fetchUserProjects(userId)
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
        <h1 className="text-xl font-bold">My Projects</h1>
      </div>    
      <DataTable columns={columns} data={projects} />
    </main>
  )
}