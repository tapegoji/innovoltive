'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CreateNewProject } from './data_db'

// Schema for validating the create project form data
const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.array(z.enum(['EM', 'HT', 'CFD'])).min(1, 'At least one type must be selected'),
  description: z.string().optional(),
  clientTime: z.string().optional(),
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