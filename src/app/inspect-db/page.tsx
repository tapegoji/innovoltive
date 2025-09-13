'use client'

import React from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseInspectorPage() {
  const [userProjectsData, setUserProjectsData] = React.useState<any>(null)
  const [projectsData, setProjectsData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function inspectDatabase() {
      try {
        setLoading(true)
        setError(null)

        // Check user_projects table
        console.log('Querying user_projects table...')
        const { data: userProjects, error: userProjectsError } = await supabase
          .from('user_projects')
          .select('*')
          .limit(5)

        if (userProjectsError) {
          console.error('user_projects error:', userProjectsError)
        } else {
          console.log('user_projects data:', userProjects)
          setUserProjectsData({
            count: userProjects?.length || 0,
            sample: userProjects?.[0] || null,
            allData: userProjects || []
          })
        }

        // Check if there's a separate projects table
        console.log('Checking for projects table...')
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .limit(5)

        if (projectsError) {
          console.error('projects error:', projectsError)
          setProjectsData({ error: projectsError.message })
        } else {
          console.log('projects data:', projects)
          setProjectsData({
            count: projects?.length || 0,
            sample: projects?.[0] || null,
            allData: projects || []
          })
        }

      } catch (err) {
        console.error('Database inspection error:', err)
        setError(`Error: ${(err as any)?.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    inspectDatabase()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Database Inspector</h1>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Database Inspector</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-6">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* user_projects table */}
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">user_projects Table</h2>
          {userProjectsData ? (
            <div className="space-y-4">
              <p><strong>Count:</strong> {userProjectsData.count} records</p>
              
              {userProjectsData.sample && (
                <div>
                  <h3 className="font-semibold mb-2">Sample Record Structure:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(userProjectsData.sample, null, 2)}
                  </pre>
                </div>
              )}

              {userProjectsData.allData.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">All Records:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                    {JSON.stringify(userProjectsData.allData, null, 2)}
                  </pre>
                </div>
              )}
              
              {userProjectsData.count === 0 && (
                <p className="text-gray-600">No records found in user_projects table</p>
              )}
            </div>
          ) : (
            <p className="text-red-600">Failed to query user_projects table</p>
          )}
        </div>

        {/* projects table */}
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">projects Table</h2>
          {projectsData?.error ? (
            <p className="text-yellow-600">projects table error: {projectsData.error}</p>
          ) : projectsData ? (
            <div className="space-y-4">
              <p><strong>Count:</strong> {projectsData.count} records</p>
              
              {projectsData.sample && (
                <div>
                  <h3 className="font-semibold mb-2">Sample Record Structure:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(projectsData.sample, null, 2)}
                  </pre>
                </div>
              )}

              {projectsData.allData.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">All Records:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                    {JSON.stringify(projectsData.allData, null, 2)}
                  </pre>
                </div>
              )}
              
              {projectsData.count === 0 && (
                <p className="text-gray-600">No records found in projects table</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">projects table not found or inaccessible</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800">Database Schema Analysis</h3>
        <p className="text-blue-700 mt-2">
          This page helps understand your database structure to create the appropriate add project dialog.
        </p>
      </div>
    </div>
  )
}