"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PackageCheck,
  Wrench,
  Camera,
} from "lucide-react"

const bottomNavLinks = [
  { href: "/obra/dashboard", label: "Inventario", icon: LayoutDashboard },
  { href: "/obra/recepciones", label: "Recepciones", icon: PackageCheck },
  { href: "/obra/instalaciones", label: "Instalaciones", icon: Wrench },
  { href: "/obra/fotos", label: "Fotos", icon: Camera },
]

export default function ObraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7]">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-marble-200 bg-white/95 backdrop-blur-lg">
        <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          {bottomNavLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-marble-950"
                    : "text-marble-400 active:text-marble-600"
                )}
              >
                <link.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-golden" : "text-marble-400"
                  )}
                />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
