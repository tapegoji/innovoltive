import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/Header"
import Footer from "@/components/Footer"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center border-b px-2 bg-sidebar">
          <SidebarTrigger />
          <div className="flex-1">
            <Header compact/>
          </div>
        </div>
        {children}
      </main>
      <Footer />
    </SidebarProvider>
  )
}