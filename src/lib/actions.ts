'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CreateNewProject, UpdateProject, DeleteProjects, DuplicateProject } from './data_db'

// Schema for validating the create project form data
const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.array(z.enum(['EM', 'HT', 'CFD'])).min(1, 'At least one type must be selected'),
  description: z.string().optional(),
  clientTime: z.string().optional(),
})

// Schema for validating the update project form data
const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.string().min(1, 'At least one type must be selected'),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'archived']),
})

export async function createProject(formData: FormData) {
  // Extract and validate form data
  const types = formData.getAll('type') as string[]
  
  const validatedFields = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    type: types,
    description: formData.get('description'),
    clientTime: formData.get('clientTime'),
  })

  // If form validation fails, return early
  if (!validatedFields.success) {
    throw new Error('Invalid form data')
  }

  const { name, type, description, clientTime } = validatedFields.data

  try {
    // Join multiple types with comma separator to support combinations
    const typeString = type.join(',')
    
    const projectData = {
      id: '', // Will be generated in NewProject
      name,
      type: typeString,
      status: 'active' as const,
      size: '0 MB',
      date_modified: clientTime || '',
      user_id: '', // Will be set in NewProject
      user_name: '', // Will be set in NewProject
      description: description || '',
    }

    await CreateNewProject(projectData)
  } catch (error) {
    console.error('Failed to create project:', error)
    throw new Error('Failed to create project')
  }

  // Revalidate the projects page to show the new project
  revalidatePath('/my-projects')
  revalidatePath('/dashboard')
  
  // Redirect to the projects page
  redirect('/my-projects')
}

export async function updateProject(id: string, formData: FormData) {
  // Extract and validate form data
  const types = formData.getAll('type') as string[]
  
  const validatedFields = UpdateProjectSchema.safeParse({
    name: formData.get('name'),
    type: types.join(','), // Join array into comma-separated string like create does
    description: formData.get('description'),
    status: formData.get('status'),
  })

  // If form validation fails, return early
  if (!validatedFields.success) {
    throw new Error('Invalid form data')
  }

  const { name, type, description, status } = validatedFields.data

  try {
    const updateData = {
      name,
      type,
      description: description || '',
      status,
      date_modified: new Date().toISOString(),
    }

    await UpdateProject(id, updateData)
  } catch (error) {
    console.error('Failed to update project:', error)
    throw new Error('Failed to update project')
  }

  // Revalidate the projects page to show the updated project
  revalidatePath('/my-projects')
  revalidatePath('/dashboard')
  
  // Redirect to the projects page
  redirect('/my-projects')
}

export async function deleteProjects(projectIds: string[]) {
  try {
    await DeleteProjects(projectIds)
    
    // Return success result like your other actions seem to expect
    return { success: true }
  } catch (error) {
    console.error('Failed to delete projects:', error)
    return { success: false, error: 'Failed to delete projects' }
  }
}

export async function duplicateProject(projectId: string, allowPublicCopy: boolean = false) {
  try {
    await DuplicateProject(projectId, allowPublicCopy)
    
    // Return success result like your other actions expect
    return { success: true }
  } catch (error) {
    console.error('Failed to duplicate project:', error)
    return { success: false, error: 'Failed to duplicate project' }
  }
}