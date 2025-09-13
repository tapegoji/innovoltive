export interface Project {
  id: string
  name: string
  type: "em" | "ht" | "cfd" | "mp"
  description?: string
  size?: string
  date_modified: string
  status: "active" | "completed" | "paused" | "archived"
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}