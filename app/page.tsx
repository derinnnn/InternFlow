"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { mockUsers } from "@/lib/mock-data"

export default function LoginPage() {
  const [role, setRole] = useState<string>("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Mock authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user in mock data
    const user = mockUsers.find(
      (u) => u.username === username && u.role === role && password === "password123", // Mock password for all users
    )

    if (user) {
      // Store user session in localStorage
      localStorage.setItem("internflow_user", JSON.stringify(user))

      // Route based on role
      switch (role) {
        case "intern":
          router.push("/intern/dashboard")
          break
        case "line_manager":
          router.push("/manager/dashboard")
          break
        case "hr_admin":
          router.push("/admin/dashboard")
          break
      }
    } else {
      setError("Invalid credentials. Use password: password123")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">InternFlow</CardTitle>
          <CardDescription>Intern Lifecycle Management Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="line_manager">Line Manager</SelectItem>
                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Intern: john.intern / password123</p>
            <p>Manager: sarah.manager / password123</p>
            <p>HR Admin: admin.hr / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
