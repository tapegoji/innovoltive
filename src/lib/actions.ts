'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { CreateNewProject, EditProject, DeleteProjects, CopyProject, ShareProject, fetchUserProjects as fetchUserProjectsData } from './data'
import { CreateProjectSchema, UpdateProjectSchema } from './definitions'
import { getRealPath } from './path-utils'
import { promises as fs } from 'fs'
import path from 'path'

// Type definitions
interface TreeNode {
  id: string
  name: string
  isFolder: boolean
  children?: TreeNode[]
}

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const user = await currentUser()
  if (!user?.id) {
    throw new Error('User authentication required')
  }
  
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User'
  
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
  const simtypes = formData.getAll('simtype') as string[]
  
  const validatedFields = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    simtype: simtypes,
    description: formData.get('description'),
    clientTime: formData.get('clientTime'),
  })

  // If form validation fails, return early
  if (!validatedFields.success) {
    throw new Error('Invalid form data')
  }

  const { name, simtype, description, clientTime } = validatedFields.data

  try {
    const { userId } = await getAuthenticatedUser()
    
    // Join multiple simtypes with comma separator to support combinations
    const simtypeString = simtype.join(',')
    
    const projectData = {
      id: '', // Will be generated in CreateNewProject
      name,
      simtype: simtypeString,
      status: 'active' as const,
      size: '0 MB',
      date_modified: clientTime || '',
      user_id: '', // Will be set in CreateNewProject
      user_name: '', // Will be set in CreateNewProject
      description: description || '',
    }

    const createdProject = await CreateNewProject(projectData, userId)

    // Set project session for the newly created project
    await setProjectSession(createdProject.id, createdProject.storage_path_id!, createdProject.name, createdProject.simtype, userId)

  } catch (error) {
    console.error('Failed to create project:', error)
    throw new Error('Failed to create project')
  }

  // Revalidate the projects page to show the new project
  revalidatePath('/my-projects')

  // Redirect to canvas
  redirect('/canvas')
}

export async function editProject(id: string, formData: FormData) {
  // Extract and validate form data
  const simtypes = formData.getAll('simtype') as string[]
  
  const validatedFields = UpdateProjectSchema.safeParse({
    name: formData.get('name'),
    simtype: simtypes.join(','), // Join array into comma-separated string like create does
    description: formData.get('description'),
    status: formData.get('status'),
  })

  // If form validation fails, return early
  if (!validatedFields.success) {
    throw new Error('Invalid form data')
  }

  const { name, simtype, description, status } = validatedFields.data

  try {
    const { userId, userName } = await getAuthenticatedUser()
    
    const updateData = {
      name,
      simtype,
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
  const simtypes = formData.getAll('simtype') as string[]
  
  const validatedFields = UpdateProjectSchema.safeParse({
    name: formData.get('name'),
    simtype: simtypes.join(','), // Join array into comma-separated string
    description: formData.get('description'),
    status: formData.get('status'),
  })

  // If form validation fails, return early
  if (!validatedFields.success) {
    throw new Error('Invalid form data')
  }

  const { name, simtype, description, status } = validatedFields.data

  try {
    const { userId, userName } = await getAuthenticatedUser()
    
    await CopyProject(
      projectId,
      name,
      simtype,
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

// Helper function to set project session cookie
async function setProjectSession(projectId: string, storagePathId: string, projectName: string, simtype: string | undefined, userId: string) {
  // Validate that the storage path ID exists and user has access
  const realPath = await getRealPath(storagePathId)
  if (!realPath) {
    throw new Error('Invalid project path')
  }

  // Additional security: verify the user owns this project
  // You could add a database query here to verify ownership
  // For now, we'll trust that the storage path validation is sufficient

  // Store project information in secure HTTP-only cookie
  const projectData = {
    projectId,
    storagePathId,
    realPath,
    projectName,
    simtype: simtype, // Keep as simtype for database consistency
    userId,
    timestamp: Date.now()
  }

  const cookieStore = await cookies()
  cookieStore.set('selected-project', JSON.stringify(projectData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/'
  })
}

// Secure project selection action
export async function selectProject(projectId: string, storagePathId: string, projectName: string, simtype?: string) {
  try {
    const { userId } = await getAuthenticatedUser()
    
    await setProjectSession(projectId, storagePathId, projectName, simtype, userId)
    
  } catch (error) {
    console.error('Failed to select project:', error)
    throw new Error('Failed to select project')
  }
  
  // Redirect to canvas without any project identifiers in URL
  redirect('/canvas')
}

// Helper to get selected project from session
export async function getSelectedProject() {
  try {
    const { userId } = await getAuthenticatedUser()
    const cookieStore = await cookies()
    const projectCookie = cookieStore.get('selected-project')
    
    if (!projectCookie?.value) {
      return null
    }
    
    const projectData = JSON.parse(projectCookie.value)
    
    // Validate session data
    if (projectData.userId !== userId) {
      // Clear invalid session
      cookieStore.delete('selected-project')
      return null
    }
    
    // Check if session is expired (2 hours)
    if (Date.now() - projectData.timestamp > 2 * 60 * 60 * 1000) {
      cookieStore.delete('selected-project')
      return null
    }
    
    return projectData
  } catch (error) {
    console.error('Failed to get selected project:', error)
    return null
  }
}

// Server action for file operations using project hash
export async function getProjectFiles(projectHash: string) {
  try {
    await getAuthenticatedUser() // Ensure user is authenticated
    
    // Validate that the project hash matches current session
    const projectData = await getSelectedProject()
    if (!projectData || projectData.storagePathId !== projectHash) {
      throw new Error('Invalid project access')
    }

    // Get real path from hash
    const realPath = await getRealPath(projectHash)
    if (!realPath) {
      throw new Error('Project not found')
    }
    
    // Function to recursively build tree structure
    const buildFileTree = async (dirPath: string, basePath: string = ''): Promise<TreeNode[]> => {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        const tree: TreeNode[] = []
        
        for (const entry of entries) {
          const itemPath = basePath ? `${basePath}/${entry.name}` : entry.name
          const fullPath = path.join(dirPath, entry.name)
          
          const node: TreeNode = {
            id: itemPath,
            name: entry.name,
            isFolder: entry.isDirectory(),
            children: entry.isDirectory() ? await buildFileTree(fullPath, itemPath) : undefined
          }
          
          tree.push(node)
        }
        
        return tree.sort((a, b) => {
          // Folders first, then files, both alphabetically
          if (a.isFolder && !b.isFolder) return -1
          if (!a.isFolder && b.isFolder) return 1
          return a.name.localeCompare(b.name)
        })
      } catch (error) {
        console.error('Error reading directory:', error)
        return []
      }
    }
    
    const tree = await buildFileTree(realPath)
    
    return {
      success: true,
      tree: tree
    }  } catch (error) {
    console.error('Failed to access project files:', error)
    return {
      success: false,
      error: 'Failed to access project files'
    }
  }
}

// Server action to get project metadata using hash
export async function getProjectMetadata(projectHash: string) {
  try {
    await getAuthenticatedUser() // Ensure user is authenticated
    
    // Validate that the project hash matches current session
    const projectData = await getSelectedProject()
    if (!projectData || projectData.storagePathId !== projectHash) {
      throw new Error('Invalid project access')
    }
    
    // Get real path from hash
    const realPath = await getRealPath(projectHash)
    if (!realPath) {
      throw new Error('Project not found')
    }
    
    // Extract project name from path (server-side only)
    const projectName = realPath.split('/').pop() || 'Unknown Project'
    
    // Return safe metadata
    return {
      success: true,
      name: projectName,
      hash: projectHash.slice(0, 8) + '...'
    }
    
  } catch (error) {
    console.error('Failed to get project metadata:', error)
    return {
      success: false,
      error: 'Failed to get project metadata'
    }
  }
}

// Server action to upload geometry files to project
export async function uploadGeometryFiles(projectHash: string, formData: FormData) {
  try {
    await getAuthenticatedUser() // Ensure user is authenticated
    
    // Validate that the project hash matches current session
    const projectData = await getSelectedProject()
    if (!projectData || projectData.storagePathId !== projectHash) {
      throw new Error('Invalid project access')
    }

    // Get real path from hash
    const realPath = await getRealPath(projectHash)
    if (!realPath) {
      throw new Error('Project not found')
    }

    // Create geometry folder if it doesn't exist
    const geometryPath = path.join(realPath, 'geometry')
    try {
      await fs.mkdir(geometryPath, { recursive: true })
    } catch (error) {
      console.error('Error creating geometry directory:', error)
      throw new Error('Failed to create geometry directory')
    }

    // Process uploaded files
    const uploadedFiles: string[] = []
    const fsPromises = await import('fs/promises')

    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        const fileName = value.name
        const filePath = path.join(geometryPath, fileName)

        // Convert file to buffer and save
        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        try {
          await fsPromises.writeFile(filePath, buffer)
          uploadedFiles.push(fileName)
        } catch (error) {
          console.error(`Error saving file ${fileName}:`, error)
          throw new Error(`Failed to save file: ${fileName}`)
        }
      }
    }

    if (uploadedFiles.length === 0) {
      throw new Error('No files were uploaded')
    }

    return {
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} geometry file(s)`,
      files: uploadedFiles
    }

  } catch (error) {
    console.error('Failed to upload geometry files:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload geometry files'
    }
  }
}