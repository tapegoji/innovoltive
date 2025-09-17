import postgres from 'postgres'
import { ProjectData, DatabaseError, QuotaExceededError } from './definitions'
import { hashPath, storePathMapping, getRealPath, removePathMapping } from './path-utils'
import { promises as fs } from 'fs'
import path from 'path'
import { currentUser } from '@clerk/nextjs/server'
import crypto from 'crypto'

// Create a single SQL connection instance following Next.js best practices
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
})

// Helper function to check user quota before creating/copying projects
async function checkUserQuota(userId: string): Promise<void> {
  try {
    const [userQuota] = await sql`
      SELECT quota, used_quota
      FROM users
      WHERE user_id = ${userId}
    `

    if (!userQuota) {
      // If user doesn't exist in users table, create them with default quota of 0
      await sql`
        INSERT INTO users (user_id, quota, used_quota)
        VALUES (${userId}, 0, 0)
        ON CONFLICT (user_id) DO NOTHING
      `
      throw new QuotaExceededError()
    }

    if (userQuota.used_quota >= userQuota.quota) {
      throw new QuotaExceededError()
    }
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      throw error
    }
    console.error('Error checking user quota:', error)
    throw new DatabaseError('Failed to check user quota', error as Error)
  }
}

// Helper function to create project folder and get hashed path
async function createProjectFolder(userId: string): Promise<{ projectId: string, hashedPath: string, projectFolder: string }> {
  // Get user from Clerk to access metadata
  const user = await currentUser()
  if (!user) {
    throw new DatabaseError('User not authenticated')
  }

  let userFolderName = user.privateMetadata?.root_path as string

  if (!userFolderName) {
    // Generate unique hash for root_path
    const salt = process.env.PATH_HASH_SALT || 'default_salt'
    const userEmail = user.primaryEmailAddress?.emailAddress
    if (userEmail) {
      userFolderName = crypto.createHash('sha256').update(userEmail + salt).digest('hex')
    } else {
      // Fallback if no email
      userFolderName = crypto.randomUUID()
    }

    // Update user's private metadata
    const { clerkClient } = await import('@clerk/nextjs/server')
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        root_path: userFolderName
      }
    })
  }

  const projectId = crypto.randomUUID()
  const rootPath = path.join('/projects_storage', userFolderName)
  const projectFolder = path.join(rootPath, projectId)

  await fs.mkdir(projectFolder, { recursive: true })

  const hashedPath = await hashPath(projectFolder)
  await storePathMapping(hashedPath, projectFolder)

  return { projectId, hashedPath, projectFolder }
}

// Helper function to recursively copy a directory
async function copyDirectory(src: string, dest: string): Promise<void> {
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true })
      await copyDirectory(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

// Fetch user projects with JOIN
export async function fetchUserProjects(userId: string, userName: string): Promise<ProjectData[]> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    const projects = await sql<ProjectData[]>`
      SELECT
        projects.id,
        projects.name,
        projects.sim_type as "simType",
        projects.description,
        projects.date_modified,
        projects.size,
        projects.status,
        projects.user_id,
        projects.storage_path_id,
        CASE WHEN (SELECT COUNT(*) FROM user_projects up WHERE up.project_id = projects.id) > 1 THEN true ELSE false END as shared
      FROM projects
      JOIN user_projects ON projects.id = user_projects.project_id
      WHERE user_projects.user_id = ${userId}
      ORDER BY projects.date_modified DESC
    `

    return projects.map(project => ({ ...project, user_name: userName }))
  } catch (error) {
    console.error('Database error fetching user projects:', error)
    throw new DatabaseError('Failed to fetch projects', error as Error)
  }
}

// Create a new project and associate it with a user
export async function CreateNewProject(
    projectData: ProjectData,
    userId: string
): Promise<ProjectData> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Check user quota before creating the project
    await checkUserQuota(userId)

    const { projectId, hashedPath } = await createProjectFolder(userId)

    // Insert the project
    const [project] = await sql<ProjectData[]>`
      INSERT INTO projects (id, name, sim_type, description, size, user_id, status, date_modified, storage_path_id)
      VALUES (
        ${projectId},
        ${projectData.name},
        ${projectData.simType},
        ${projectData.description || ''},
        ${'0 MB'},
        ${userId},
        ${projectData.status || 'active'},
        ${projectData.date_modified || new Date().toISOString()},
        ${hashedPath}
      )
      RETURNING id, name, sim_type as "simType", description, date_modified, size, status, user_id, storage_path_id
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

// Edit an existing project
export async function EditProject(
    projectId: string,
    projectData: Partial<ProjectData>,
    userId: string,
    userName: string
): Promise<ProjectData> {
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

    // Get current project data
    const [currentProject] = await sql<ProjectData[]>`
      SELECT * FROM projects WHERE id = ${projectId}
    `

    if (!currentProject) {
      throw new DatabaseError('Project not found')
    }

    // Prepare update data with defaults
    const updateData = {
      name: projectData.name ?? currentProject.name,
      simType: projectData.simType ?? currentProject.simType,
      description: projectData.description ?? currentProject.description,
      status: projectData.status ?? currentProject.status,
      date_modified: projectData.date_modified ?? new Date().toISOString()
    }

    const [project] = await sql<ProjectData[]>`
      UPDATE projects
      SET
        name = ${updateData.name},
        sim_type = ${updateData.simType},
        description = ${updateData.description},
        status = ${updateData.status},
        date_modified = ${updateData.date_modified}
      WHERE id = ${projectId}
      RETURNING id, name, sim_type as "simType", description, date_modified, size, status, user_id, storage_path_id
    `

    if (!project) {
      throw new DatabaseError('Failed to update project')
    }

    return { ...project, user_name: userName }
  } catch (error) {
    console.error('Database error editing project:', error)
    throw new DatabaseError('Failed to edit project', error as Error)
  }
}

// Delete projects
export async function DeleteProjects(projectIds: string[], userId: string): Promise<void> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Check if user owns all these projects
    const ownedProjects = await sql`
      SELECT project_id FROM user_projects
      WHERE user_id = ${userId} AND project_id = ANY(${projectIds})
    `

    if (ownedProjects.length !== projectIds.length) {
      throw new DatabaseError('Some projects not found or access denied')
    }

    // Get project storage paths before deleting
    const projects = await sql`
      SELECT id, storage_path_id FROM projects
      WHERE id = ANY(${projectIds})
    `

    // Clean up file system and path mappings
    for (const project of projects) {
      if (project.storage_path_id) {
        try {
          // Get the real path from mapping
          const realPath = await getRealPath(project.storage_path_id)
          if (realPath) {
            // Delete the project folder
            await fs.rm(realPath, { recursive: true, force: true })
            // Remove the path mapping
            await removePathMapping(project.storage_path_id)
          }
        } catch (cleanupError) {
          console.error(`Error cleaning up project ${project.id}:`, cleanupError)
          // Continue with other projects even if one fails
        }
      }
    }

    // Delete user-project associations and projects
    await sql`DELETE FROM user_projects WHERE user_id = ${userId} AND project_id = ANY(${projectIds})`
    await sql`DELETE FROM projects WHERE id = ANY(${projectIds})`

  } catch (error) {
    console.error('Database error deleting projects:', error)
    throw new DatabaseError('Failed to delete projects', error as Error)
  }
}

// Copy a project
export async function CopyProject(
  projectId: string,
  newName: string,
  newType: string,
  newDescription: string,
  newStatus: string,
  allowPublicCopy: boolean = false,
  userId: string,
  userName: string
): Promise<ProjectData> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Check user quota before copying the project
    await checkUserQuota(userId)

    // Get the original project
    const originalProject = allowPublicCopy
      ? await sql<ProjectData[]>`SELECT * FROM projects WHERE id = ${projectId}`
      : await sql<ProjectData[]>`
          SELECT p.* FROM projects p
          JOIN user_projects up ON p.id = up.project_id
          WHERE p.id = ${projectId} AND up.user_id = ${userId}
        `

    if (originalProject.length === 0) {
      throw new DatabaseError('Project not found or access denied')
    }

    const { projectId: newProjectId, hashedPath, projectFolder } = await createProjectFolder(userId)

    // Copy files from original project if it exists
    if (originalProject[0].storage_path_id) {
      try {
        const originalPath = await getRealPath(originalProject[0].storage_path_id)
        if (originalPath && await fs.stat(originalPath).catch(() => null)) {
          // Copy all files from original project to new project
          await copyDirectory(originalPath, projectFolder)
        }
      } catch (copyError) {
        console.error('Error copying project files:', copyError)
        // Continue with project creation even if file copy fails
      }
    }

    const [copiedProject] = await sql<ProjectData[]>`
      INSERT INTO projects (id, name, sim_type, description, size, user_id, status, date_modified, storage_path_id)
      VALUES (
        ${newProjectId},
        ${newName},
        ${newType},
        ${newDescription},
        ${'0 MB'},
        ${userId},
        ${newStatus},
        ${new Date().toISOString()},
        ${hashedPath}
      )
      RETURNING id, name, sim_type as "simType", description, date_modified, size, status, user_id, storage_path_id
    `

    // Link the copied project to the current user as owner
    await sql`
      INSERT INTO user_projects (user_id, project_id, role)
      VALUES (${userId}, ${copiedProject.id}, 'owner')
    `

    return { ...copiedProject, user_name: userName }
  } catch (error) {
    console.error('Database error copying project:', error)
    throw new DatabaseError('Failed to copy project', error as Error)
  }
}

// Share a project with users by userIds
export async function ShareProject(
  projectId: string,
  userIds: string[],
  role: 'viewer' | 'owner' = 'viewer',
  currentUserId: string
): Promise<{success: boolean, sharedWith: string[], notFound: string[]}> {
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

    const sharedWith: string[] = []
    const notFound: string[] = []

    for (const userId of userIds) {
      try {
        // Check if user already has access
        const existingAccess = await sql`
          SELECT 1 FROM user_projects
          WHERE user_id = ${userId} AND project_id = ${projectId}
        `

        if (existingAccess.length === 0) {
          // Add user to the project
          await sql`
            INSERT INTO user_projects (user_id, project_id, role)
            VALUES (${userId}, ${projectId}, ${role})
          `
        } else {
          // Update existing role
          await sql`
            UPDATE user_projects
            SET role = ${role}
            WHERE user_id = ${userId} AND project_id = ${projectId}
          `
        }

        sharedWith.push(userId)
      } catch (dbError) {
        console.error(`Error sharing project with user ${userId}:`, dbError)
        notFound.push(userId)
      }
    }

    return { success: true, sharedWith, notFound }
  } catch (error) {
    console.error('Database error sharing project:', error)
    throw new DatabaseError('Failed to share project', error as Error)
  }
}
