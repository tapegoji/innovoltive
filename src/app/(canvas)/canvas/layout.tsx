'use client'

import { Header } from '@/components/Header'
import React, { ReactNode } from 'react'
import { Box, EyeOff, Grid3X3, Scan, SquareMousePointer, Trash2, MoreHorizontal } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'

function CanvasHeaderIcons() {
  const isMobile = useIsMobile()

  const iconButtons = [
    { icon: SquareMousePointer, label: 'Select Object', className: '' },
    { icon: Scan, label: 'Fit View', className: '' },
    { icon: Box, label: 'Show Solid', className: '' },
    { icon: Grid3X3, label: 'Show Grid', className: '' },
    { icon: EyeOff, label: 'Hide Object', className: '' },
    { icon: Trash2, label: 'Delete', className: 'text-red-700' },
  ]

  if (isMobile) {
    // On mobile, show only the first two icons and group the rest in a dropdown
    const primaryIcons = iconButtons.slice(0, 2)
    const secondaryIcons = iconButtons.slice(2)

    return (
      <div className="flex items-center gap-2">
        {primaryIcons.map(({ icon: Icon, label, className }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Icon className={`w-4 h-4 ${className}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {secondaryIcons.map(({ icon: Icon, label, className }) => (
              <DropdownMenuItem key={label} className="cursor-pointer">
                <Icon className={`w-4 h-4 mr-2 ${className}`} />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Desktop: show all icons in a row
  return (
    <div className="flex items-center gap-3">
      {iconButtons.map(({ icon: Icon, label, className }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Icon className={`w-4 h-4 ${className}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

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
    </div>
  )
}