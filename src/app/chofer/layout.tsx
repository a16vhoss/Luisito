"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Truck,
  Wrench,
  PackageCheck,
  UserCircle,
} from "lucide-react"

const bottomNavLinks = [
  { href: "/chofer/cargas", label: "Cargas", icon: Truck },
  { href: "/chofer/gasolina", label: "Gasolina", icon: Wrench },
  { href: "/chofer/fotos", label: "Fotos", icon: PackageCheck },
  { href: "/chofer/perfil", label: "Perfil", icon: UserCircle },
]

export default function ChoferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-marble-950 text-white">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-marble-800 bg-marble-950/95 backdrop-blur-lg">
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
                    ? "text-golden"
                    : "text-marble-500 active:text-marble-300"
                )}
              >
                <link.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-golden" : "text-marble-500"
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
