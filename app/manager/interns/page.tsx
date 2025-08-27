"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { mockUsers, mockRatings } from "@/lib/mock-data"
import { Search, Mail, MessageSquare, Star, TrendingUp } from "lucide-react"

export default function ManagerInterns() {
  const { user } = useAuth()
  const [assignedInterns, setAssignedInterns] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ratings, setRatings] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      // Get assigned interns
      const interns = mockUsers.filter((u) => u.role === "intern" && u.line_manager_id === user.id)
      setAssignedInterns(interns)

      // Load ratings
      const savedRatings = localStorage.getItem("internflow_ratings")
      if (savedRatings) {
        setRatings(JSON.parse(savedRatings))
      } else {
        setRatings(mockRatings)
      }
    }
  }, [user])

  const getInternRatingsReceived = (internId: number) => {
    return ratings.filter((r) => r.ratee_id === internId && r.category === "peer")
  }

  const getInternOnboardingProgress = (internId: number) => {
    // Mock progress for demo
    return Math.floor(Math.random() * 100)
  }

  const filteredInterns = assignedInterns.filter((intern) =>
    intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AuthGuard allowedRoles={["line_manager"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Interns</h1>
              <p className="text-gray-600">Detailed view of your assigned interns</p>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search interns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interns List */}
            <div className="space-y-6">
              {filteredInterns.map((intern) => {
                const internRatings = getInternRatingsReceived(intern.id)
                const avgRating =
                  internRatings.length > 0
                    ? internRatings.reduce((sum, r) => sum + r.rating, 0) / internRatings.length
                    : 0
                const onboardingProgress = getInternOnboardingProgress(intern.id)

                return (
                  <Card key={intern.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-6">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={intern.profile_picture || "/placeholder.svg"} />
                          <AvatarFallback className="text-lg">
                            {intern.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{intern.name}</h3>
                              <p className="text-gray-600">{intern.department} Intern</p>
                              <p className="text-sm text-gray-500 mt-1">{intern.email}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={onboardingProgress === 100 ? "default" : "secondary"}>
                                {onboardingProgress === 100 ? "Onboarded" : "In Progress"}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Onboarding Progress</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={onboardingProgress} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{onboardingProgress}%</span>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-2">Peer Rating</p>
                              {avgRating > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= Math.round(avgRating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">({avgRating.toFixed(1)})</span>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No ratings yet</p>
                              )}
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-2">Internship Period</p>
                              <p className="text-sm font-medium">
                                {new Date(intern.start_date).toLocaleDateString()} -{" "}
                                {new Date(intern.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Interests</p>
                            <div className="flex flex-wrap gap-2">
                              {intern.interests?.slice(0, 5).map((interest: string) => (
                                <Badge key={interest} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {intern.interests?.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{intern.interests.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              View Progress
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredInterns.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No interns found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try adjusting your search terms." : "You don't have any assigned interns yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
