import { Header } from '@/components/Header'
import React, { ReactNode } from 'react'
import { Box, EyeOff, Grid3X3, Scan, SquareMousePointer, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function CanvasHeaderIcons() {
  return (
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-1 hover:bg-gray-100 rounded">
            <SquareMousePointer className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select Object</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Scan className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Fit View</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Box className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Show Solid</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Grid3X3 className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Show Grid</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-1 hover:bg-gray-100 rounded">
            <EyeOff className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Hide Object</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Trash2 className="w-4 h-4 text-red-700" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default function CanvasLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="w-full h-screen canvas">
      <Header compact className='border-b'>
        <CanvasHeaderIcons />
      </Header>
      {children}
    </div>
  )
}