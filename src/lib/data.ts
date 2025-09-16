import postgres from 'postgres'
import { ProjectData, DatabaseError } from './definitions'

// Create a single SQL connection instance following Next.js best practices
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
})

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
        projects.user_id
      FROM projects
      JOIN user_projects ON projects.id = user_projects.project_id
      WHERE user_projects.user_id = ${userId}
      ORDER BY projects.date_modified DESC
    `

    // Add user name to each project
    const projectsWithUserName = projects.map(project => ({
      ...project,
      user_name: userName
    }))

    return projectsWithUserName
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
    // Generate a UUID for the project
    const projectId = crypto.randomUUID()
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

    const [project] = await sql<ProjectData[]>`
      UPDATE projects 
      SET 
        name = ${updatedName},
        type = ${updatedType},
        description = ${updatedDescription},
        status = ${updatedStatus},
        date_modified = ${updatedDateModified},
        user_id = ${userId}
      WHERE id = ${projectId}
      RETURNING id, name, type, description, date_modified, size, status, user_id
    `

    if (!project) {
      throw new DatabaseError('Failed to update project')
    }
    
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
export async function DuplicateProject(
  projectId: string, 
  allowPublicCopy: boolean = false,
  userId: string,
  userName: string
): Promise<ProjectData> {
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
    
    return {
      ...duplicatedProject,
      user_name: userName
    }
  } catch (error) {
    console.error('Database error duplicating project:', error)
    throw new DatabaseError('Failed to duplicate project', error as Error)
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
        // Check if user already has access to this project
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
