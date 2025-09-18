'use client'

import React, { ReactNode } from 'react'

export default function CanvasLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  )
}