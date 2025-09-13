import * as dotenv from 'dotenv'

const now = new Date();

const projects = [
  { id: "1", name: "Electromagnetic Analysis", type: "em", description: "3D electromagnetic field simulation and modeling", date_modified: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), size: "15.2 MB", status: "active" },
  { id: "2", name: "Heat Transfer Study", type: "ht", description: "Thermal analysis and heat dissipation modeling", date_modified: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), size: "8.7 MB", status: "completed" },
  { id: "3", name: "CFD Simulation Model", type: "cfd", description: "Computational fluid dynamics analysis", date_modified: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), size: "42.1 MB", status: "active" },
  { id: "4", name: "Multiphysics Analysis", type: "mp", description: "Combined electromagnetic and thermal simulation", date_modified: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), size: "6.3 MB", status: "paused" },
  { id: "5", name: "EM Motor Design", type: "em", description: "Electric motor electromagnetic optimization", date_modified: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), size: "12.8 MB", status: "archived" },
  { id: "6", name: "Cooling System CFD", type: "cfd", description: "Airflow and cooling system optimization", date_modified: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(), size: "28.4 MB", status: "completed" }
]

async function insertProjects() {
  dotenv.config({ path: '.env.local' })
  const { supabase } = await import('./src/lib/supabase.js')

  try {
    console.log('Inserting projects into database...')

    // Assuming we need a user_id, using a placeholder. In real scenario, this would be from auth.
    const userId = '550e8400-e29b-41d4-a716-446655440000' // Fake user ID

    for (const project of projects) {
      const { id, ...projectData } = project;
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          id,
          ...projectData
        }])

      if (error) {
        console.error('Error inserting project:', project.name, error)
      } else {
        console.log('Inserted project:', project.name)
      }
    }

    console.log('Finished inserting projects.')
  } catch (err) {
    console.error('Error:', err)
  }
}

insertProjects()