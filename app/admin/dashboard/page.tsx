"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockUsers, mockRatings } from "@/lib/mock-data"
import { Users, TrendingUp, Star, FileText, UserCheck } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Pie, PieChart, Cell } from "recharts"

export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers)
  const [ratings, setRatings] = useState<any[]>([])

  useEffect(() => {
    // Load ratings from localStorage
    const savedRatings = localStorage.getItem("internflow_ratings")
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings))
    } else {
      setRatings(mockRatings)
    }
  }, [])

  // Analytics calculations
  const totalInterns = users.filter((u) => u.role === "intern").length
  const totalManagers = users.filter((u) => u.role === "line_manager").length
  const totalRatings = ratings.length
  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

  // Onboarding completion data
  const onboardingData = [
    { name: "Bio", completed: 85, total: 100 },
    { name: "IT Tools", completed: 72, total: 100 },
    { name: "HR Documents", completed: 58, total: 100 },
  ]

  // Rating distribution data
  const ratingDistribution = [
    { rating: "5 Stars", count: ratings.filter((r) => r.rating === 5).length, color: "#10B981" },
    { rating: "4 Stars", count: ratings.filter((r) => r.rating === 4).length, color: "#3B82F6" },
    { rating: "3 Stars", count: ratings.filter((r) => r.rating === 3).length, color: "#F59E0B" },
    { rating: "2 Stars", count: ratings.filter((r) => r.rating === 2).length, color: "#EF4444" },
    { rating: "1 Star", count: ratings.filter((r) => r.rating === 1).length, color: "#6B7280" },
  ]

  // Department distribution
  const departmentData = users
    .filter((u) => u.role === "intern")
    .reduce(
      (acc, user) => {
        const dept = user.department || "Unknown"
        acc[dept] = (acc[dept] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({ name, value }))

  return (
    <AuthGuard allowedRoles={["hr_admin"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">HR Admin Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of the internship program</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Interns</p>
                      <p className="text-2xl font-bold text-gray-900">{totalInterns}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Line Managers</p>
                      <p className="text-2xl font-bold text-gray-900">{totalManagers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                      <p className="text-2xl font-bold text-gray-900">{totalRatings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Hub</TabsTrigger>
                <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Onboarding Progress Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Onboarding Progress by Category</CardTitle>
                      <CardDescription>Average completion rates across all interns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={onboardingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="completed" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Rating Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Distribution</CardTitle>
                      <CardDescription>Breakdown of all ratings given</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={ratingDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ rating, count }) => `${rating}: ${count}`}
                          >
                            {ratingDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Department Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Interns by Department</CardTitle>
                      <CardDescription>Distribution across departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Recent Feedback */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Feedback</CardTitle>
                      <CardDescription>Latest feedback comments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ratings
                          .filter((r) => r.feedback && r.feedback.trim())
                          .slice(0, 3)
                          .map((rating) => (
                            <div key={rating.id} className="border-l-4 border-blue-500 pl-4">
                              <p className="text-sm text-gray-700 mb-1">"{rating.feedback}"</p>
                              <p className="text-xs text-gray-500">
                                {rating.rater_name} → {rating.ratee_name}
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all users in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">User Management Interface</h3>
                      <p className="text-gray-600">
                        Advanced user management features would be implemented here, including user creation, role
                        assignment, and squad management.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="knowledge">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Hub Management</CardTitle>
                    <CardDescription>Manage knowledge base files and resources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Knowledge Hub Interface</h3>
                      <p className="text-gray-600">
                        File upload, management, and organization features would be implemented here, including
                        categorization and access control.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mentorship">
                <Card>
                  <CardHeader>
                    <CardTitle>Mentorship Matching</CardTitle>
                    <CardDescription>Match interns with suitable mentors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Mentorship Matching Interface</h3>
                      <p className="text-gray-600">
                        Advanced mentorship matching algorithms and manual assignment tools would be implemented here,
                        based on interests and expertise alignment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
