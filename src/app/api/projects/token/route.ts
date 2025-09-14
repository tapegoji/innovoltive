import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { validateProjectAccess } from '@/lib/project-auth'
import { encryptProjectData } from '@/lib/project-security'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' }, 
        { status: 400 }
      )
    }

    // Validate that user has access to this project
    const validation = await validateProjectAccess(projectId, userId)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error }, 
        { status: validation.projectExists ? 403 : 404 }
      )
    }

    // Generate secure token
    const token = encryptProjectData(projectId, userId)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generating project token:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}