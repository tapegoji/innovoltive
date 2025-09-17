'use client'

import { RxDragHandleDots2 } from "react-icons/rx";
import { Rnd } from 'react-rnd'
import Link from 'next/link'
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { FileTree, type FileNode } from '@/components/ui/file-tree';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ControlPanelProps {
  projectName?: string
  projectHash?: string
}

export function ControlPanel({ projectName, projectHash }: ControlPanelProps) {
  const isMobile = useIsMobile();
  
  // Separate states for mobile and desktop
  const [isVisibleMobile, setIsVisibleMobile] = useState(false)
  const [isVisibleDesktop, setIsVisibleDesktop] = useState(true)
  
  const isVisible = isMobile ? isVisibleMobile : isVisibleDesktop;
  const setIsVisible = isMobile ? setIsVisibleMobile : setIsVisibleDesktop;

  const handleFileClick = (node: FileNode) => {
    console.log('File clicked:', node)
    // Add your file handling logic here
  }

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
            
            {/* Geometry Section */}
            <Collapsible className="group/collapsible">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between text-xs font-bold text-sidebar-foreground/80 hover:text-sidebar-foreground cursor-pointer py-1">
                  <span>Geometry</span>
                  <Plus className="h-3 w-3 group-data-[state=open]/collapsible:hidden" />
                  <Minus className="h-3 w-3 group-data-[state=closed]/collapsible:hidden" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-2 py-1 text-xs text-sidebar-foreground/70">
                  {/* Geometry tools will go here */}
                  <div>Create shapes</div>
                  <div>Edit geometry</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Mesh Section */}
            <Collapsible className="group/collapsible">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between text-xs font-bold text-sidebar-foreground/80 hover:text-sidebar-foreground cursor-pointer py-1">
                  <span>Mesh</span>
                  <Plus className="h-3 w-3 group-data-[state=open]/collapsible:hidden" />
                  <Minus className="h-3 w-3 group-data-[state=closed]/collapsible:hidden" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-2 py-1 text-xs text-sidebar-foreground/70">
                  {/* Mesh tools will go here */}
                  <div>Generate mesh</div>
                  <div>Refine mesh</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Simulation Section */}
            <Collapsible className="group/collapsible">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between text-xs font-bold text-sidebar-foreground/80 hover:text-sidebar-foreground cursor-pointer py-1">
                  <span>Simulation</span>
                  <Plus className="h-3 w-3 group-data-[state=open]/collapsible:hidden" />
                  <Minus className="h-3 w-3 group-data-[state=closed]/collapsible:hidden" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-2 py-1 text-xs text-sidebar-foreground/70">
                  {/* Simulation tools will go here */}
                  <div>Run simulation</div>
                  <div>View results</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Files Section */}
            <Collapsible className="group/collapsible">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between text-xs font-bold text-sidebar-foreground/80 hover:text-sidebar-foreground cursor-pointer py-1">
                  <span>Files</span>
                  <Plus className="h-3 w-3 group-data-[state=open]/collapsible:hidden" />
                  <Minus className="h-3 w-3 group-data-[state=closed]/collapsible:hidden" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <FileTree
                  projectHash={projectHash}
                  onFileClick={handleFileClick}
                  maxHeight="max-h-40"
                  loadingText="Loading files..."
                  emptyText="No files found"
                />
              </CollapsibleContent>
            </Collapsible>
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