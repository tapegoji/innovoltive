'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PanelLeftIcon } from "lucide-react"
import { useSidebar } from "./ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export default function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <>
    {isMobile && (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-6", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon className="size-6"/>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
    )}
    </>
  )
}