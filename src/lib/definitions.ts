import { z } from 'zod'

export interface ProjectData {
  id: string
  name: string
  simtype: string // Support comma-separated combinations like "EM,HT" or "CFD" or "EM,HT,CFD"
  status: "active" | "paused" | "archived" | "running"
  size: string
  date_modified: string
  user_id: string
  user_name: string
  description: string
  storage_path_id?: string
  shared?: boolean
}

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Custom error class for quota exceeded scenarios
export class QuotaExceededError extends Error {
  constructor(message: string = "You don't have enough storage") {
    super(message)
    this.name = 'QuotaExceededError'
  }
}

// Schema for validating the create project form data
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  simtype: z.array(z.enum(['MAG', 'PCB', 'FEA', 'CFD', ])).min(1, 'At least one simtype must be selected'),
  description: z.string().optional(),
  clientTime: z.string().optional(),
})

// Schema for validating the update project form data
export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  simtype: z.string().min(1, 'At least one simtype must be selected'),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'archived', 'running']),
})

// Schema matching the ProjectData interface from the backend
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  simtype: z.string(),
  status: z.string(),
  size: z.string(),
  date_modified: z.string(),
  user_id: z.string(),
  user_name: z.string(),
  description: z.string(),
  storage_path_id: z.string().optional(),
  shared: z.boolean().optional(),
})

export type Project = z.infer<typeof projectSchema>

export const statuses = [
  {
    value: "active",
    label: "Active",
    className: "text-green-600 border-green-200"
  },
  {
    value: "running",
    label: "Running",
    className: "text-blue-600 border-blue-200"
  },
  {
    value: "archived",
    label: "Archived",
    className: "text-gray-600 border-gray-200"
  },
  {
    value: "paused",
    label: "Paused",
    className: "text-yellow-600 border-yellow-200"
  },
]

export const types = [
    {
    value: "MAG",
    label: "Magnetics",
    className: "text-purple-600 border-purple-200"
  },
  {
    value: "PCB",
    label: "Printed Circuit Board",
    className: "text-orange-600 border-orange-200"
  },
  {
    value: "FEA",
    label: "Finite Element Analysis",
    className: "text-blue-600 border-blue-200"
  },
  {
    value: "CFD",
    label: "Computational Fluid Dynamics",
    className: "text-green-600 border-green-200"
  }
]

// Helper functions to get className from arrays
export const getStatusClass = (status: string) => {
  return statuses.find(s => s.value === status)?.className || "text-gray-600 border-gray-200"
}

export const getSimtypeClass = (simtype: string) => {
  return types.find(t => t.value.toUpperCase() === simtype.toUpperCase())?.className || "text-gray-600 border-gray-200"
}
