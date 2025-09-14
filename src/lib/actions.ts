'use server'

import { getSupabaseClient } from './supabase'

export interface CreateProjectData {
  name: string
  description: string
  type: 'em' | 'ht' | 'cfd' | 'mp'
  status: 'active' | 'completed' | 'paused' | 'archived'
  userId: string
}

export async function createProject(data: CreateProjectData) {
  try {
    const supabase = getSupabaseClient()
    
    // Generate a unique ID for the project
    const projectId = crypto.randomUUID()

    const projectData = {
      id: projectId,
      name: data.name.trim(),
      description: data.description.trim(),
      type: data.type,
      status: data.status,
      user_id: data.userId,
      date_modified: new Date().toISOString(),
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

export async function getUserProjects(userId: string) {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_projects')
      .select(`
        project_id,
        role,
        projects (
          id,
          name,
          description,
          type,
          status,
          date_modified,
          size,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user projects:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getUserProjects:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}