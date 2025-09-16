import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, Home, ArrowLeft } from 'lucide-react'

export default function MyProjectsNotFound() {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Project Not Found</CardTitle>
          <CardDescription className="text-center">
            The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Link href="/my-projects" className="w-full">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Projects
              </Button>
            </Link>
            
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}