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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { uploadGeometryFiles } from '@/lib/actions';

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    setUploadError(null); // Clear any previous errors
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'model/obj': ['.obj'],
      'model/stl': ['.stl'],
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'model/ply': ['.ply']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (uploadedFiles.length === 0 || !projectHash) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData with files
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      // Call server action
      const result = await uploadGeometryFiles(projectHash, formData);

      if (result.success) {
        console.log('Upload successful:', result.message);
        setImportDialogOpen(false);
        setUploadedFiles([]);
        // Optionally refresh the file tree to show new files
        // You could call a refresh function here
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
                  <Dialog open={importDialogOpen} onOpenChange={(open) => {
                    setImportDialogOpen(open);
                    if (!open) {
                      // Clear state when dialog closes
                      setUploadedFiles([]);
                      setUploadError(null);
                      setIsUploading(false);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <button className="text-left hover:text-sidebar-foreground cursor-pointer flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        Import {simType === 'PCB' ? 'PCB Files' : 'CAD'}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Import Geometry Files
                        </DialogTitle>
                        <DialogDescription>
                          Drag and drop geometry files here, or click to browse. Supports OBJ, STL, GLTF, GLB, and PLY formats.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Dropzone */}
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isDragActive
                              ? 'border-primary bg-primary/5'
                              : isDragReject
                              ? 'border-destructive bg-destructive/5'
                              : 'border-muted-foreground/25 hover:border-primary/50'
                          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input {...getInputProps()} disabled={isUploading} />
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          {isDragActive ? (
                            <p className="text-sm text-primary font-medium">Drop the files here...</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {isUploading ? 'Uploading files...' : 'Drag & drop geometry files here, or click to select'}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Supports: OBJ, STL, GLTF, GLB, PLY (max 50MB each)
                          </p>
                        </div>

                        {/* File List */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Selected Files:</Label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    disabled={isUploading}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {uploadError && (
                          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">{uploadError}</p>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setImportDialogOpen(false)}
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleImport}
                          disabled={uploadedFiles.length === 0 || isUploading || !projectHash}
                        >
                          {isUploading ? 'Uploading...' : `Import ${uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}`}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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