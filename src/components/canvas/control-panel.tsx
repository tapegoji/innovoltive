'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RxDragHandleDots2 } from "react-icons/rx";
import { Rnd } from 'react-rnd'
import Link from 'next/link'
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ControlPanelProps {
  projectHash?: string
  projectName?: string
}

export function ControlPanel({projectName }: ControlPanelProps) {
  const isMobile = useIsMobile();
  
  // Separate states for mobile and desktop (like sidebar pattern)
  const [isVisibleMobile, setIsVisibleMobile] = useState(false); // Always start hidden on mobile
  const [isVisibleDesktop, setIsVisibleDesktop] = useState(true); // Start visible on desktop
  
  // Helper to get current visibility and setter based on device type
  const isVisible = isMobile ? isVisibleMobile : isVisibleDesktop;
  const setIsVisible = isMobile ? setIsVisibleMobile : setIsVisibleDesktop;

  // Show menu button when panel is hidden
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-9 left-1 z-[100] w-8 h-8 bg-sidebar text-sidebar-foreground rounded shadow-lg hover:bg-sidebar-accent transition-colors flex items-center justify-center border border-sidebar-border"
        title="Open Control Panel"
      >
        <IconMenu2 size={20} />
      </button>
    );
  }

  return (
    <Rnd
      default={{
        x: 4,
        y: 4,
        width: isMobile ? 160 : 250,
        height: isMobile ? 250 : 400
      }}
      minWidth={160}
      minHeight={120}
      maxWidth={250}
      maxHeight={400}
      bounds="parent"
      className="z-[100]"
      dragHandleClassName="drag-handle"
    >
      <div className="h-full flex flex-col bg-sidebar border rounded-lg overflow-hidden">
        <div className="flex-1">
          <div className="p-1 border-b border-sidebar-border">
            <div className="flex text-sm justify-between items-center text-sidebar-foreground">
                <div className="flex-1">
                {isMobile ? 'CP' : 'Control Panel'}
                </div>
              <div className="drag-handle cursor-move flex justify-center">
                <RxDragHandleDots2 size={20} />
              </div>
              <div className="flex-1 flex justify-end space-x-1">
                <IconX 
                  size={16} 
                  className="text-sidebar-foreground/60 hover:text-destructive cursor-pointer transition-colors"
                  onClick={() => setIsVisible(false)}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-sidebar-foreground p-1">
            {projectName && (
              <div className="text-xs font-bold text-sidebar-foreground/80 break-all">
                Project: {projectName}
              </div>
            )}
            <div>Geometry</div>
            <div>Mesh</div>
            <div>Simulation</div>
          </div>
        </div>
        <div className="px-2 py-1 border-t border-sidebar-border bg-sidebar-accent/50">
          <Link
            href="/dashboard"
            className="text-xs text-center"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </Rnd>
  )
}