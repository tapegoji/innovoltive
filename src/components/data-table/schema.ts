import { z } from "zod"

// Schema matching the ProjectData interface from the backend
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  size: z.string(),
  date_modified: z.string(),
  user_id: z.string(),
  description: z.string(),
})

export type Project = z.infer<typeof projectSchema>
