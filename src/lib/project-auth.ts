import { auth } from '@clerk/nextjs/server'
import { getSupabaseClient } from '@/lib/supabase'

/**
 * Verifies that a user has access to a specific project
 * @param projectId - The project ID to check
 * @param userId - The user ID to verify ownership
 * @returns Promise<boolean> - true if user has access, false otherwise
 */
export async function verifyProjectAccess(projectId: string, userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    // Check if user has access to this project (either as owner or shared user)
    const { data, error } = await supabase
      .from('user_projects')
      .select('user_id, role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.error('Project access verification failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error verifying project access:', error)
    return false
  }
}

/**
 * Higher-order function to protect project routes
 * @param handler - The route handler function
 * @returns Protected route handler
 */
export function withProjectAuth<T extends unknown[]>(
  handler: (projectId: string, userId: string, ...args: T) => Promise<unknown>
) {
  return async (projectId: string, ...args: T) => {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized: User not authenticated')
    }

    const hasAccess = await verifyProjectAccess(projectId, userId)
    if (!hasAccess) {
      throw new Error('Forbidden: User does not have access to this project')
    }

    return handler(projectId, userId, ...args)
  }
}

/**
 * Middleware for Next.js API routes to verify project access
 */
export async function requireProjectAccess(projectId: string): Promise<string> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Authentication required')
  }

  const hasAccess = await verifyProjectAccess(projectId, userId)
  if (!hasAccess) {
    throw new Error('Access denied: You do not have permission to access this project')
  }

  return userId
}

/**
 * Check if a project exists and user has access, with detailed error messages
 */
export async function validateProjectAccess(projectId: string, userId: string): Promise<{
  success: boolean
  error?: string
  projectExists?: boolean
  userHasAccess?: boolean
}> {
  try {
    const supabase = getSupabaseClient()
    
    // First check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return {
        success: false,
        error: 'Project not found',
        projectExists: false,
        userHasAccess: false
      }
    }

    // Then check if user has access
    const { data: access, error: accessError } = await supabase
      .from('user_projects')
      .select('user_id, role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (accessError || !access) {
      return {
        success: false,
        error: 'Access denied: You do not have permission to view this project',
        projectExists: true,
        userHasAccess: false
      }
    }

    return {
      success: true,
      projectExists: true,
      userHasAccess: true
    }
  } catch (error) {
    console.error('Error validating project access:', error)
    return {
      success: false,
      error: 'An error occurred while validating project access',
      projectExists: false,
      userHasAccess: false
    }
  }
}