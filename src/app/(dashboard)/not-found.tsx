import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p className="text-muted-foreground">
        The resource you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button>Go to Homepage</Button>
      </Link>
    </main>
  )
}