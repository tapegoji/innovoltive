import * as dotenv from 'dotenv'
import postgres from 'postgres'

async function inspectTable() {
  dotenv.config({ path: '.env.local' })

  // Use direct PostgreSQL connection
  const sql = postgres(process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database_name')

  try {
    // Try to select all columns from projects table
    const projects = await sql`
      SELECT * FROM projects LIMIT 1
    `

    if (projects.length > 0) {
      console.log('Projects table columns:', Object.keys(projects[0]))
      console.log('Sample data:', projects[0])
    } else {
      console.log('No data in projects table')
    }

    // Try user_projects
    const userProjects = await sql`
      SELECT * FROM user_projects LIMIT 1
    `

    if (userProjects.length > 0) {
      console.log('User_projects table columns:', Object.keys(userProjects[0]))
      console.log('Sample data:', userProjects[0])
    } else {
      console.log('No data in user_projects table')
    }
  } catch (err) {
    console.error('Error inspecting table:', err)
  } finally {
    await sql.end()
  }
}

inspectTable()