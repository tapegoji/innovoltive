import * as React from "react"
import { Folder, Globe, LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface ProjectItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
}

const projectsItems: ProjectItem[] = [
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
];

export function ProjectsSidebar() {
  return (
    <SidebarMenu>
      {projectsItems.map((subItem) => (
        <SidebarMenuItem key={subItem.title}>
          <SidebarMenuButton asChild>
            <Link href={subItem.url}>
              {subItem.icon && <subItem.icon />}
              <span>{subItem.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}