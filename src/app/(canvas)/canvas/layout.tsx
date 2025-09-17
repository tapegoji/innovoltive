'use client'

import Footer from '@/components/Footer'
import React, { ReactNode } from 'react'

export default function CanvasLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="w-full h-full">
      {children}
      <Footer />
    </div>
  )
}