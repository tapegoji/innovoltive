'use server'

import { getSupabaseClient } from './supabase'
import { CreateProjectData } from './data'

// SERVER ACTIONS

export async function createProject(data: CreateProjectData) {
  try {
    const supabase = getSupabaseClient()
    
    // Generate a unique ID for the project
    const projectId = crypto.randomUUID()

    const now = new Date()
    const localDateString = now.getFullYear() + '-' + 
                           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(now.getDate()).padStart(2, '0') + 'T' + 
                           String(now.getHours()).padStart(2, '0') + ':' + 
                           String(now.getMinutes()).padStart(2, '0') + ':' + 
                           String(now.getSeconds()).padStart(2, '0')

    const projectData = {
      id: projectId,
      name: data.name.trim(),
      description: data.description.trim(),
      type: data.type,
      status: data.status,
      user_id: data.userId,
      date_modified: localDateString,
      size: '0 MB' // Default size for new projects
    }

    // First, insert the project
    const { data: projectResult, error: projectError } = await supabase
      .from('projects')
      .insert([projectData])
      .select()

    if (projectError) {
      console.error('Error creating project:', projectError)
      return { success: false, error: `Failed to create project: ${projectError.message}` }
    }

    // Then, create the user-project relationship
    const userProjectData = {
      user_id: data.userId,
      project_id: projectId,
      role: 'owner'
    }

    const { error: userProjectError } = await supabase
      .from('user_projects')
      .insert([userProjectData])

    if (userProjectError) {
      console.error('Error creating user-project relationship:', userProjectError)
      // Don't fail the whole operation, but log the error
      console.warn('Project created but user association failed')
    }

    return { success: true, data: projectResult }
  } catch (error) {
    console.error('Error in createProject:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteProjects(projectIds: string[], userId: string) {
  try {
    const supabase = getSupabaseClient()
    
    // First, delete from user_projects table
    const { error: userProjectsError } = await supabase
      .from('user_projects')
      .delete()
      .in('project_id', projectIds)
      .eq('user_id', userId)

    if (userProjectsError) {
      console.error('Error deleting user-project relationships:', userProjectsError)
      return { success: false, error: `Failed to delete user-project relationships: ${userProjectsError.message}` }
    }

    // Then, delete from projects table
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .in('id', projectIds)

    if (projectsError) {
      console.error('Error deleting projects:', projectsError)
      return { success: false, error: `Failed to delete projects: ${projectsError.message}` }
    }

    return { success: true, deletedCount: projectIds.length }
  } catch (error) {
    console.error('Error in deleteProjects:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateProject(projectId: string, data: Partial<CreateProjectData>, userId: string) {
  try {
    const supabase = getSupabaseClient()
    
    // Verify user has access to this project
    const { data: userProject, error: accessError } = await supabase
      .from('user_projects')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (accessError || !userProject) {
      return { success: false, error: 'You do not have permission to edit this project' }
    }

    const now = new Date()
    const localDateString = now.getFullYear() + '-' + 
                           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(now.getDate()).padStart(2, '0') + 'T' + 
                           String(now.getHours()).padStart(2, '0') + ':' + 
                           String(now.getMinutes()).padStart(2, '0') + ':' + 
                           String(now.getSeconds()).padStart(2, '0')

    const updateData: Partial<{
      name: string;
      description: string;
      type: string;
      status: string;
      date_modified: string;
    }> = {
      date_modified: localDateString
    }

    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.type !== undefined) updateData.type = data.type
    if (data.status !== undefined) updateData.status = data.status

    const { data: projectResult, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()

    if (updateError) {
      console.error('Error updating project:', updateError)
      return { success: false, error: `Failed to update project: ${updateError.message}` }
    }

    return { success: true, data: projectResult }
  } catch (error) {
    console.error('Error in updateProject:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function duplicateProject(projectId: string, userId: string) {
  try {
    const supabase = getSupabaseClient()
    
    // First, get the original project
    const { data: originalProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (fetchError || !originalProject) {
      return { success: false, error: 'Project not found or access denied' }
    }

    // Verify user has access to this project
    const { data: userProject, error: accessError } = await supabase
      .from('user_projects')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (accessError || !userProject) {
      return { success: false, error: 'You do not have permission to duplicate this project' }
    }

    // Generate a unique ID for the duplicated project
    const newProjectId = crypto.randomUUID()

    const now = new Date()
    const localDateString = now.getFullYear() + '-' + 
                           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(now.getDate()).padStart(2, '0') + 'T' + 
                           String(now.getHours()).padStart(2, '0') + ':' + 
                           String(now.getMinutes()).padStart(2, '0') + ':' + 
                           String(now.getSeconds()).padStart(2, '0')

    const duplicatedProjectData = {
      id: newProjectId,
      name: `${originalProject.name} (Copy)`,
      description: originalProject.description,
      type: originalProject.type,
      status: 'active', // Reset status to active for new copy
      user_id: userId,
      date_modified: localDateString,
      size: originalProject.size || '0 MB'
    }

    // Insert the duplicated project
    const { data: projectResult, error: projectError } = await supabase
      .from('projects')
      .insert([duplicatedProjectData])
      .select()

    if (projectError) {
      console.error('Error duplicating project:', projectError)
      return { success: false, error: `Failed to duplicate project: ${projectError.message}` }
    }

    // Create the user-project relationship for the duplicate
    const userProjectData = {
      user_id: userId,
      project_id: newProjectId,
      role: 'owner'
    }

    const { error: userProjectError } = await supabase
      .from('user_projects')
      .insert([userProjectData])

    if (userProjectError) {
      console.error('Error creating user-project relationship for duplicate:', userProjectError)
      // Don't fail the whole operation, but log the error
      console.warn('Project duplicated but user association failed')
    }

    return { success: true, data: projectResult }
  } catch (error) {
    console.error('Error in duplicateProject:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function archiveProject(projectId: string, userId: string) {
  try {
    const supabase = getSupabaseClient()
    
    // Verify user has access to this project
    const { data: userProject, error: accessError } = await supabase
      .from('user_projects')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (accessError || !userProject) {
      return { success: false, error: 'You do not have permission to archive this project' }
    }

    const now = new Date()
    const localDateString = now.getFullYear() + '-' + 
                           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(now.getDate()).padStart(2, '0') + 'T' + 
                           String(now.getHours()).padStart(2, '0') + ':' + 
                           String(now.getMinutes()).padStart(2, '0') + ':' + 
                           String(now.getSeconds()).padStart(2, '0')

    const { data: projectResult, error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'archived',
        date_modified: localDateString
      })
      .eq('id', projectId)
      .select()

    if (updateError) {
      console.error('Error archiving project:', updateError)
      return { success: false, error: `Failed to archive project: ${updateError.message}` }
    }

    return { success: true, data: projectResult }
  } catch (error) {
    console.error('Error in archiveProject:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function shareProject(
  projectId: string, 
  shares: {
    emails: string[]
    emailRoles: Record<string, 'viewer' | 'editor'>
    isPublic: boolean
    publicRole: 'viewer' | 'editor'
    ownerId: string
  }
) {
  try {
    const supabase = getSupabaseClient()
    
    // Verify user owns this project
    const { data: userProject, error: accessError } = await supabase
      .from('user_projects')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', shares.ownerId)
      .eq('role', 'owner')
      .single()

    if (accessError || !userProject) {
      return { success: false, error: 'You do not have permission to share this project' }
    }

    // First, remove existing shares (except owner)
    const { error: deleteError } = await supabase
      .from('user_projects')
      .delete()
      .eq('project_id', projectId)
      .neq('role', 'owner')

    if (deleteError) {
      console.error('Error removing existing shares:', deleteError)
      return { success: false, error: 'Failed to update project shares' }
    }

    // Look up users by email using Clerk and add shares for existing users
    if (shares.emails.length > 0) {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const clerk = await clerkClient()
      
      for (const email of shares.emails) {
        try {
          // Check if user exists in Clerk
          const clerkUsers = await clerk.users.getUserList({
            emailAddress: [email.toLowerCase()]
          })
          
          if (clerkUsers.data.length > 0) {
            const clerkUser = clerkUsers.data[0]
            const role = shares.emailRoles[email] || 'viewer'
            
            // Add user share
            const { error: userShareError } = await supabase
              .from('user_projects')
              .insert([{
                user_id: clerkUser.id,
                project_id: projectId,
                role: role
              }])

            if (userShareError) {
              console.error('Error creating user share for', email, ':', userShareError)
              // Continue with other users even if one fails
            }
          }
          // If user doesn't exist in Clerk, silently skip (don't reveal user existence)
        } catch (clerkError) {
          console.error('Error checking user in Clerk:', clerkError)
          // Continue with other users
        }
      }
    }

    // Handle public access
    if (shares.isPublic) {
      const publicShare = {
        user_id: 'user_public',
        project_id: projectId,
        role: shares.publicRole
      }

      const { error: publicShareError } = await supabase
        .from('user_projects')
        .insert([publicShare])

      if (publicShareError) {
        console.error('Error creating public share:', publicShareError)
        return { success: false, error: 'Failed to make project public' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in shareProject:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getProjectShares(projectId: string, userId: string) {
  try {
    const supabase = getSupabaseClient()
    
    // Verify user has access to this project
    const { data: userProject, error: accessError } = await supabase
      .from('user_projects')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (accessError || !userProject) {
      return { success: false, error: 'You do not have permission to view project shares' }
    }

    // Get all shares for this project
    const { data: shares, error: sharesError } = await supabase
      .from('user_projects')
      .select('user_id, role')
      .eq('project_id', projectId)
      .neq('role', 'owner')

    if (sharesError) {
      console.error('Error getting project shares:', sharesError)
      return { success: false, error: 'Failed to load project shares' }
    }

    // Separate public and user shares
    const publicShare = shares?.find(share => share.user_id === 'user_public')
    const userShares = shares?.filter(share => share.user_id !== 'user_public') || []

    // Get user details from Clerk for user shares
    const emails: { email: string; role: 'viewer' | 'editor' }[] = []
    if (userShares.length > 0) {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const clerk = await clerkClient()
      
      for (const userShare of userShares) {
        try {
          const clerkUser = await clerk.users.getUser(userShare.user_id)
          if (clerkUser.emailAddresses.length > 0) {
            emails.push({
              email: clerkUser.emailAddresses[0].emailAddress,
              role: userShare.role as 'viewer' | 'editor'
            })
          }
        } catch (error) {
          console.error('Error getting user from Clerk:', error)
          // Skip this user if we can't get their details
        }
      }
    }

    return {
      success: true,
      emails,
      isPublic: !!publicShare,
      publicRole: publicShare?.role || 'viewer'
    }
  } catch (error) {
    console.error('Error in getProjectShares:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPublicProjects() {
  try {
    const supabase = getSupabaseClient()

    // Get all projects that have public access
    const { data: publicProjectIds, error: publicError } = await supabase
      .from('user_projects')
      .select('project_id')
      .eq('user_id', 'user_public')

    if (publicError) {
      console.error('Error getting public project IDs:', publicError)
      return { success: false, error: 'Failed to load public projects' }
    }

    if (!publicProjectIds || publicProjectIds.length === 0) {
      return { success: true, projects: [] }
    }

    // Get the actual project details for public projects
    const projectIds = publicProjectIds.map(p => p.project_id)
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .order('date_modified', { ascending: false })

    if (projectsError) {
      console.error('Error getting public projects:', projectsError)
      return { success: false, error: 'Failed to load public projects' }
    }

    // Transform projects to match the expected format
    const transformedProjects = projects?.map(project => ({
      id: project.id,
      name: project.name,
      type: project.type,
      status: project.status,
      dateModified: project.date_modified,
      description: project.description || '',
      user: 'Public'
    })) || []

    return { success: true, projects: transformedProjects }
  } catch (error) {
    console.error('Error in getPublicProjects:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}