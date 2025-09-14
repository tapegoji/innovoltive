import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchUserProjects, formatProjectsForDisplay } from '@/lib/data'
import { MyProjectsClient } from '@/components/my-projects-client'
import { ProjectData } from '@/components/projects-data-table'

export default async function MyProjectsPage() {
  // Get authenticated user from server
  const { userId } = await auth()
  const user = await currentUser()

  // Redirect to sign-in if not authenticated
  if (!userId || !user) {
    redirect('/sign-in')
  }

  // Fetch projects on the server
  const projects = await fetchUserProjects(userId)
  
  // Format projects for display
  const userName = user.firstName ? `${user.firstName}'s` : 'My'
  const formattedProjects = formatProjectsForDisplay(projects, 
    user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || 'Unknown User'
  )

  return <MyProjectsClient 
    projects={formattedProjects as ProjectData[]} 
    userName={userName}
    userId={userId}
  />
}