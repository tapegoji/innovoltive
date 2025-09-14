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