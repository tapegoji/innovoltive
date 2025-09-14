import postgres from 'postgres'

// Create a single SQL connection instance following Next.js best practices
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
})

// Types for our data
export interface ProjectDisplay {
  id: string
  name: string
  type: string
  description: string | null
  date_modified: string
  size: string | null
  status: 'active' | 'completed' | 'paused' | 'archived'
}

// Type for data-table.tsx schema
export interface ProjectTableData {
  id: number
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
}

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Input type for creating a new project
export interface CreateProjectInput {
  name: string
  type: string
  description?: string
  size?: string
  status?: 'active' | 'completed' | 'paused' | 'archived'
}

// Input type for updating a project
export interface UpdateProjectInput {
  id: string
  name?: string
  type?: string
  description?: string
  size?: string
  status?: 'active' | 'completed' | 'paused' | 'archived'
}

// Fetch user projects with JOIN
export async function fetchUserProjects(userId: string): Promise<ProjectDisplay[]> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    const projects = await sql<ProjectDisplay[]>`
      SELECT 
        projects.id, 
        projects.name, 
        projects.type, 
        projects.description, 
        projects.date_modified, 
        projects.size, 
        projects.status
      FROM projects
      JOIN user_projects ON projects.id = user_projects.project_id
      WHERE user_projects.user_id = ${userId}
      ORDER BY projects.date_modified DESC
    `

    return projects
  } catch (error) {
    console.error('Database error fetching user projects:', error)
    throw new DatabaseError('Failed to fetch projects', error as Error)
  }
}

// Fetch user projects formatted for data-table.tsx
export async function fetchUserProjectsForTable(userId: string): Promise<ProjectTableData[]> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    const projects = await sql<ProjectDisplay[]>`
      SELECT 
        projects.id, 
        projects.name, 
        projects.type, 
        projects.description, 
        projects.date_modified, 
        projects.size, 
        projects.status
      FROM projects
      JOIN user_projects ON projects.id = user_projects.project_id
      WHERE user_projects.user_id = ${userId}
      ORDER BY projects.date_modified DESC
    `

    // Transform the data to match data-table.tsx schema
    return projects.map((project, index) => ({
      id: index + 1, // Use index as numeric ID for the table
      header: project.name,
      type: project.type,
      status: project.status,
      target: project.size || 'N/A',
      limit: new Date(project.date_modified).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      reviewer: project.description || 'No description'
    }))
  } catch (error) {
    console.error('Database error fetching user projects for table:', error)
    throw new DatabaseError('Failed to fetch projects for table', error as Error)
  }
}

// Helper function to get project count for a user
export async function fetchUserProjectCount(userId: string): Promise<number> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*) as count
      FROM projects
      JOIN user_projects ON projects.id = user_projects.project_id
      WHERE user_projects.user_id = ${userId}
    `

    return parseInt(result.count, 10)
  } catch (error) {
    console.error('Database error fetching project count:', error)
    throw new DatabaseError('Failed to fetch project count', error as Error)
  }
}

// Create a new project and associate it with a user
export async function createProject(userId: string, projectData: CreateProjectInput): Promise<ProjectDisplay> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  if (!projectData.name || !projectData.type) {
    throw new DatabaseError('Project name and type are required')
  }

  try {
    // Start a transaction
    const [project] = await sql<ProjectDisplay[]>`
      INSERT INTO projects (name, type, description, size, status, date_modified)
      VALUES (
        ${projectData.name},
        ${projectData.type},
        ${projectData.description || null},
        ${projectData.size || null},
        ${projectData.status || 'active'},
        NOW()
      )
      RETURNING id, name, type, description, date_modified, size, status
    `

    // Link the project to the user
    await sql`
      INSERT INTO user_projects (user_id, project_id)
      VALUES (${userId}, ${project.id})
    `

    return project
  } catch (error) {
    console.error('Database error creating project:', error)
    throw new DatabaseError('Failed to create project', error as Error)
  }
}

// Update an existing project
export async function updateProject(userId: string, projectData: UpdateProjectInput): Promise<ProjectDisplay> {
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  if (!projectData.id) {
    throw new DatabaseError('Project ID is required')
  }

  try {
    // First verify the user owns this project
    const [ownership] = await sql<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT 1 FROM user_projects 
        WHERE user_id = ${userId} AND project_id = ${projectData.id}
      ) as exists
    `

    if (!ownership.exists) {
      throw new DatabaseError('Project not found or access denied')
    }

    // Build the update query dynamically based on provided fields
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (projectData.name !== undefined) {
      updateFields.push('name = $' + (updateValues.length + 1))
      updateValues.push(projectData.name)
    }
    if (projectData.type !== undefined) {
      updateFields.push('type = $' + (updateValues.length + 1))
      updateValues.push(projectData.type)
    }
    if (projectData.description !== undefined) {
      updateFields.push('description = $' + (updateValues.length + 1))
      updateValues.push(projectData.description)
    }
    if (projectData.size !== undefined) {
      updateFields.push('size = $' + (updateValues.length + 1))
      updateValues.push(projectData.size)
    }
    if (projectData.status !== undefined) {
      updateFields.push('status = $' + (updateValues.length + 1))
      updateValues.push(projectData.status)
    }

    // Always update the modified date
    updateFields.push('date_modified = NOW()')

    if (updateFields.length === 1) { // Only date_modified
      throw new DatabaseError('No fields to update')
    }

    updateValues.push(projectData.id)

    const [updatedProject] = await sql<ProjectDisplay[]>`
      UPDATE projects 
      SET ${sql.unsafe(updateFields.join(', '))}
      WHERE id = $${updateValues.length}
      RETURNING id, name, type, description, date_modified, size, status
    `

    return updatedProject
  } catch (error) {
    console.error('Database error updating project:', error)
    throw new DatabaseError('Failed to update project', error as Error)
  }
}

// Delete a project (removes from both projects and user_projects tables)
export async function deleteProject(userId: string, projectId: string): Promise<boolean> {
  if (!userId || !projectId) {
    throw new DatabaseError('User ID and Project ID are required')
  }

  try {
    // First verify the user owns this project
    const [ownership] = await sql<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT 1 FROM user_projects 
        WHERE user_id = ${userId} AND project_id = ${projectId}
      ) as exists
    `

    if (!ownership.exists) {
      throw new DatabaseError('Project not found or access denied')
    }

    // Delete from user_projects first (foreign key constraint)
    await sql`
      DELETE FROM user_projects 
      WHERE user_id = ${userId} AND project_id = ${projectId}
    `

    // Then delete the project itself
    const result = await sql`
      DELETE FROM projects 
      WHERE id = ${projectId}
    `

    return result.count > 0
  } catch (error) {
    console.error('Database error deleting project:', error)
    throw new DatabaseError('Failed to delete project', error as Error)
  }
}