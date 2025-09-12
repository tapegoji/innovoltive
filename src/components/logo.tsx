import Icon from '@mdi/react'
import { mdiShapePlus } from '@mdi/js'
import Link from 'next/link'

interface LogoProps {
  withLink?: boolean
  className?: string
}

export function Logo({ withLink = true, className = "" }: LogoProps) {
  const logoContent = (
    <>
      <Icon path={mdiShapePlus} size={1} className="text-primary" />
      <h1 className={`text-2xl font-bold ${className}`}>InFEM</h1>
    </>
  )

  if (!withLink) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {logoContent}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/" className={`flex items-center space-x-2 hover:opacity-80 transition-opacity ${className}`}>
        {logoContent}
      </Link>
    </div>
  )
}