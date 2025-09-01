"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockUsers, mockMentorshipGroups } from "@/lib/mock-data"
import { Target, MessageCircle, Heart, Send, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MentorshipPost {
  id: number
  author_id: number
  author_name: string
  content: string
  timestamp: string
  scope: "mentorship"
  mentorship_group_id: string
  likes: number
  comments: number
}

export default function MentorshipGroupPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [mentorshipGroup, setMentorshipGroup] = useState<any>(null)
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [groupPosts, setGroupPosts] = useState<MentorshipPost[]>([])
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  useEffect(() => {
    if (user && user.mentorship_group_id) {
      // Find mentorship group
      const group = mockMentorshipGroups.find((g) => g.id === user.mentorship_group_id)
      if (group) {
        setMentorshipGroup(group)

        // Get group members
        const members = mockUsers.filter((u) => group.members.includes(u.id))
        setGroupMembers(members)

        // Load group posts from localStorage
        const savedPosts = localStorage.getItem("internflow_posts")
        const savedLikes = localStorage.getItem(`internflow_likes_${user.id}`)

        if (savedPosts) {
          const allPosts = JSON.parse(savedPosts)
          const mentorshipPosts = allPosts.filter(
            (post: any) => post.scope === "mentorship" && post.mentorship_group_id === user.mentorship_group_id,
          )
          setGroupPosts(mentorshipPosts)
        }

        if (savedLikes) {
          setLikedPosts(JSON.parse(savedLikes))
        }
      }
    }
  }, [user])

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user || !mentorshipGroup) return

    setIsPosting(true)

    // Simulate posting delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const post: MentorshipPost = {
      id: Date.now(),
      author_id: user.id,
      author_name: user.name,
      content: newPost.trim(),
      timestamp: new Date().toISOString(),
      scope: "mentorship",
      mentorship_group_id: user.mentorship_group_id || "",
      likes: 0,
      comments: 0,
    }

    // Update local state
    const updatedGroupPosts = [post, ...groupPosts]
    setGroupPosts(updatedGroupPosts)

    // Update global posts in localStorage
    const savedPosts = localStorage.getItem("internflow_posts")
    const allPosts = savedPosts ? JSON.parse(savedPosts) : []
    const updatedAllPosts = [post, ...allPosts]
    localStorage.setItem("internflow_posts", JSON.stringify(updatedAllPosts))

    setNewPost("")
    setIsPosting(false)

    toast({
      title: "Post Created",
      description: "Your post was shared with your mentorship group.",
    })
  }

  const handleLikePost = (postId: number) => {
    const isLiked = likedPosts.includes(postId)
    const newLikedPosts = isLiked ? likedPosts.filter((id) => id !== postId) : [...likedPosts, postId]

    setLikedPosts(newLikedPosts)
    localStorage.setItem(`internflow_likes_${user?.id}`, JSON.stringify(newLikedPosts))

    // Update post likes count
    const updatedPosts = groupPosts.map((post) =>
      post.id === postId ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } : post,
    )
    setGroupPosts(updatedPosts)

    // Update global posts
    const savedPosts = localStorage.getItem("internflow_posts")
    if (savedPosts) {
      const allPosts = JSON.parse(savedPosts)
      const updatedAllPosts = allPosts.map((post: any) =>
        post.id === postId ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } : post,
      )
      localStorage.setItem("internflow_posts", JSON.stringify(updatedAllPosts))
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  if (!user || !user.mentorship_group_id) {
    return (
      <AuthGuard allowedRoles={["intern"]}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Mentorship Group Assigned</h3>
                  <p className="text-gray-600">
                    Complete your profile with interests to be assigned to a mentorship group.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (!mentorshipGroup) {
    return <div>Loading...</div>
  }

  return (
    <AuthGuard allowedRoles={["intern"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="h-8 w-8 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">{mentorshipGroup.name}</h1>
              </div>
              <p className="text-gray-600">{mentorshipGroup.description}</p>
            </div>

            {/* Group Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>Group Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Members</Label>
                    <p className="text-2xl font-bold text-purple-600">{mentorshipGroup.members.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Shared Interests</Label>
                    <p className="text-2xl font-bold text-purple-600">{mentorshipGroup.sharedInterests.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Created</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(mentorshipGroup.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Shared Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {mentorshipGroup.sharedInterests.map((interest: string) => (
                      <Badge key={interest} className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">Group Members</TabsTrigger>
                <TabsTrigger value="activity">Group Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupMembers.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.profile_picture || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{member.department} Intern</p>

                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Interests</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {member.interests?.slice(0, 3).map((interest: string) => (
                                    <Badge key={interest} variant="outline" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex space-x-2 pt-2">
                                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Chat
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {/* Create Post */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Share with your mentorship group</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Share insights, ask questions, or collaborate with your mentorship group..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span>Visible to {mentorshipGroup.name} members only</span>
                      </div>

                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim() || isPosting}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isPosting ? (
                          "Posting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Group Posts */}
                <div className="space-y-4">
                  {groupPosts.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No group posts yet</h3>
                        <p className="text-gray-600">
                          Start the conversation! Share insights or ask questions with your mentorship group.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    groupPosts.map((post) => {
                      const author = mockUsers.find((u) => u.id === post.author_id)
                      const isLiked = likedPosts.includes(post.id)

                      return (
                        <Card key={post.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={author?.profile_picture || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {post.author_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-gray-900">{post.author_name}</h4>
                                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
                                      <Target className="h-3 w-3 mr-1" />
                                      Mentorship
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</span>
                                </div>

                                <p className="text-gray-900 mb-4 leading-relaxed">{post.content}</p>

                                <div className="flex items-center space-x-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLikePost(post.id)}
                                    className={`${isLiked ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-red-600"}`}
                                  >
                                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                                    {post.likes}
                                  </Button>

                                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    {post.comments}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
