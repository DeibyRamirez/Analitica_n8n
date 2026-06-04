import { SidebarProvider } from '@/components/ui/sidebar'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function Home() {
  return (
    <SidebarProvider>
      <SidebarNav />
      <DashboardContent />
    </SidebarProvider>
  )
}
