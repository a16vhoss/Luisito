"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  HardHat,
  Users,
  Warehouse,
  Truck,
  DollarSign,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
} from "lucide-react"

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/obras", label: "Obras", icon: HardHat },
  { href: "/personal", label: "Personal", icon: Users },
  { href: "/almacen", label: "Almacén", icon: Warehouse },
  { href: "/choferes", label: "Choferes", icon: Truck },
  { href: "/finanzas", label: "Finanzas", icon: DollarSign },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export default function DirectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F7]">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-[#E0DBD1] bg-white transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#E0DBD1] px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E1A14]">
                <span className="text-sm font-bold text-[#D4A843]">MC</span>
              </div>
              <div>
                <span className="text-sm font-bold tracking-wider text-[#1E1A14]">
                  MÁRMOL CALIBE
                </span>
                <p className="text-[10px] text-[#7A6D5A]">Panel Director</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E1A14]">
                <span className="text-sm font-bold text-[#D4A843]">MC</span>
              </div>
            </Link>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#1E1A14] text-white"
                    : "text-[#7A6D5A] hover:bg-[#F0EDE8] hover:text-[#1E1A14]"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-[#E0DBD1] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[#7A6D5A] hover:bg-[#F0EDE8]"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Colapsar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-[#E0DBD1] bg-white px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6D5A]" />
              <input
                type="text"
                placeholder="Buscar obras, personal, materiales..."
                className="h-9 w-80 rounded-lg border border-[#E0DBD1] bg-[#FAF9F7] pl-9 pr-4 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-[#7A6D5A] hover:bg-[#F0EDE8]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
            </button>
            <div className="h-6 w-px bg-[#E0DBD1]" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A843] text-xs font-bold text-white">
                AH
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#1E1A14]">Andrée Hossfeldt</p>
                <p className="text-xs text-[#7A6D5A]">Director General</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
