import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  withLink?: boolean
  className?: string
  textSize?: string
}

export function Logo({ withLink = true, className = "", textSize = "text-2xl" }: LogoProps) {
  const logoContent = (
    <>
      <Image src="/infem_logo.svg" alt="InFEM Logo" className="h-6 w-6" width={24} height={24} />
      <h1 className={`font-bold ${textSize}`}>InFEM</h1>
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
    <div className={`flex items-center space-x-2 ${className}`}>
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    </div>
  )
}