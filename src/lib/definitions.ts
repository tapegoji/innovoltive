import { z } from 'zod'
import { Badge } from "@/components/ui/badge"
import React from "react"

export interface ProjectData {
  id: string
  name: string
  type: string // Support comma-separated combinations like "EM,HT" or "CFD" or "EM,HT,CFD"
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
  type: z.array(z.enum(['EM', 'HT', 'CFD'])).min(1, 'At least one type must be selected'),
  description: z.string().optional(),
  clientTime: z.string().optional(),
})

// Schema for validating the update project form data
export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.string().min(1, 'At least one type must be selected'),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'archived', 'running']),
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
  storage_path_id: z.string().optional(),
  shared: z.boolean().optional(),
})

export type Project = z.infer<typeof projectSchema>

export const statuses = [
  {
    value: "active",
    label: "Active",
    badge: React.createElement(Badge, { variant: "outline", className: "text-green-600 border-green-200" }, "Active")
  },
  {
    value: "running",
    label: "Running",
    badge: React.createElement(Badge, { variant: "outline", className: "text-blue-600 border-blue-200" }, "Running")
  },
  {
    value: "archived",
    label: "Archived",
    badge: React.createElement(Badge, { variant: "outline", className: "text-gray-600 border-gray-200" }, "Archived")
  },
  {
    value: "paused",
    label: "Paused",
    badge: React.createElement(Badge, { variant: "outline", className: "text-yellow-600 border-yellow-200" }, "Paused")
  },
]

export const types = [
  {
    value: "EM",
    label: "EM",
    badge: React.createElement(Badge, { variant: "outline", className: "text-blue-600 border-blue-200" }, "EM")
  },
  {
    value: "HT",
    label: "HT",
    badge: React.createElement(Badge, { variant: "outline", className: "text-red-600 border-red-200" }, "HT")
  },
  {
    value: "CFD",
    label: "CFD",
    badge: React.createElement(Badge, { variant: "outline", className: "text-green-600 border-green-200" }, "CFD")
  }
]

// Simple utility functions to get badge classes
export const getTypeBadgeClass = (type: string) => {
  switch (type.toUpperCase()) {
    case 'EM':
      return "text-blue-600 border-blue-200"
    case 'HT':
      return "text-red-600 border-red-200"
    case 'CFD':
      return "text-green-600 border-green-200"
    default:
      return "text-gray-600 border-gray-200"
  }
}

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return "text-green-600 border-green-200"
    case 'running':
      return "text-blue-600 border-blue-200"
    case 'paused':
      return "text-yellow-600 border-yellow-200"
    case 'archived':
      return "text-gray-600 border-gray-200"
    default:
      return "text-gray-600 border-gray-200"
  }
}
