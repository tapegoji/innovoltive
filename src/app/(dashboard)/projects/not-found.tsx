import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Not Found | Projects',
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects Dashboard</h1>
      </div>
      
      <div className="mt-12 text-center">
        <div className="mx-auto h-24 w-24 text-muted-foreground mb-4">
          <svg
            className="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Projects Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The projects page you're looking for doesn't exist.
        </p>
        <a 
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  )
}