export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col p-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">My Projects</h1>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-14"></div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-10"></div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-14"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b">
                <td className="p-4 align-middle">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </td>
                <td className="p-4 align-middle">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-6"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}