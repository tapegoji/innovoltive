import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconBook, IconFolder } from "@tabler/icons-react"
import { MdPublic } from "react-icons/md";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "My Projects",
    url: "/my-projects",
    icon: IconFolder,
  }, 
  {
    title: "Demo Projects",
    url: "/demo-projects",
    icon: MdPublic,
  },
  {
    title: "Documentation",
    url: "/documentation",
    icon: IconBook,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="pt-12">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}