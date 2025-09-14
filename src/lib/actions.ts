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