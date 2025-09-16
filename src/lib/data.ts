import postgres from 'postgres'
import { ProjectData, DatabaseError } from './definitions'
import { hashPath, storePathMapping } from './path-utils'
import { promises as fs } from 'fs'
import path from 'path'

// Create a single SQL connection instance following Next.js best practices
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
})

// Helper function to create project folder and get hashed path
async function createProjectFolder(userId: string): Promise<{ projectId: string, hashedPath: string, projectFolder: string }> {
  const userResult = await sql`SELECT root_path FROM users WHERE user_id = ${userId}`

  if (userResult.length === 0) {
    throw new DatabaseError('User not found')
  }

  const userFolderName = userResult[0].root_path
  if (!userFolderName) {
    throw new DatabaseError('User root path not configured')
  }

  const projectId = crypto.randomUUID()
  const rootPath = path.join('/projects_storage', userFolderName)
  const projectFolder = path.join(rootPath, projectId)

  await fs.mkdir(projectFolder, { recursive: true })

  const hashedPath = await hashPath(projectFolder)
  await storePathMapping(hashedPath, projectFolder)

  return { projectId, hashedPath, projectFolder }
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
        projects.type,
        projects.description,
        projects.date_modified,
        projects.size,
        projects.status,
        projects.user_id,
        projects.storage_path_id
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
    const { projectId, hashedPath } = await createProjectFolder(userId)

    // Insert the project
    const [project] = await sql<ProjectData[]>`
      INSERT INTO projects (id, name, type, description, size, user_id, status, date_modified, storage_path_id)
      VALUES (
        ${projectId},
        ${projectData.name},
        ${projectData.type},
        ${projectData.description || ''},
        ${'0 MB'},
        ${userId},
        ${projectData.status || 'active'},
        ${projectData.date_modified || new Date().toISOString()},
        ${hashedPath}
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
      type: projectData.type ?? currentProject.type,
      description: projectData.description ?? currentProject.description,
      status: projectData.status ?? currentProject.status,
      date_modified: projectData.date_modified ?? new Date().toISOString()
    }

    const [project] = await sql<ProjectData[]>`
      UPDATE projects
      SET
        name = ${updateData.name},
        type = ${updateData.type},
        description = ${updateData.description},
        status = ${updateData.status},
        date_modified = ${updateData.date_modified}
      WHERE id = ${projectId}
      RETURNING id, name, type, description, date_modified, size, status, user_id, storage_path_id
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

    const { projectId: newProjectId, hashedPath } = await createProjectFolder(userId)

    const [copiedProject] = await sql<ProjectData[]>`
      INSERT INTO projects (id, name, type, description, size, user_id, status, date_modified, storage_path_id)
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
      RETURNING id, name, type, description, date_modified, size, status, user_id, storage_path_id
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
