import * as dotenv from 'dotenv'

async function inspectTable() {
  dotenv.config({ path: '.env.local' })
  const { supabase } = await import('./src/lib/supabase.js')

  try {
    // Try to select all columns from projects table
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error inspecting projects:', error)
    } else if (data && data.length > 0) {
      console.log('Projects table columns:', Object.keys(data[0]))
      console.log('Sample data:', data[0])
    } else {
      console.log('No data in projects table')
    }

    // Try user_projects
    const { data: data2, error: error2 } = await supabase
      .from('user_projects')
      .select('*')
      .limit(1)

    if (error2) {
      console.error('Error inspecting user_projects:', error2)
    } else if (data2 && data2.length > 0) {
      console.log('User_projects table columns:', Object.keys(data2[0]))
      console.log('Sample data:', data2[0])
    } else {
      console.log('No data in user_projects table')
    }
  } catch (err) {
    console.error('Error inspecting table:', err)
  }
}

inspectTable()