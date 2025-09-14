import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { validateProjectAccess } from '@/lib/project-auth'
import CanvasClient from './canvas-client'

interface CanvasProjectPageProps {
  params: {
    projectId: string
  }
}

export default async function CanvasProjectPage({ params }: CanvasProjectPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Validate project access on server-side
  const validation = await validateProjectAccess(params.projectId, userId)
  
  if (!validation.success) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{validation.error}</p>
          <a 
            href="/my-projects"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Return to My Projects
          </a>
        </div>
      </div>
    )
  }

  // Pass the validated project ID to the client component
  return <CanvasClient projectId={params.projectId} />
}