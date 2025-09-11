'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RxDragHandleDots2 } from "react-icons/rx";
import { Rnd } from 'react-rnd'
import Link from 'next/link'
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function ControlPanel() {
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
        className="fixed top-2 left-2 z-[100] w-10 h-10 bg-sidebar text-sidebar-foreground rounded-lg shadow-lg hover:bg-sidebar-accent transition-colors flex items-center justify-center border border-sidebar-border"
        title="Open Control Panel"
      >
        <IconMenu2 size={20} />
      </button>
    );
  }

  return (
    <Rnd
      default={{
        x: 8,
        y: 8,
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
        <Card className="flex-1 p-1 mb-0 border-0 shadow-none bg-sidebar">
          <CardHeader className="p-1 max-h-8 border-b border-sidebar-border">
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
          </CardHeader>
          <CardContent className="p-1 h-full">
            <div className="space-y-2 pt-0 text-sm text-sidebar-foreground">
              <div>Geometry</div>
              <div>Mesh</div>
              <div>Simulation</div>
            </div>
          </CardContent>
        </Card>
        <div className="px-2 py-1 border-t border-sidebar-border bg-sidebar-accent/50">
          <Link
            href="/dashboard"
            className="text-xs text-sidebar-primary hover:text-sidebar-primary/80 transition-colors block text-center"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </Rnd>
  )
}