"use client"

import { useAuth } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Home, Users, MessageSquare, Star, BookOpen, LogOut, CheckSquare, BarChart3, Target } from "lucide-react"

const internNavItems = [
  { href: "/intern/dashboard", label: "Dashboard", icon: Home },
  { href: "/intern/profile", label: "Profile", icon: User },
  { href: "/intern/onboarding", label: "Onboarding", icon: CheckSquare },
  { href: "/intern/squad", label: "My Squad", icon: Users },
  { href: "/intern/mentorship-group", label: "Mentorship Group", icon: Target }, // Added mentorship group navigation link
  { href: "/intern/feed", label: "Social Feed", icon: MessageSquare },
  { href: "/intern/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { href: "/intern/ratings", label: "Ratings", icon: Star },
]

const managerNavItems = [
  { href: "/manager/dashboard", label: "Dashboard", icon: Home },
  { href: "/manager/interns", label: "My Interns", icon: Users },
  { href: "/manager/ratings", label: "Ratings", icon: Star },
]

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/mentorship", label: "Mentorship", icon: Star },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const getNavItems = () => {
    switch (user.role) {
      case "intern":
        return internNavItems
      case "line_manager":
        return managerNavItems
      case "hr_admin":
        return adminNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-900">InternFlow</h1>
        <p className="text-sm text-gray-600 mt-1">{user.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-gray-700 hover:text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
