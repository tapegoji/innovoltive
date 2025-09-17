import { redirect } from 'next/navigation'
import { getSelectedProject } from '@/lib/actions'
import Canvas from './canvas'

// Force dynamic rendering for session-dependent content
export const dynamic = 'force-dynamic'

export default async function CanvasPage() {
  // Get project data from secure session
  const projectData = await getSelectedProject()
  
  // If no project is selected, redirect to projects page
  if (!projectData) {
    redirect('/my-projects')
  }
  
  // Map the project data to the expected format
  const canvasProjectData = {
    projectName: projectData.projectName,
    projectHash: projectData.storagePathId, // Map storagePathId to projectHash
    simType: projectData.simType
  }
  
  return (
      <Canvas 
        projectData={canvasProjectData}
      />
  )
}
