"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockUsers, mockRatings } from "@/lib/mock-data"
import { Star, Send, Eye, Users, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Rating {
  id: number
  rater_id: number
  rater_name: string
  ratee_id: number
  ratee_name: string
  rating: number
  feedback: string
  category: "peer" | "manager"
  timestamp: string
}

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

function StarRating({ rating, onRatingChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

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
          className={`${sizeClasses[size]} ${
            star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${readonly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"}`}
          onClick={() => !readonly && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        />
      ))}
    </div>
  )
}

export default function InternRatings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [squadMembers, setSquadMembers] = useState<any[]>([])
  const [lineManager, setLineManager] = useState<any>(null)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [newRating, setNewRating] = useState(0)
  const [newFeedback, setNewFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      // Load ratings from localStorage
      const savedRatings = localStorage.getItem("internflow_ratings")
      if (savedRatings) {
        setRatings(JSON.parse(savedRatings))
      } else {
        setRatings(mockRatings)
        localStorage.setItem("internflow_ratings", JSON.stringify(mockRatings))
      }

      // Get squad members (excluding current user)
      const members = mockUsers.filter((u) => u.role === "intern" && u.squad_id === user.squad_id && u.id !== user.id)
      setSquadMembers(members)

      // Get line manager
      const manager = mockUsers.find((u) => u.id === user.line_manager_id)
      setLineManager(manager)
    }
  }, [user])

  const handleSubmitRating = async () => {
    if (!selectedPerson || newRating === 0 || !user) return

    setIsSubmitting(true)

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const rating: Rating = {
      id: Date.now(),
      rater_id: user.id,
      rater_name: user.name,
      ratee_id: selectedPerson.id,
      ratee_name: selectedPerson.name,
      rating: newRating,
      feedback: newFeedback.trim(),
      category: selectedPerson.role === "line_manager" ? "manager" : "peer",
      timestamp: new Date().toISOString(),
    }

    const updatedRatings = [rating, ...ratings]
    setRatings(updatedRatings)
    localStorage.setItem("internflow_ratings", JSON.stringify(updatedRatings))

    // Reset form
    setNewRating(0)
    setNewFeedback("")
    setSelectedPerson(null)
    setDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: "Rating Submitted",
      description: `Your rating for ${selectedPerson.name} has been submitted successfully.`,
    })
  }

  const getMyRatings = () => {
    return ratings.filter((r) => r.rater_id === user?.id)
  }

  const getRatingsReceived = () => {
    return ratings.filter((r) => r.ratee_id === user?.id)
  }

  const hasRated = (personId: number) => {
    return ratings.some((r) => r.rater_id === user?.id && r.ratee_id === personId)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const myRatings = getMyRatings()
  const ratingsReceived = getRatingsReceived()

  return (
    <AuthGuard allowedRoles={["intern"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Ratings & Feedback</h1>
              <p className="text-gray-600">Rate your squad members and line manager</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Send className="h-8 w-8 text-blue-600" />
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
                    <Eye className="h-8 w-8 text-green-600" />
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
                      <p className="text-sm font-medium text-gray-600">Average Received</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {ratingsReceived.length > 0
                          ? (ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / ratingsReceived.length).toFixed(1)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="give-ratings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="give-ratings">Give Ratings</TabsTrigger>
                <TabsTrigger value="my-ratings">My Ratings</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
              </TabsList>

              <TabsContent value="give-ratings" className="space-y-6">
                {/* Squad Members */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Squad Members
                    </CardTitle>
                    <CardDescription>Rate your fellow squad members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {squadMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.profile_picture || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {hasRated(member.id) ? (
                              <Badge variant="secondary" className="text-green-700 bg-green-100">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Rated
                              </Badge>
                            ) : (
                              <Dialog
                                open={dialogOpen && selectedPerson?.id === member.id}
                                onOpenChange={setDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedPerson(member)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Rate
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rate {member.name}</DialogTitle>
                                    <DialogDescription>
                                      Provide a rating and optional feedback for your squad member.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                                      <StarRating rating={newRating} onRatingChange={setNewRating} size="lg" />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Feedback (Optional)
                                      </label>
                                      <Textarea
                                        placeholder="Share your thoughts about working with this person..."
                                        value={newFeedback}
                                        onChange={(e) => setNewFeedback(e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleSubmitRating}
                                        disabled={newRating === 0 || isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        {isSubmitting ? "Submitting..." : "Submit Rating"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Line Manager */}
                {lineManager && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Line Manager
                      </CardTitle>
                      <CardDescription>Rate your line manager</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={lineManager.profile_picture || "/placeholder.svg"} />
                            <AvatarFallback>
                              {lineManager.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">{lineManager.name}</h4>
                            <p className="text-sm text-gray-600">{lineManager.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {hasRated(lineManager.id) ? (
                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Rated
                            </Badge>
                          ) : (
                            <Dialog
                              open={dialogOpen && selectedPerson?.id === lineManager.id}
                              onOpenChange={setDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedPerson(lineManager)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Rate
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rate {lineManager.name}</DialogTitle>
                                  <DialogDescription>
                                    Provide a rating and optional feedback for your line manager.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                                    <StarRating rating={newRating} onRatingChange={setNewRating} size="lg" />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Feedback (Optional)
                                    </label>
                                    <Textarea
                                      placeholder="Share your thoughts about your manager's support and guidance..."
                                      value={newFeedback}
                                      onChange={(e) => setNewFeedback(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleSubmitRating}
                                      disabled={newRating === 0 || isSubmitting}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      {isSubmitting ? "Submitting..." : "Submit Rating"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-ratings" className="space-y-4">
                {myRatings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings given yet</h3>
                      <p className="text-gray-600">Start rating your squad members and line manager.</p>
                    </CardContent>
                  </Card>
                ) : (
                  myRatings.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{rating.ratee_name}</h4>
                            <Badge variant="outline" className="mt-1">
                              {rating.category === "manager" ? "Line Manager" : "Squad Member"}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <StarRating rating={rating.rating} onRatingChange={() => {}} readonly size="sm" />
                            <p className="text-sm text-gray-500 mt-1">{formatTimestamp(rating.timestamp)}</p>
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
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings received yet</h3>
                      <p className="text-gray-600">Ratings from your squad members will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  ratingsReceived.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">From {rating.rater_name}</h4>
                            <Badge variant="outline" className="mt-1">
                              Squad Member
                            </Badge>
                          </div>
                          <div className="text-right">
                            <StarRating rating={rating.rating} onRatingChange={() => {}} readonly size="sm" />
                            <p className="text-sm text-gray-500 mt-1">{formatTimestamp(rating.timestamp)}</p>
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
