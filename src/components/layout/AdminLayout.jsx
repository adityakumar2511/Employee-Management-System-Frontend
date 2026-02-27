"use client"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

export default function AdminLayout({ children, title = "Admin" }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role="admin" />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
