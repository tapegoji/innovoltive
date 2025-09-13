"use client"

import * as React from "react"
import { Folder, File, Grid3X3, List, ArrowUpDown, Calendar, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"

export interface FileItem {
  id: string
  name: string
  type: "em" | "ht" | "cfd" | "mp" | "folder" | "file"
  size?: string
  dateModified: string
  description?: string
  path: string
  status: "active" | "completed" | "paused" | "archived"
  icon?: React.ComponentType<{ className?: string }>
}

interface FileExplorerProps {
  items: FileItem[]
  currentPath?: string[]
  onNavigate?: (path: string[]) => void
  onItemClick?: (item: FileItem) => void
  onItemDoubleClick?: (item: FileItem) => void
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
}

export function FileExplorer({
  items,
  currentPath = ["My Projects"],
  onNavigate,
  onItemClick,
  onItemDoubleClick,
  viewMode = "list",
  onViewModeChange,
}: FileExplorerProps) {
  const [sortBy, setSortBy] = React.useState<"name" | "date" | "size" | "status" | "type">("name")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      // Projects come first, then folders, then files
      const getTypePriority = (type: string) => {
        if (["em", "ht", "cfd", "mp"].includes(type)) return 0
        if (type === "folder") return 1
        return 2
      }
      
      const aPriority = getTypePriority(a.type)
      const bPriority = getTypePriority(b.type)
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "date":
          comparison = new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime()
          break
        case "size":
          // For simplicity, just compare by string
          comparison = (a.size || "").localeCompare(b.size || "")
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [items, sortBy, sortOrder])

  const handleSort = (newSortBy: "name" | "date" | "size" | "status" | "type") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    if (onNavigate) {
      onNavigate(currentPath.slice(0, index + 1))
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-3">
        <div className="flex items-center justify-between">
          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <HardDrive className="h-4 w-4" />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {currentPath.map((segment, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <BreadcrumbPage>{segment}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handleBreadcrumbClick(index)
                        }}
                      >
                        {segment}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < currentPath.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("type")}>
                  Type {sortBy === "type" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("date")}>
                  Date Modified {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("size")}>
                  Size {sortBy === "size" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange?.("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange?.("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* File Explorer Content */}
      <div className="flex-1 p-4 overflow-auto">
        {viewMode === "grid" ? (
          <GridView
            items={sortedItems}
            onItemClick={onItemClick}
            onItemDoubleClick={onItemDoubleClick}
          />
        ) : (
          <ListView
            items={sortedItems}
            onItemClick={onItemClick}
            onItemDoubleClick={onItemDoubleClick}
          />
        )}
      </div>
    </div>
  )
}

function GridView({
  items,
  onItemClick,
  onItemDoubleClick,
}: {
  items: FileItem[]
  onItemClick?: (item: FileItem) => void
  onItemDoubleClick?: (item: FileItem) => void
}) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <Card
          key={item.id}
          className={cn(
            "p-3 cursor-pointer hover:bg-accent/50 transition-colors",
            "border-0 shadow-none hover:shadow-sm"
          )}
          onClick={() => onItemClick?.(item)}
          onDoubleClick={() => onItemDoubleClick?.(item)}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex-shrink-0">
              {item.type === "folder" ? (
                <Folder className="h-12 w-12 text-blue-500" />
              ) : item.icon ? (
                <item.icon className="h-12 w-12 text-gray-600" />
              ) : (
                <File className="h-12 w-12 text-gray-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" title={item.name}>
                {item.name}
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground truncate" title={item.description}>
                  {item.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {item.dateModified}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function ListView({
  items,
  onItemClick,
  onItemDoubleClick,
}: {
  items: FileItem[]
  onItemClick?: (item: FileItem) => void
  onItemDoubleClick?: (item: FileItem) => void
}) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-3 py-2 text-sm font-medium text-muted-foreground border-b">
        <div className="col-span-4">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Date Modified</div>
        <div className="col-span-2">Size</div>
      </div>

      {/* Items */}
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "grid grid-cols-12 gap-4 px-3 py-2 text-sm cursor-pointer",
            "hover:bg-accent/50 rounded transition-colors"
          )}
          onClick={() => onItemClick?.(item)}
          onDoubleClick={() => onItemDoubleClick?.(item)}
        >
          <div className="col-span-4 flex items-center space-x-2 min-w-0">
            {["em", "ht", "cfd", "mp"].includes(item.type) ? (
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : item.type === "folder" ? (
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : item.icon ? (
              <item.icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
            ) : (
              <File className="h-4 w-4 text-gray-600 flex-shrink-0" />
            )}
            <span className="truncate font-medium" title={item.name}>
              {item.name}
            </span>
          </div>
          <div className="col-span-2 text-muted-foreground">
            {item.type === "em" ? "EM" : 
             item.type === "ht" ? "HT" : 
             item.type === "cfd" ? "CFD" : 
             item.type === "mp" ? "MP" : 
             item.type === "folder" ? "Folder" : "File"}
          </div>
          <div className="col-span-2">
            <span className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              item.status === "active" && "bg-green-100 text-green-800",
              item.status === "completed" && "bg-blue-100 text-blue-800",
              item.status === "paused" && "bg-yellow-100 text-yellow-800",
              item.status === "archived" && "bg-gray-100 text-gray-800"
            )}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
          <div className="col-span-2 text-muted-foreground">
            {item.dateModified}
          </div>
          <div className="col-span-2 text-muted-foreground">
            {item.size || "-"}
          </div>
        </div>
      ))}
    </div>
  )
}