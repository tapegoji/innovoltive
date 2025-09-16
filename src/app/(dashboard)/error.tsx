'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  const handleReset = () => {
    reset()
    if (isSignedIn) {
      router.push('/my-projects')
    } else {
      router.push('/')
    }
  }

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4">
      <h2 className="text-center text-xl font-semibold">Something went wrong!</h2>
      <p className="text-center text-muted-foreground">
        We encountered an error while processing your request.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        {isSignedIn && (
          <Button onClick={handleReset}>
            Reset
          </Button>
        )}
        <Link href="/">
          <Button variant="outline">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </main>
  )
}