export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects Dashboard</h1>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Loading skeleton cards */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-6 shadow-sm animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>

              <div className="mt-3">
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}