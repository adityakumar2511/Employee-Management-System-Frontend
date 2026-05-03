"use client"
import { memo } from "react"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

// ✅ Sidebar aur TopBar memo — tab change par re-render nahi honge
const MemoSidebar = memo(function MemoSidebar() {
  return <Sidebar role="admin" />
})

const MemoTopBar = memo(function MemoTopBar({ title }) {
  return <TopBar title={title} />
})

export default function AdminLayout({ children, title = "Admin" }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <MemoSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MemoTopBar title={title} />
        <main className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}