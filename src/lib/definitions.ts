import { z } from 'zod'
import {
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react"

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

// Schema for validating the create project form data
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.array(z.enum(['EM', 'HT', 'CFD'])).min(1, 'At least one type must be selected'),
  description: z.string().optional(),
  clientTime: z.string().optional(),
})

// Schema for validating the update project form data
export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.string().min(1, 'At least one type must be selected'),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'archived']),
})

// Schema matching the ProjectData interface from the backend
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  size: z.string(),
  date_modified: z.string(),
  user_id: z.string(),
  user_name: z.string(),
  description: z.string(),
})

export type Project = z.infer<typeof projectSchema>

export const statuses = [
  {
    value: "active",
    label: "Active",
    icon: HelpCircle,
  },
  {
    value: "archived",
    label: "Archived",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CircleOff,
  },
]

export const types = [
  {
    value: "EM",
    label: "EM",
    icon: Circle,
  },
  {
    value: "HT",
    label: "HT",
    icon: Circle,
  },
  {
    value: "CFD",
    label: "CFD",
    icon: Circle,
  }
]
