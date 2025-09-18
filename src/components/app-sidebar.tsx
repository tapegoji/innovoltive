"use client"

import * as React from "react"
import { BookOpen, Settings2, LayoutDashboard } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { ProjectsSidebar } from "./projects-sidebar"
import { DocsSidebar } from "./docs-sidebar"
import { SettingsSidebar } from "./settings-sidebar"

// This is adapted data for nested sidebar
const projectsData = {
  title: "Projects",
  url: "/my-projects",
  icon: LayoutDashboard,
  isActive: true,
};

const documentationData = {
  title: "Documentation",
  url: "/documentation",
  icon: BookOpen,
  isActive: false,
};

const settingsData = {
  title: "Settings",
  url: "/settings",
  icon: Settings2,
  isActive: false,
};

const navMain = [projectsData, documentationData, settingsData];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(navMain[0])
  const { setOpen, open } = useSidebar()

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <SidebarTrigger className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">InnoVoltive</span>
                    <span className="truncate text-xs">Product</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        if (activeItem?.title === item.title) {
                          // If clicking the same active item, toggle the sidebar
                          setOpen(!open)
                        } else {
                          // If clicking a different item, set it as active and open sidebar
                          setActiveItem(item)
                          setOpen(true)
                        }
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="text-foreground text-base font-medium">
            {activeItem?.title}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {activeItem?.title === "Projects" && <ProjectsSidebar />}
              {activeItem?.title === "Documentation" && <DocsSidebar />}
              {activeItem?.title === "Settings" && <SettingsSidebar />}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
