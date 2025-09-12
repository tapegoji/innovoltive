import { Header } from '@/components/Header'
import React, { ReactNode } from 'react'
import { Box } from 'lucide-react'

export default function CanvasLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="w-full h-screen canvas">
      <Header compact className='border-b'>
        <Box className="w-4 h-4" />
      </Header>
      {children}
    </div>
  )
}