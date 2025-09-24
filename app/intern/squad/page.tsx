"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockUsers, mockSquads, mockPosts } from "@/lib/mock-data"
import { Users, Calendar, MessageSquare, Star, Mail } from "lucide-react"

interface SquadMember {
  id: number
  name: string
  department: string
  interests: string[]
  bio: string
  profile_picture: string | null
  email: string
  phone: string
}

interface SquadActivity {
  id: number
  type: "post" | "event" | "milestone"
  title: string
  description: string
  author: string
  timestamp: string
  participants?: number
}

export default function InternSquad() {
  const { user } = useAuth()
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([])
  const [squadActivities, setSquadActivities] = useState<SquadActivity[]>([])
  const [currentSquad, setCurrentSquad] = useState<any>(null)

  useEffect(() => {
    if (user && user.squad_id) {
      // Get current squad
      const squad = mockSquads.find((s) => s.id === user.squad_id)
      setCurrentSquad(squad)

      // Get squad members
      const members = mockUsers
        .filter((u) => u.role === "intern" && u.squad_id === user.squad_id)
        .map((u) => ({
          id: u.id,
          name: u.name,
          department: u.department || "",
          interests: u.interests || [],
          bio: u.bio || "",
          profile_picture: u.profile_picture,
          email: u.email || "",
          phone: u.phone || "",
        }))
      setSquadMembers(members)

      // Get squad activities (posts + mock events)
      const squadPosts = mockPosts
        .filter((p) => p.scope === "squad" && p.squad_id === user.squad_id)
        .map((p) => ({
          id: p.id,
          type: "post" as const,
          title: "Squad Post",
          description: p.content,
          author: p.author_name,
          timestamp: p.timestamp,
        }))

      const mockEvents: SquadActivity[] = [
        {
          id: 1001,
          type: "event",
          title: "Squad Lunch",
          description: "Team bonding lunch at the company cafeteria",
          author: "HR Team",
          timestamp: "2024-06-01T12:00:00Z",
          participants: 8,
        },
        {
          id: 1002,
          type: "milestone",
          title: "Onboarding Complete",
          description: "All squad members completed their SIWES onboarding process",
          author: "System",
          timestamp: "2024-05-30T09:00:00Z",
        },
        {
          id: 1003,
          type: "event",
          title: "Project Kickoff",
          description: "Telecommunications infrastructure project presentations and team assignments",
          author: "Project Manager",
          timestamp: "2024-06-03T14:00:00Z",
          participants: 12,
        },
      ]

      const allActivities = [...squadPosts, ...mockEvents].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      setSquadActivities(allActivities)
    }
  }, [user])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageSquare className="h-4 w-4" />
      case "event":
        return <Calendar className="h-4 w-4" />
      case "milestone":
        return <Star className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "post":
        return "text-blue-600 bg-blue-50"
      case "event":
        return "text-green-600 bg-green-50"
      case "milestone":
        return "text-purple-600 bg-purple-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (!currentSquad) {
    return (
      <AuthGuard allowedRoles={["intern"]}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No Squad Assigned</h1>
              <p className="text-gray-600">
                You haven't been assigned to a squad yet. Please contact HR for assistance.
              </p>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["intern"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{currentSquad.name}</h1>
              <p className="text-gray-600">{currentSquad.description}</p>
            </div>

            {/* Squad Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Members</p>
                      <p className="text-2xl font-bold text-gray-900">{squadMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Squad Posts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {squadActivities.filter((a) => a.type === "post").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {squadActivities.filter((a) => a.type === "event").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">Squad Members</TabsTrigger>
                <TabsTrigger value="activities">Recent Activities</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {squadMembers.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <Avatar className="h-16 w-16 mx-auto mb-3">
                            <AvatarImage src={member.profile_picture || "/placeholder.svg"} />
                            <AvatarFallback className="text-lg">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.department} Intern</p>
                          {member.id === user?.id && (
                            <Badge variant="secondary" className="mt-1">
                              You
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Bio</p>
                            <p className="text-sm text-gray-900 line-clamp-2">{member.bio}</p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Interests</p>
                            <div className="flex flex-wrap gap-1">
                              {member.interests.slice(0, 3).map((interest) => (
                                <Badge key={interest} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {member.interests.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.interests.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex justify-between">
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                {squadActivities.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                      <p className="text-gray-600">Squad activities and events will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  squadActivities.map((activity) => (
                    <Card key={activity.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              <span className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{activity.description}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600">by {activity.author}</p>
                              {activity.participants && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.participants} participants
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
