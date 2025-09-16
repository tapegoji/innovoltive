'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import postgres from 'postgres'
import crypto from 'crypto'
import { CreateNewProject, EditProject, DeleteProjects, CopyProject, ShareProject, fetchUserProjects as fetchUserProjectsData } from './data'
import { CreateProjectSchema, UpdateProjectSchema } from './definitions'

// Create a single SQL connection instance following Next.js best practices
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
})

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const user = await currentUser()
  if (!user?.id) {
    throw new Error('User authentication required')
  }
  
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User'
  
  // Ensure user exists in our database with root_path
  const userEmail = user.primaryEmailAddress?.emailAddress
  if (userEmail) {
    const salt = process.env.PATH_HASH_SALT || 'default_salt'
    const rootPath = crypto.createHash('sha256').update(userEmail + salt).digest('hex')
    const now = new Date().toISOString()
    
    try {
      // Check if user exists
      const existingUser = await sql`SELECT user_id FROM users WHERE user_id = ${user.id}`
      
      if (existingUser.length === 0) {
        // Insert new user
        await sql`INSERT INTO users (user_id, root_path, last_signedin) VALUES (${user.id}, ${rootPath}, ${now})`
      } else {
        // Only update last_signedin for existing users
        await sql`UPDATE users SET last_signedin = ${now} WHERE user_id = ${user.id}`
      }
    } catch (error) {
      console.error('Error ensuring user in database:', error)
      // Continue without throwing to avoid blocking login
    }
  }
  
  return { userId: user.id, userName }
}

// Helper function to find user by email using Clerk
async function findUserByEmail(email: string): Promise<string | null> {
  try {
    const client = await clerkClient()
    const users = await client.users.getUserList({
      emailAddress: [email.toLowerCase()]
    })
    return users.data.length > 0 ? users.data[0].id : null
  } catch (error) {
    console.error(`Error finding user with email ${email}:`, error)
    return null
  }
}

export async function fetchUserProjects() {
  try {
    const { userId, userName } = await getAuthenticatedUser()
    return await fetchUserProjectsData(userId, userName)
  } catch (error) {
    // Handle build-time errors gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('Build-time: Skipping user project fetch during static generation')
      return []
    }
    console.error('Failed to fetch projects:', error)
    throw error
  }
}

export async function fetchPublicProjects() {
  try {
    // Get projects shared with info@innovoltive.com (public demo projects)
    const publicUserId = await findUserByEmail('info@innovoltive.com')
    if (!publicUserId) {
      console.warn('Public demo account (info@innovoltive.com) not found')
      return []
    }
    return await fetchUserProjectsData(publicUserId, 'Public')
  } catch (error) {
    // Handle build-time errors gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('Build-time: Skipping public project fetch during static generation')
      return []
    }
    console.error('Failed to fetch projects:', error)
    throw error
  }
}
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
    const { userId } = await getAuthenticatedUser()
    
    // Join multiple types with comma separator to support combinations
    const typeString = type.join(',')
    
    const projectData = {
      id: '', // Will be generated in CreateNewProject
      name,
      type: typeString,
      status: 'active' as const,
      size: '0 MB',
      date_modified: clientTime || '',
      user_id: '', // Will be set in CreateNewProject
      user_name: '', // Will be set in CreateNewProject
      description: description || '',
    }

    await CreateNewProject(projectData, userId)
  } catch (error) {
    console.error('Failed to create project:', error)
    throw new Error('Failed to create project')
  }

  // Revalidate the projects page to show the new project
  revalidatePath('/my-projects')

  // Redirect to the projects page
  redirect('/my-projects')
}

export async function editProject(id: string, formData: FormData) {
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
    const { userId, userName } = await getAuthenticatedUser()
    
    const updateData = {
      name,
      type,
      description: description || '',
      status,
      date_modified: new Date().toISOString(),
    }

    await EditProject(id, updateData, userId, userName)
  } catch (error) {
    console.error('Failed to edit project:', error)
    throw new Error('Failed to edit project')
  }

  // Revalidate the projects page to show the updated project
  revalidatePath('/my-projects')

  // Redirect to the projects page
  redirect('/my-projects')
}

export async function deleteProjects(formData: FormData) {
  try {
    const { userId } = await getAuthenticatedUser()
    
    // Extract project IDs from form data
    const projectIdsData = formData.getAll('projectId') as string[]
    
    if (projectIdsData.length === 0) {
      throw new Error('No projects specified for deletion')
    }
    
    await DeleteProjects(projectIdsData, userId)
  } catch (error) {
    console.error('Failed to delete projects:', error)
    throw new Error('Failed to delete projects')
  }

  // Revalidate the projects page to show the updated project list
  revalidatePath('/my-projects')
  
  // Redirect to the projects page
  redirect('/my-projects')
}

export async function copyProject(projectId: string, formData: FormData) {
  // Extract and validate form data
  const types = formData.getAll('type') as string[]
  
  const validatedFields = UpdateProjectSchema.safeParse({
    name: formData.get('name'),
    type: types.join(','), // Join array into comma-separated string
    description: formData.get('description'),
    status: formData.get('status'),
  })

  // If form validation fails, return early
  if (!validatedFields.success) {
    throw new Error('Invalid form data')
  }

  const { name, type, description, status } = validatedFields.data

  try {
    const { userId, userName } = await getAuthenticatedUser()
    
    await CopyProject(
      projectId,
      name,
      type,
      description || '',
      status,
      false, // allowPublicCopy
      userId,
      userName
    )
  } catch (error) {
    console.error('Failed to copy project:', error)
    throw new Error('Failed to copy project')
  }

  // Revalidate the projects page to show the new copied project
  revalidatePath('/my-projects')

  // Redirect to the projects page
  redirect('/my-projects')
}

export async function shareProject(formData: FormData) {
  try {
    const { userId } = await getAuthenticatedUser()
    
    // Extract project IDs from form data
    const projectIdsData = formData.getAll('projectId') as string[]
    
    if (projectIdsData.length === 0) {
      throw new Error('No projects specified for sharing')
    }
    
    const email = formData.get('email') as string
    const role = formData.get('role') as 'viewer' | 'owner'
    
    if (!email) {
      throw new Error('Email is required')
    }

    // Validate email format
    if (!email.includes('@')) {
      throw new Error('Valid email is required')
    }

    // Find user by email using Clerk
    const targetUserId = await findUserByEmail(email)
    
    if (targetUserId) {
      // User exists, proceed with sharing
      for (const projectId of projectIdsData) {
        await ShareProject(projectId, [targetUserId], role, userId)
      }
    }
    // If user doesn't exist, we silently do nothing to prevent email enumeration
    
  } catch (error) {
    console.error('Failed to share project:', error)
    throw new Error('Failed to share project')
  }

  // Revalidate the projects page to show updated sharing status
  revalidatePath('/my-projects')
  
  // Redirect to the projects page
  redirect('/my-projects')
}