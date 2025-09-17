import { redirect } from 'next/navigation'
import { getSelectedProject } from '@/lib/actions'
import CanvasPageClient from './client-page'

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
      projectHash={projectData.storagePathId}
      projectName={projectData.projectName}
    />
  )
}