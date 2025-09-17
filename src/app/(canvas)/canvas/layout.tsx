'use client'

import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import React, { ReactNode } from 'react'
import CanvasHeaderIcons from '@/components/canvas/canvas-header-icons'

export default function CanvasLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="w-full h-screen canvas overflow-hidden">
      <Header compact className='border-b'>
        <CanvasHeaderIcons />
      </Header>
      {children}
      <Footer />
    </div>
  )
}