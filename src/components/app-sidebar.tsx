"use client"

import * as React from "react"
import { BookOpen, Settings2, Folder, Globe, LayoutDashboard, Minus, Plus } from "lucide-react"
import Link from "next/link"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// This is adapted data for nested sidebar
const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Projects",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
      {
        title: "My Projects",
        url: "/my-projects",
        icon: Folder,
        isActive: false,
      },
      {
        title: "Public Projects",
        url: "/public-projects",
        icon: Globe,
        isActive: false,
      },
      ]
    },
      
    {
      title: "Documentation",
      url: "/documentation",
      icon: BookOpen,
      isActive: false,
      items: [
        {
          title: "Quick Reference",
          url: "/documentation/quick-reference",
        },
        {
          title: "Get Started",
          url: "/documentation/get-started",
        },
        {
          title: "Tutorials",
          url: "/documentation/tutorials",
        },
        {
          title: "Changelog",
          url: "/documentation/changelog",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Team",
          url: "/settings/team",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Limits",
          url: "/settings/limits",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
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
                {data.navMain.map((item) => (
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
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="text-foreground text-base font-medium">
            {activeItem?.title}
          </div>
          {activeItem?.title === "Documentation" && (
            <SidebarInput placeholder="Type to search..." />
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {activeItem?.items ? (
                <SidebarMenu>
                  {activeItem.items.map((subItem: any) => (
                    <Collapsible
                      key={subItem.title}
                      asChild
                      defaultOpen={false}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={subItem.title}>
                            {'icon' in subItem && subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                            <Plus className="ml-auto transition-all duration-200 group-data-[state=open]/collapsible:hidden" />
                            <Minus className="ml-auto transition-all duration-200 group-data-[state=closed]/collapsible:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>View {subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  No sub-items for {activeItem?.title}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
