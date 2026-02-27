import { DM_Sans, Syne, DM_Mono } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { ToastContainer } from "@/components/ui/Toast"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" })
const syne = Syne({ subsets: ["latin"], variable: "--font-display", display: "swap" })
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono", display: "swap" })

export const metadata = {
  title: "EMS Pro — Employee Management System",
  description: "Complete HR & Payroll Management System with Geo-fencing, Firebase Realtime, and Auto Salary Calculation",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
