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