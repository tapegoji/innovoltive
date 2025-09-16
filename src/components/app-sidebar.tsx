'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { IconBook, IconFolder, IconRocket, IconSettings, IconShare, IconArchive, IconDevices, IconMenu2, IconX, IconCircleX } from "@tabler/icons-react"
import { MdPublic } from "react-icons/md";
import { Plus, Minus } from "lucide-react"
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

// Menu items.
const items = [
  {
    title: "My Projects",
    url: "/my-projects",
    icon: IconFolder,
  }, 
  {
    title: "Public Projects",
    url: "/public-projects",
    icon: MdPublic,
  },
  {
    title: "Documentation",
    url: "/documentation",
    icon: IconBook,
    items: [
      {
        title: "Table of Contents",
        url: "/documentation",
        icon: IconBook,
      },
      {
        title: "Quick Reference",
        url: "/documentation?section=quick-reference",
        icon: IconMenu2,
      },
      {
        title: "Getting Started",
        url: "/documentation?section=getting-started",
        icon: IconRocket,
      },
      {
        title: "Project Management",
        url: "/documentation?section=project-management",
        icon: IconSettings,
      },
      {
        title: "Sharing & Collaboration",
        url: "/documentation?section=sharing-collaboration",
        icon: IconShare,
      },
      {
        title: "Project Organization",
        url: "/documentation?section=project-organization",
        icon: IconArchive,
      },
      {
        title: "3D Canvas Workspace",
        url: "/documentation?section=canvas-workspace",
        icon: IconDevices,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname();
  
  return (
    <Sidebar>
      <SidebarContent>
        <Suspense fallback={<div>Loading...</div>}>
          <SidebarContentWithSearchParams pathname={pathname} />
        </Suspense>
      </SidebarContent>
    </Sidebar>
  )
}

function SidebarContentWithSearchParams({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const { isMobile, setOpenMobile, setOpen } = useSidebar();

  const handleCloseSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <SidebarGroup className="pt-0">
      <div className="flex h-8 justify-between">
        <SidebarGroupLabel className="text-md font-bold">Dashboard</SidebarGroupLabel>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCloseSidebar}
        >
          <IconX className="size-6" />
        </Button>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || (pathname === "/documentation" && !section && item.url === "/documentation");
            
            // Handle items with sub-items (like Documentation)
            if (item.items?.length) {
                  return (
                    <Collapsible key={item.title} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton suppressHydrationWarning={true}>
                            <item.icon />
                            <span>{item.title}</span>
                            <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                            <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isSubActive = 
                                (pathname === "/documentation" && !section && subItem.url === "/documentation") ||
                                (pathname === "/documentation" && section === subItem.url.split('=')[1]);
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                  >
                                    <Link href={subItem.url}>
                                      <subItem.icon />
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                
                // Handle regular items
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
  )
}