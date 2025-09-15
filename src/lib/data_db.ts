import postgres from 'postgres'
import { currentUser } from '@clerk/nextjs/server'

// Create a single SQL connection instance following Next.js best practices
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
})

export interface ProjectData {
  id: string
  name: string
  type: string // Support comma-separated combinations like "EM,HT" or "CFD" or "EM,HT,CFD"
  status: "active" | "paused" | "archived"
  size: string
  date_modified: string
  user_id: string
  user_name: string
  description: string
}

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}
// Fetch user projects with JOIN
export async function fetchUserProjects(): Promise<ProjectData[]> {
  const user = await currentUser()
  const userId = user?.id
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    const projects = await sql<ProjectData[]>`
      SELECT 
        projects.id, 
        projects.name, 
        projects.type, 
        projects.description, 
        projects.date_modified, 
        projects.size, 
        projects.status,
        projects.user_id
      FROM projects
      JOIN user_projects ON projects.id = user_projects.project_id
      WHERE user_projects.user_id = ${userId}
      ORDER BY projects.date_modified DESC
    `

    // Add user name to each project
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User'
    const projectsFinal = projects.map(project => ({
      ...project,
      user_name: userName
    }))

    return projectsFinal
  } catch (error) {
    console.error('Database error fetching user projects:', error)
    throw new DatabaseError('Failed to fetch projects', error as Error)
  }
}

// Create a new project and associate it with a user
export async function CreateNewProject(
    projectData: ProjectData): Promise<ProjectData> {
  const user = await currentUser()
  const userId = user?.id
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Generate a UUID for the project
    const projectId = crypto.randomUUID()
    //log the projectdata
    console.log('Project Data:', projectData)
    // Insert the project
    const [project] = await sql<ProjectData[]>`
      INSERT INTO projects (id, name, type, description, size, user_id, status, date_modified)
      VALUES (
        ${projectId},
        ${projectData.name},
        ${projectData.type},
        ${projectData.description || ''},
        ${'0 MB'},
        ${userId},
        ${projectData.status || 'active'},
        ${projectData.date_modified || ''}
      )
      RETURNING id, name, type, description, date_modified, size, status
    `

    // Link the project to the user as owner
    await sql`
      INSERT INTO user_projects (user_id, project_id, role)
      VALUES (${userId}, ${project.id}, 'owner')
    `

    return project
  } catch (error) {
    console.error('Database error creating project:', error)
    throw new DatabaseError('Failed to create project', error as Error)
  }
}

// Update an existing project
export async function UpdateProject(
    projectId: string, 
    projectData: Partial<ProjectData>): Promise<ProjectData> {
  const user = await currentUser()
  const userId = user?.id
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Check if user owns this project
    const ownership = await sql`
      SELECT 1 FROM user_projects 
      WHERE user_id = ${userId} AND project_id = ${projectId}
    `
    
    if (ownership.length === 0) {
      throw new DatabaseError('Project not found or access denied')
    }

    // Get current project data first
    const [currentProject] = await sql<ProjectData[]>`
      SELECT * FROM projects WHERE id = ${projectId}
    `

    if (!currentProject) {
      throw new DatabaseError('Project not found')
    }

    // Update the project with explicit values
    const updatedName = projectData.name || currentProject.name
    const updatedType = projectData.type || currentProject.type
    const updatedDescription = projectData.description !== undefined ? projectData.description : currentProject.description
    const updatedStatus = projectData.status || currentProject.status
    const updatedDateModified = projectData.date_modified || new Date().toISOString()
    const user_id = userId

    const [project] = await sql<ProjectData[]>`
      UPDATE projects 
      SET 
        name = ${updatedName},
        type = ${updatedType},
        description = ${updatedDescription},
        status = ${updatedStatus},
        date_modified = ${updatedDateModified},
        user_id = ${user_id}
      WHERE id = ${projectId}
      RETURNING id, name, type, description, date_modified, size, status, user_id
    `

    if (!project) {
      throw new DatabaseError('Failed to update project')
    }

    // Add user name to the project
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User'
    
    return {
      ...project,
      user_name: userName
    }
  } catch (error) {
    console.error('Database error updating project:', error)
    throw new DatabaseError('Failed to update project', error as Error)
  }
}

// Delete projects
export async function DeleteProjects(projectIds: string[]): Promise<void> {
  const user = await currentUser()
  const userId = user?.id
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Check if user owns all these projects
    const ownedProjects = await sql`
      SELECT project_id FROM user_projects 
      WHERE user_id = ${userId} AND project_id = ANY(${projectIds})
    `
    
    const ownedProjectIds = ownedProjects.map(p => p.project_id)
    
    if (ownedProjectIds.length !== projectIds.length) {
      throw new DatabaseError('Some projects not found or access denied')
    }

    // Delete user-project associations first
    await sql`
      DELETE FROM user_projects 
      WHERE user_id = ${userId} AND project_id = ANY(${projectIds})
    `

    // Delete the projects
    await sql`
      DELETE FROM projects 
      WHERE id = ANY(${projectIds})
    `
    
  } catch (error) {
    console.error('Database error deleting projects:', error)
    throw new DatabaseError('Failed to delete projects', error as Error)
  }
}

// Duplicate a project
export async function DuplicateProject(projectId: string, allowPublicCopy: boolean = false): Promise<ProjectData> {
  const user = await currentUser()
  const userId = user?.id
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Get the original project
    let originalProject: ProjectData[]
    
    if (allowPublicCopy) {
      // For public copy, allow access to any project
      originalProject = await sql<ProjectData[]>`
        SELECT * FROM projects WHERE id = ${projectId}
      `
    } else {
      // For regular duplicate, check ownership
      originalProject = await sql<ProjectData[]>`
        SELECT p.* FROM projects p
        JOIN user_projects up ON p.id = up.project_id
        WHERE p.id = ${projectId} AND up.user_id = ${userId}
      `
    }
    
    if (originalProject.length === 0) {
      throw new DatabaseError('Project not found or access denied')
    }

    const original = originalProject[0]
    
    // Generate a new UUID for the duplicated project
    const newProjectId = crypto.randomUUID()
    
    // Create the duplicated project with a new name
    const copyName = `${original.name} (Copy)`
    
    const [duplicatedProject] = await sql<ProjectData[]>`
      INSERT INTO projects (id, name, type, description, size, user_id, status, date_modified)
      VALUES (
        ${newProjectId},
        ${copyName},
        ${original.type},
        ${original.description},
        ${'0 MB'},
        ${userId},
        ${'active'},
        ${new Date().toISOString()}
      )
      RETURNING id, name, type, description, date_modified, size, status, user_id
    `

    // Link the duplicated project to the current user as owner
    await sql`
      INSERT INTO user_projects (user_id, project_id, role)
      VALUES (${userId}, ${duplicatedProject.id}, 'owner')
    `

    // Add user name to the project
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User'
    
    return {
      ...duplicatedProject,
      user_name: userName
    }
  } catch (error) {
    console.error('Database error duplicating project:', error)
    throw new DatabaseError('Failed to duplicate project', error as Error)
  }
}

// Share a project with users by email
export async function ShareProject(
  projectId: string, 
  emails: string[], 
  role: 'viewer' | 'owner' = 'viewer'
): Promise<{success: boolean, sharedWith: string[], notFound: string[]}> {
  const user = await currentUser()
  const currentUserId = user?.id
  if (!currentUserId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Check if current user owns this project
    const ownership = await sql`
      SELECT 1 FROM user_projects 
      WHERE user_id = ${currentUserId} AND project_id = ${projectId}
    `
    
    if (ownership.length === 0) {
      throw new DatabaseError('Project not found or access denied')
    }

    // Use Clerk API to find users by email
    const { clerkClient } = await import('@clerk/nextjs/server')
    const client = await clerkClient()
    const sharedWith: string[] = []
    const notFound: string[] = []

    for (const email of emails) {
      try {
        // Handle special case for public sharing
        if (email === 'user_public') {
          // Check if public access already exists
          const existingPublicAccess = await sql`
            SELECT 1 FROM user_projects 
            WHERE user_id = 'user_public' AND project_id = ${projectId}
          `
          
          if (existingPublicAccess.length === 0) {
            // Add public access
            await sql`
              INSERT INTO user_projects (user_id, project_id, role)
              VALUES ('user_public', ${projectId}, ${role})
            `
          } else {
            // Update existing public access role
            await sql`
              UPDATE user_projects 
              SET role = ${role}
              WHERE user_id = 'user_public' AND project_id = ${projectId}
            `
          }
          
          sharedWith.push('public')
          continue
        }

        // Regular email sharing - search for user by email in Clerk
        const users = await client.users.getUserList({
          emailAddress: [email.toLowerCase()]
        })

        if (users.data.length > 0) {
          const targetUserId = users.data[0].id
          
          // Check if user already has access to this project
          const existingAccess = await sql`
            SELECT 1 FROM user_projects 
            WHERE user_id = ${targetUserId} AND project_id = ${projectId}
          `
          
          if (existingAccess.length === 0) {
            // Add user to the project (assuming user_projects table has role column)
            await sql`
              INSERT INTO user_projects (user_id, project_id, role)
              VALUES (${targetUserId}, ${projectId}, ${role})
            `
          } else {
            // Update existing role
            await sql`
              UPDATE user_projects 
              SET role = ${role}
              WHERE user_id = ${targetUserId} AND project_id = ${projectId}
            `
          }
          
          sharedWith.push(email)
        } else {
          notFound.push(email)
        }
      } catch (clerkError) {
        console.error(`Error finding user with email ${email}:`, clerkError)
        notFound.push(email)
      }
    }

    return {
      success: true,
      sharedWith,
      notFound
    }
  } catch (error) {
    console.error('Database error sharing project:', error)
    throw new DatabaseError('Failed to share project', error as Error)
  }
}
