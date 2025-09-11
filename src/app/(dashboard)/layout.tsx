import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/Header"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center h-10 border-b px-2">
          <SidebarTrigger />
          <div className="flex-1 ml-2">
            <Header />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}