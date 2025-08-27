"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { mockUsers, mockRatings, mockOnboardingTasks } from "@/lib/mock-data"
import { Users, Star, TrendingUp, CheckCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function ManagerDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [assignedInterns, setAssignedInterns] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [selectedIntern, setSelectedIntern] = useState<any>(null)
  const [newRating, setNewRating] = useState(0)
  const [newFeedback, setNewFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      // Get assigned interns
      const interns = mockUsers.filter((u) => u.role === "intern" && u.line_manager_id === user.id)
      setAssignedInterns(interns)

      // Load ratings from localStorage
      const savedRatings = localStorage.getItem("internflow_ratings")
      if (savedRatings) {
        setRatings(JSON.parse(savedRatings))
      } else {
        setRatings(mockRatings)
      }
    }
  }, [user])

  const handleSubmitRating = async () => {
    if (!selectedIntern || newRating === 0 || !user) return

    setIsSubmitting(true)

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const rating = {
      id: Date.now(),
      rater_id: user.id,
      rater_name: user.name,
      ratee_id: selectedIntern.id,
      ratee_name: selectedIntern.name,
      rating: newRating,
      feedback: newFeedback.trim(),
      category: "manager_to_intern",
      timestamp: new Date().toISOString(),
    }

    const updatedRatings = [rating, ...ratings]
    setRatings(updatedRatings)
    localStorage.setItem("internflow_ratings", JSON.stringify(updatedRatings))

    // Reset form
    setNewRating(0)
    setNewFeedback("")
    setSelectedIntern(null)
    setDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: "Rating Submitted",
      description: `Your rating for ${selectedIntern.name} has been submitted successfully.`,
    })
  }

  const getInternOnboardingProgress = (internId: number) => {
    // Simulate getting onboarding progress from localStorage
    const saved = localStorage.getItem(`onboarding_${internId}`)
    if (saved) {
      const completed = JSON.parse(saved)
      return (completed.length / mockOnboardingTasks.length) * 100
    }
    return Math.floor(Math.random() * 100) // Mock progress for demo
  }

  const getMyRatingsForIntern = (internId: number) => {
    return ratings.filter((r) => r.rater_id === user?.id && r.ratee_id === internId)
  }

  const getInternRatingsReceived = (internId: number) => {
    return ratings.filter((r) => r.ratee_id === internId && r.category === "peer")
  }

  const hasRatedIntern = (internId: number) => {
    return ratings.some((r) => r.rater_id === user?.id && r.ratee_id === internId)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const totalInterns = assignedInterns.length
  const avgOnboardingProgress =
    totalInterns > 0
      ? assignedInterns.reduce((sum, intern) => sum + getInternOnboardingProgress(intern.id), 0) / totalInterns
      : 0

  const myRatings = ratings.filter((r) => r.rater_id === user?.id)

  return (
    <AuthGuard allowedRoles={["line_manager"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600">Manage and support your assigned interns</p>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Assigned Interns</p>
                      <p className="text-2xl font-bold text-gray-900">{totalInterns}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(avgOnboardingProgress)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
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
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Fully Onboarded</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assignedInterns.filter((intern) => getInternOnboardingProgress(intern.id) === 100).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="interns" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="interns">My Interns</TabsTrigger>
                <TabsTrigger value="ratings">My Ratings</TabsTrigger>
              </TabsList>

              <TabsContent value="interns" className="space-y-6">
                {assignedInterns.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Interns</h3>
                      <p className="text-gray-600">You don't have any interns assigned to you yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assignedInterns.map((intern) => {
                      const onboardingProgress = getInternOnboardingProgress(intern.id)
                      const internRatings = getInternRatingsReceived(intern.id)
                      const avgRating =
                        internRatings.length > 0
                          ? internRatings.reduce((sum, r) => sum + r.rating, 0) / internRatings.length
                          : 0

                      return (
                        <Card key={intern.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={intern.profile_picture || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {intern.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{intern.name}</CardTitle>
                                  <CardDescription>{intern.department} Intern</CardDescription>
                                </div>
                              </div>
                              <Badge variant={onboardingProgress === 100 ? "default" : "secondary"}>
                                {onboardingProgress === 100 ? "Complete" : "In Progress"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Onboarding Progress</span>
                                <span>{Math.round(onboardingProgress)}%</span>
                              </div>
                              <Progress value={onboardingProgress} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Start Date</p>
                                <p className="font-medium">{new Date(intern.start_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">End Date</p>
                                <p className="font-medium">{new Date(intern.end_date).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {avgRating > 0 && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Peer Rating:</span>
                                <StarRating
                                  rating={Math.round(avgRating)}
                                  onRatingChange={() => {}}
                                  readonly
                                  size="sm"
                                />
                                <span className="text-sm text-gray-600">({avgRating.toFixed(1)})</span>
                              </div>
                            )}

                            <div className="flex space-x-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <Eye className="h-4 w-4 mr-1" />
                                View Profile
                              </Button>
                              {hasRatedIntern(intern.id) ? (
                                <Badge variant="secondary" className="px-3 py-1">
                                  Rated
                                </Badge>
                              ) : (
                                <Dialog
                                  open={dialogOpen && selectedIntern?.id === intern.id}
                                  onOpenChange={setDialogOpen}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => setSelectedIntern(intern)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Rate
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Rate {intern.name}</DialogTitle>
                                      <DialogDescription>
                                        Provide a performance rating and feedback for your intern.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                          Performance Rating
                                        </label>
                                        <StarRating rating={newRating} onRatingChange={setNewRating} size="lg" />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Feedback</label>
                                        <Textarea
                                          placeholder="Share your thoughts on their performance, areas of strength, and areas for improvement..."
                                          value={newFeedback}
                                          onChange={(e) => setNewFeedback(e.target.value)}
                                          rows={4}
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
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ratings" className="space-y-4">
                {myRatings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings given yet</h3>
                      <p className="text-gray-600">Start rating your assigned interns to track their progress.</p>
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
                                Intern
                              </Badge>
                            </div>
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
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
