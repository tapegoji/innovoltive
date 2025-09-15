import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { columns, projects } from "@/components/data-table/columns"
import { DataTable } from "@/components/data-table/data-table"
import { fetchUserProjects, DatabaseError } from '@/lib/data_sql2'
import { ProjectData } from '@/lib/data_sql'

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
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={projects} />
    </div>
  )
}