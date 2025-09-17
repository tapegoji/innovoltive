import { redirect } from 'next/navigation'
import { getSelectedProject } from '@/lib/actions'
import CanvasPageClient from './client-page'

// Force dynamic rendering for session-dependent content
export const dynamic = 'force-dynamic'

export default async function CanvasPage() {
  // Get project data from secure session
  const projectData = await getSelectedProject()
  
  // If no project is selected, redirect to projects page
  if (!projectData) {
    redirect('/my-projects')
  }
  
  // Use the actual project name from the database, not extracted from path
  return (
    <CanvasPageClient 
      projectName={projectData.projectName}
      projectHash={projectData.storagePathId}
    />
  )
}