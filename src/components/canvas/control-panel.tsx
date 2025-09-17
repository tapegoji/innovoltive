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
import { DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { UploadDialog } from './upload-dialog';

interface ControlPanelProps {
    projectData: {
        projectName?: string
        projectHash?: string
        simType?: string
    }
}

export function ControlPanel({ projectData }: ControlPanelProps) {
  const isMobile = useIsMobile();
  const { projectName, projectHash, simType } = projectData;
  
  // Separate states for mobile and desktop
  const [isVisibleMobile, setIsVisibleMobile] = useState(false)
  const [isVisibleDesktop, setIsVisibleDesktop] = useState(true)
  
  const isVisible = isMobile ? isVisibleMobile : isVisibleDesktop;
  const setIsVisible = isMobile ? setIsVisibleMobile : setIsVisibleDesktop;

  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Configure upload settings based on simType
  const uploadConfig = simType === 'PCB' ? {
    acceptedTypes: { 'application/octet-stream': ['.kicad_pcb'] } as Record<string, string[]>,
    dialogTitle: 'Import PCB Files',
    dialogDescription: 'Drag and drop KiCad PCB files here, or click to browse. Supports KiCad PCB formats.',
    supportedFormatsText: 'KiCad PCB'
  } : {
    acceptedTypes: { 'model/step': ['.step', '.stp'] } as Record<string, string[]>,
    dialogTitle: 'Import Geometry Files', 
    dialogDescription: 'Drag and drop geometry files here, or click to browse. Supports STEP and STP formats.',
    supportedFormatsText: 'STEP, STP'
  };

  const handleFileClick = (node: FileNode) => {
    console.log('File clicked:', node)
    // Add your file handling logic here
  }

  // Show menu button when panel is hidden
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-9 left-1 z-[100] w-10 h-10 bg-sidebar text-sidebar-foreground rounded-full shadow-lg  flex items-center justify-center border border-sidebar-border"
        title="Open Control Panel"
      >
        <IconMenu2 size={25} />
      </button>
    );
  }

  return (
    <Rnd
      default={{
        x: 4,
        y: 4,
        width: isMobile ? 250 : 250,
        height: isMobile ? 250 : 600
      }}
      minWidth={160}
      minHeight={160}
      maxHeight= {isMobile ? 400 : 800}
      bounds="parent"
      // Lower z-index so global dialogs (z-50) can overlay it
      className="z-40"
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
            <Collapsible className="group/collapsible" defaultOpen>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between text-xs font-bold text-sidebar-foreground/80 hover:text-sidebar-foreground cursor-pointer py-1">
                  <span>Geometry</span>
                  <Plus className="h-3 w-3 group-data-[state=open]/collapsible:hidden" />
                  <Minus className="h-3 w-3 group-data-[state=closed]/collapsible:hidden" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-2 py-1 text-xs text-sidebar-foreground/70">
                  <button 
                    onClick={() => setImportDialogOpen(true)}
                    className="text-left hover:text-sidebar-foreground cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Import {simType === 'PCB' ? 'PCB Files' : 'CAD'}
                  </button>
                  
                  <UploadDialog
                    open={importDialogOpen}
                    onOpenChange={setImportDialogOpen}
                    projectHash={projectHash}
                    acceptedTypes={uploadConfig.acceptedTypes}
                    dialogTitle={uploadConfig.dialogTitle}
                    dialogDescription={uploadConfig.dialogDescription}
                    supportedFormatsText={uploadConfig.supportedFormatsText}
                  />
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
                  <span>Project Files</span>
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