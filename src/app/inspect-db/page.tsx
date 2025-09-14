import React from 'react'
import { getSupabaseClient } from '@/lib/supabase'

async function inspectDatabase() {
  const supabase = getSupabaseClient()
  
  try {
    // Check user_projects table
    const { data: userProjects, error: userProjectsError } = await supabase
      .from('user_projects')
      .select('*')
      .limit(5)

    // Check projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5)

    return {
      userProjects: {
        data: userProjects,
        error: userProjectsError
      },
      projects: {
        data: projects,
        error: projectsError
      }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export default async function DatabaseInspectorPage() {
  const result = await inspectDatabase()

  if (result.error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Database Inspector</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-6">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700">{result.error}</p>
        </div>
      </div>
    )
  }

  if (!result.userProjects || !result.projects) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Database Inspector</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-6">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700">Failed to fetch database information</p>
        </div>
      </div>
    )
  }

  const userProjectsData = result.userProjects.data
  const projectsData = result.projects.data

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Database Inspector</h1>
      
      <div className="space-y-6">
        {/* user_projects table */}
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">user_projects Table</h2>
          {result.userProjects.error ? (
            <p className="text-red-600">Error: {result.userProjects.error.message}</p>
          ) : (
            <div className="space-y-4">
              <p><strong>Count:</strong> {userProjectsData?.length || 0} records</p>
              
              {userProjectsData && userProjectsData.length > 0 && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">Sample Record Structure:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(userProjectsData[0], null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">All Records:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                      {JSON.stringify(userProjectsData, null, 2)}
                    </pre>
                  </div>
                </>
              )}
              
              {(!userProjectsData || userProjectsData.length === 0) && (
                <p className="text-gray-600">No records found in user_projects table</p>
              )}
            </div>
          )}
        </div>

        {/* projects table */}
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">projects Table</h2>
          {result.projects.error ? (
            <p className="text-yellow-600">projects table error: {result.projects.error.message}</p>
          ) : (
            <div className="space-y-4">
              <p><strong>Count:</strong> {projectsData?.length || 0} records</p>
              
              {projectsData && projectsData.length > 0 && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">Sample Record Structure:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(projectsData[0], null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">All Records:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                      {JSON.stringify(projectsData, null, 2)}
                    </pre>
                  </div>
                </>
              )}
              
              {(!projectsData || projectsData.length === 0) && (
                <p className="text-gray-600">No records found in projects table</p>
              )}
            </div>
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