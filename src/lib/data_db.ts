import postgres from 'postgres'
import { currentUser } from '@clerk/nextjs/server'

// Create a single SQL connection instance following Next.js best practices
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
})

export interface ProjectData {
  id: string
  name: string
  type: "EM" | "HT" | "CFD"
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
export async function addNewProject(
    projectData: ProjectData): Promise<ProjectData> {
  const user = await currentUser()
  const userId = user?.id
  if (!userId) {
    throw new DatabaseError('User ID is required')
  }

  try {
    // Start a transaction
    const [project] = await sql<ProjectData[]>`
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
