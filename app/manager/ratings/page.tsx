"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockRatings } from "@/lib/mock-data"
import { Star, TrendingUp, Users, Calendar } from "lucide-react"

interface StarRatingProps {
  rating: number
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

function StarRating({ rating, readonly = true, size = "md" }: StarRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export default function ManagerRatings() {
  const { user } = useAuth()
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

  const myRatings = ratings.filter((r) => r.rater_id === user?.id)
  const ratingsReceived = ratings.filter((r) => r.ratee_id === user?.id)

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AuthGuard allowedRoles={["line_manager"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Ratings Overview</h1>
              <p className="text-gray-600">View ratings you've given and received</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Ratings Given</p>
                      <p className="text-2xl font-bold text-gray-900">{myRatings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Ratings Received</p>
                      <p className="text-2xl font-bold text-gray-900">{ratingsReceived.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Given</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {myRatings.length > 0
                          ? (myRatings.reduce((sum, r) => sum + r.rating, 0) / myRatings.length).toFixed(1)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="given" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="given">Ratings Given</TabsTrigger>
                <TabsTrigger value="received">Ratings Received</TabsTrigger>
              </TabsList>

              <TabsContent value="given" className="space-y-4">
                {myRatings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings given yet</h3>
                      <p className="text-gray-600">Start rating your interns to provide valuable feedback.</p>
                    </CardContent>
                  </Card>
                ) : (
                  myRatings.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                {rating.ratee_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{rating.ratee_name}</h4>
                              <Badge variant="outline" className="mt-1">
                                {rating.category === "manager_to_intern" ? "Intern" : "Peer"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <StarRating rating={rating.rating} size="sm" />
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatTimestamp(rating.timestamp)}
                            </p>
                          </div>
                        </div>
                        {rating.feedback && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">{rating.feedback}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="received" className="space-y-4">
                {ratingsReceived.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings received yet</h3>
                      <p className="text-gray-600">Ratings from interns and peers will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  ratingsReceived.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                {rating.rater_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">From {rating.rater_name}</h4>
                              <Badge variant="outline" className="mt-1">
                                {rating.category === "manager" ? "Manager Rating" : "Peer Rating"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <StarRating rating={rating.rating} size="sm" />
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatTimestamp(rating.timestamp)}
                            </p>
                          </div>
                        </div>
                        {rating.feedback && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">{rating.feedback}</p>
                          </div>
                        )}
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
