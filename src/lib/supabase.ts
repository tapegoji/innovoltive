import { createClient } from '@supabase/supabase-js'

// Server-side only Supabase client
// This should only be used in server components, API routes, and server actions
export function getSupabaseClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase client should only be used on the server side')
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_API_KEY!

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_API_KEY environment variable')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Legacy export for backwards compatibility - but only works server-side
export const supabase = getSupabaseClient()