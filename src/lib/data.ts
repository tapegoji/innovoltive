import { supabase } from './supabase'

// Types for our data
export interface Project {
  id: string
  name: string
  type: "em" | "ht" | "cfd" | "mp" | "folder" | "file"
  description: string | null
  date_modified: string
  size: string | null
  status: "active" | "completed" | "paused" | "archived"
}

export interface FormattedProject {
  id: string
  name: string
  type: "em" | "ht" | "cfd" | "mp" | "folder" | "file"
  description: string
  dateModified: string
  size: string
  status: "active" | "completed" | "paused" | "archived"
  user: string
}

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// Fetch user projects using optimized approach to avoid waterfalls
export async function fetchUserProjects(userId: string): Promise<Project[]> {
  try {
    // First get the project IDs
    const { data: userProjects, error: userProjectsError } = await supabase
      .from('user_projects')
      .select('project_id')
      .eq('user_id', userId)

    if (userProjectsError) {
      console.error('Database error:', userProjectsError)
      throw new Error(`Failed to fetch user projects: ${userProjectsError.message}`)
    }

    if (!userProjects || userProjects.length === 0) {
      return []
    }

    // Extract project IDs
    const projectIds = userProjects.map(up => up.project_id)

    // Fetch project details in a single query
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, type, description, date_modified, size, status')
      .in('id', projectIds)
      .order('date_modified', { ascending: false })

    if (projectsError) {
      console.error('Database error:', projectsError)
      throw new Error(`Failed to fetch projects: ${projectsError.message}`)
    }

    return projects || []
  } catch (error) {
    console.error('Error in fetchUserProjects:', error)
    throw error
  }
}

// Format projects for the FileExplorer component
export function formatProjectsForDisplay(projects: Project[], userName: string): FormattedProject[] {
  return projects.map(project => ({
    id: project.id,
    name: project.name,
    type: project.type,
    description: project.description || '',
    dateModified: formatDate(project.date_modified),
    size: project.size || '',
    status: project.status,
    user: userName
  }))
}