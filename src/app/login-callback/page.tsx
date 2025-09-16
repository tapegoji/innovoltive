import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function LoginCallbackPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // User is authenticated, redirect to dashboard
  redirect('/dashboard')
}