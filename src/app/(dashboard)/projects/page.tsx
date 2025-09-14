import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchUserProjectsForTable, DatabaseError } from '@/lib/data_sql'
import { ProjectTableData } from '@/lib/data_sql'
import { DataTable } from '@/components/data-table'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects | Dashboard',
  description: 'View and manage your projects in the dashboard',
}

export default async function ProjectsPage() {
  // Get authenticated user
  const { userId } = await auth()
  const user = await currentUser()

  // Redirect if not authenticated
  if (!userId || !user) {
    redirect('/sign-in')
  }

  let projects: ProjectTableData[] = []
  let error: string | null = null

  try {
    // Fetch user projects using direct PostgreSQL formatted for data table
    projects = await fetchUserProjectsForTable(userId)
  } catch (err) {
    console.error('Failed to fetch projects:', err)
    if (err instanceof DatabaseError) {
      error = err.message
    } else {
      error = 'An unexpected error occurred. Please try again later.'
    }
  }

  // If there's an error, still show the table with empty data
  if (error) {
    console.error('Error loading projects:', error)
    projects = []
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects Dashboard</h1>
      </div>

      <DataTable data={projects} />
    </main>
  )
}
