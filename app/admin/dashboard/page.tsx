"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockUsers, mockRatings, mockAnnouncements, mockComplaints, mockDepartments } from "@/lib/mock-data"
import {
  Users,
  TrendingUp,
  Star,
  FileText,
  UserCheck,
  Megaphone,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Pie, PieChart, Cell } from "recharts"

export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers)
  const [ratings, setRatings] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" })
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [hrNotes, setHrNotes] = useState("")
  const [complaintsFilter, setComplaintsFilter] = useState("all")

  useEffect(() => {
    const savedRatings = localStorage.getItem("internflow_ratings")
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings))
    } else {
      setRatings(mockRatings)
    }

    const savedAnnouncements = localStorage.getItem("internflow_announcements")
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements))
    } else {
      setAnnouncements(mockAnnouncements)
      localStorage.setItem("internflow_announcements", JSON.stringify(mockAnnouncements))
    }

    const savedComplaints = localStorage.getItem("internflow_complaints")
    if (savedComplaints) {
      setComplaints(JSON.parse(savedComplaints))
    } else {
      setComplaints(mockComplaints)
      localStorage.setItem("internflow_complaints", JSON.stringify(mockComplaints))
    }
  }, [])

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert("Please fill in both title and content")
      return
    }

    const announcement = {
      id: Date.now(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      author: "HR Admin",
      timestamp: new Date().toISOString(),
      type: "announcement",
    }

    const updatedAnnouncements = [announcement, ...announcements]
    setAnnouncements(updatedAnnouncements)
    localStorage.setItem("internflow_announcements", JSON.stringify(updatedAnnouncements))

    setNewAnnouncement({ title: "", content: "" })
    setIsCreatingAnnouncement(false)
  }

  const handleComplaintAction = (complaintId: number, action: "approved" | "rejected") => {
    const updatedComplaints = complaints.map((complaint) => {
      if (complaint.id === complaintId) {
        const updatedComplaint = {
          ...complaint,
          status: action,
          hrNotes: hrNotes,
        }

        // If it's a department change request that's approved, update the user's department
        if (action === "approved" && complaint.type === "department_change") {
          const updatedUsers = users.map((user) => {
            if (user.id === complaint.internId) {
              const newDept = mockDepartments.find((d) => d.name === complaint.requestedDepartment)
              const newManager = users.find((u) => u.name === newDept?.manager && u.role === "line_manager")

              return {
                ...user,
                department: complaint.requestedDepartment,
                line_manager_id: newManager?.id || user.line_manager_id,
              }
            }
            return user
          })

          setUsers(updatedUsers)
          localStorage.setItem("internflow_users", JSON.stringify(updatedUsers))
        }

        return updatedComplaint
      }
      return complaint
    })

    setComplaints(updatedComplaints)
    localStorage.setItem("internflow_complaints", JSON.stringify(updatedComplaints))
    setSelectedComplaint(null)
    setHrNotes("")
  }

  const filteredComplaints = complaints.filter((complaint) => {
    if (complaintsFilter === "all") return true
    return complaint.status === complaintsFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getComplaintTypeLabel = (type: string) => {
    switch (type) {
      case "poor_treatment":
        return "Poor Treatment"
      case "department_change":
        return "Department Change"
      default:
        return type
    }
  }

  const totalInterns = users.filter((u) => u.role === "intern").length
  const totalManagers = users.filter((u) => u.role === "line_manager").length
  const totalRatings = ratings.length
  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

  const onboardingData = [
    { name: "Bio", completed: 85, total: 100 },
    { name: "IT Tools", completed: 72, total: 100 },
    { name: "HR Documents", completed: 58, total: 100 },
  ]

  const ratingDistribution = [
    { rating: "5 Stars", count: ratings.filter((r) => r.rating === 5).length, color: "#10B981" },
    { rating: "4 Stars", count: ratings.filter((r) => r.rating === 4).length, color: "#3B82F6" },
    { rating: "3 Stars", count: ratings.filter((r) => r.rating === 3).length, color: "#F59E0B" },
    { rating: "2 Stars", count: ratings.filter((r) => r.rating === 2).length, color: "#EF4444" },
    { rating: "1 Star", count: ratings.filter((r) => r.rating === 1).length, color: "#6B7280" },
  ]

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
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Hub</TabsTrigger>
                <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              </TabsList>

              {/* ... existing analytics tab code ... */}

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              {/* ... existing announcements tab code ... */}

              <TabsContent value="announcements" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5" />
                        Create Announcement
                      </CardTitle>
                      <CardDescription>Post announcements visible to all interns</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isCreatingAnnouncement ? (
                        <Button onClick={() => setIsCreatingAnnouncement(true)} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          New Announcement
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
                            <Input
                              placeholder="Announcement title..."
                              value={newAnnouncement.title}
                              onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
                            <Textarea
                              placeholder="Write your announcement content..."
                              rows={4}
                              value={newAnnouncement.content}
                              onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, content: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleCreateAnnouncement} className="flex-1">
                              Post Announcement
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsCreatingAnnouncement(false)
                                setNewAnnouncement({ title: "", content: "" })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Announcement History</CardTitle>
                      <CardDescription>Your recent announcements ({announcements.length} total)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {announcements.length === 0 ? (
                          <div className="text-center py-8">
                            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No announcements yet</p>
                            <p className="text-sm text-gray-500">Create your first announcement to get started</p>
                          </div>
                        ) : (
                          announcements.map((announcement) => (
                            <div key={announcement.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(announcement.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{announcement.content}</p>
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <Megaphone className="h-3 w-3 mr-1" />
                                  Announcement
                                </span>
                                <span className="text-xs text-gray-500">by {announcement.author}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="complaints" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Complaints & Requests Management
                    </CardTitle>
                    <CardDescription>
                      Review and manage intern complaints and department change requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      <Button
                        variant={complaintsFilter === "all" ? "default" : "outline"}
                        onClick={() => setComplaintsFilter("all")}
                        size="sm"
                      >
                        All ({complaints.length})
                      </Button>
                      <Button
                        variant={complaintsFilter === "pending" ? "default" : "outline"}
                        onClick={() => setComplaintsFilter("pending")}
                        size="sm"
                      >
                        Pending ({complaints.filter((c) => c.status === "pending").length})
                      </Button>
                      <Button
                        variant={complaintsFilter === "approved" ? "default" : "outline"}
                        onClick={() => setComplaintsFilter("approved")}
                        size="sm"
                      >
                        Approved ({complaints.filter((c) => c.status === "approved").length})
                      </Button>
                      <Button
                        variant={complaintsFilter === "rejected" ? "default" : "outline"}
                        onClick={() => setComplaintsFilter("rejected")}
                        size="sm"
                      >
                        Rejected ({complaints.filter((c) => c.status === "rejected").length})
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {filteredComplaints.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No complaints found</p>
                          <p className="text-sm text-gray-500">
                            {complaintsFilter === "all"
                              ? "No complaints have been submitted yet"
                              : `No ${complaintsFilter} complaints`}
                          </p>
                        </div>
                      ) : (
                        filteredComplaints.map((complaint) => (
                          <div key={complaint.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">{complaint.internName}</h3>
                                <p className="text-sm text-gray-600">{getComplaintTypeLabel(complaint.type)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(complaint.status)}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedComplaint(complaint)
                                        setHrNotes(complaint.hrNotes || "")
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {getComplaintTypeLabel(complaint.type)} - {complaint.internName}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Submitted on {new Date(complaint.timestamp).toLocaleDateString()}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                                          {complaint.description}
                                        </p>
                                      </div>

                                      {complaint.type === "department_change" && (
                                        <>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">
                                              Requested Department
                                            </label>
                                            <p className="text-sm text-gray-900 mt-1">
                                              {complaint.requestedDepartment}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">
                                              Reason for Change
                                            </label>
                                            <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                                              {complaint.reasonForNewDept}
                                            </p>
                                          </div>
                                        </>
                                      )}

                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Current Status</label>
                                        <div className="mt-1">{getStatusBadge(complaint.status)}</div>
                                      </div>

                                      {complaint.hrNotes && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">HR Notes</label>
                                          <p className="text-sm text-gray-900 mt-1 p-3 bg-blue-50 rounded">
                                            {complaint.hrNotes}
                                          </p>
                                        </div>
                                      )}

                                      {complaint.status === "pending" && (
                                        <div className="space-y-4 pt-4 border-t">
                                          <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                              HR Notes
                                            </label>
                                            <Textarea
                                              placeholder="Add notes about your decision..."
                                              value={hrNotes}
                                              onChange={(e) => setHrNotes(e.target.value)}
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              onClick={() => handleComplaintAction(complaint.id, "approved")}
                                              className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                              <CheckCircle className="h-4 w-4 mr-1" />
                                              Approve
                                            </Button>
                                            <Button
                                              onClick={() => handleComplaintAction(complaint.id, "rejected")}
                                              variant="destructive"
                                              className="flex-1"
                                            >
                                              <XCircle className="h-4 w-4 mr-1" />
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{complaint.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Submitted {new Date(complaint.timestamp).toLocaleDateString()}</span>
                              {complaint.type === "department_change" && (
                                <span>Requesting: {complaint.requestedDepartment}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ... existing other tabs code ... */}

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
