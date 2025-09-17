'use client'

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getProjectFiles } from '@/lib/actions';

export interface FileNode {
  id: string
  name: string
  isFolder: boolean
  children?: FileNode[]
}

interface FileTreeItemProps {
  node: FileNode
  depth?: number
  onFileClick: (node: FileNode) => void
  className?: string
}

// Individual file tree item component
function FileTreeItem({ node, depth = 0, onFileClick, className = '' }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!node.isFolder) {
    return (
      <div 
        className={`flex items-center text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 px-1 py-0.5 rounded cursor-pointer text-xs ${className}`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => onFileClick(node)}
      >
        <span className="mr-2">📄</span>
        <span className="truncate">{node.name}</span>
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div 
          className={`flex items-center text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 px-1 py-0.5 rounded cursor-pointer text-xs w-full ${className}`}
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          <ChevronRight 
            size={12} 
            className={`mr-1 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
          />
          <span className="mr-2">📁</span>
          <span className="truncate">{node.name}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {node.children?.map(child => (
          <FileTreeItem 
            key={child.id} 
            node={child} 
            depth={depth + 1} 
            onFileClick={onFileClick}
            className={className}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface FileTreeProps {
  projectHash?: string
  data?: FileNode[]
  onFileClick: (node: FileNode) => void
  className?: string
  maxHeight?: string
  loadingText?: string
  emptyText?: string
}

export function FileTree({ 
  projectHash, 
  data,
  onFileClick, 
  className = '',
  maxHeight = 'max-h-48',
  loadingText = 'Loading files...',
  emptyText = 'No files found'
}: FileTreeProps) {
  const [fileData, setFileData] = useState<FileNode[]>(data || [])
  const [loading, setLoading] = useState(false)

  // Load files from server if projectHash is provided
  useEffect(() => {
    if (!projectHash) return
    
    const loadFiles = async () => {
      setLoading(true)
      try {
        const result = await getProjectFiles(projectHash)
        if (result.success && result.tree) {
          setFileData(result.tree)
        }
      } catch (error) {
        console.error('Error loading files:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFiles()
  }, [projectHash])

  // Update local state when data prop changes
  useEffect(() => {
    if (data) {
      setFileData(data)
    }
  }, [data])

  return (
    <div className={`${maxHeight} overflow-y-auto text-xs ${className}`}>
      {loading ? (
        <div className="text-xs text-sidebar-foreground/60 italic p-1">
          {loadingText}
        </div>
      ) : fileData.length > 0 ? (
        <div>
          {fileData.map(node => (
            <FileTreeItem 
              key={node.id} 
              node={node} 
              onFileClick={onFileClick} 
            />
          ))}
        </div>
      ) : (
        <div className="text-xs text-sidebar-foreground/40 italic p-1">
          {emptyText}
        </div>
      )}
    </div>
  )
}

export default FileTree