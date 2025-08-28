"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { mockPosts, mockUsers, mockSquads } from "@/lib/mock-data"
import { Heart, MessageCircle, Send, Users, Globe, Megaphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: number
  author_id: number
  author_name: string
  content: string
  timestamp: string
  scope: "all" | "squad"
  squad_id: string
  likes: number
  comments: number
}

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  timestamp: string
  type: "announcement"
}

export default function InternFeed() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newPost, setNewPost] = useState("")
  const [postToSquad, setPostToSquad] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  useEffect(() => {
    // Load posts and liked posts from localStorage
    const savedPosts = localStorage.getItem("internflow_posts")
    const savedLikes = localStorage.getItem(`internflow_likes_${user?.id}`)
    const savedAnnouncements = localStorage.getItem("internflow_announcements")

    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      setPosts(mockPosts)
      localStorage.setItem("internflow_posts", JSON.stringify(mockPosts))
    }

    if (savedLikes) {
      setLikedPosts(JSON.parse(savedLikes))
    }

    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements))
    }
  }, [user])

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return

    setIsPosting(true)

    // Simulate posting delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const post: Post = {
      id: Date.now(),
      author_id: user.id,
      author_name: user.name,
      content: newPost.trim(),
      timestamp: new Date().toISOString(),
      scope: postToSquad ? "squad" : "all",
      squad_id: user.squad_id || "",
      likes: 0,
      comments: 0,
    }

    const updatedPosts = [post, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem("internflow_posts", JSON.stringify(updatedPosts))

    setNewPost("")
    setIsPosting(false)

    toast({
      title: "Post Created",
      description: `Your post was shared with ${postToSquad ? "your squad" : "all interns"}.`,
    })
  }

  const handleLikePost = (postId: number) => {
    const isLiked = likedPosts.includes(postId)
    const newLikedPosts = isLiked ? likedPosts.filter((id) => id !== postId) : [...likedPosts, postId]

    setLikedPosts(newLikedPosts)
    localStorage.setItem(`internflow_likes_${user?.id}`, JSON.stringify(newLikedPosts))

    // Update post likes count
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } : post,
    )
    setPosts(updatedPosts)
    localStorage.setItem("internflow_posts", JSON.stringify(updatedPosts))
  }

  const getFilteredPosts = () => {
    if (!user) return []

    return posts.filter((post) => {
      // Show all posts marked as "all"
      if (post.scope === "all") return true

      // Show squad posts only if user is in the same squad
      if (post.scope === "squad" && post.squad_id === user.squad_id) return true

      return false
    })
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

  const userSquad = mockSquads.find((s) => s.id === user?.squad_id)
  const filteredPosts = getFilteredPosts()

  return (
    <AuthGuard allowedRoles={["intern"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
              <p className="text-gray-600">Connect with your fellow interns</p>
            </div>

            {/* Create Post Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Share an update</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                  className="resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id="post-scope" checked={postToSquad} onCheckedChange={setPostToSquad} />
                    <Label htmlFor="post-scope" className="flex items-center space-x-2 cursor-pointer">
                      {postToSquad ? (
                        <>
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>Post to {userSquad?.name}</span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 text-green-600" />
                          <span>Post to All Interns</span>
                        </>
                      )}
                    </Label>
                  </div>

                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || isPosting}
                    className="bg-blue-600 hover:bg-blue-700"
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

            {/* Posts Feed */}
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card
                  key={`announcement-${announcement.id}`}
                  className="border-l-4 border-l-blue-500 bg-blue-50 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              <Megaphone className="h-3 w-3 mr-1" />
                              Announcement
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{formatTimestamp(announcement.timestamp)}</span>
                        </div>

                        <p className="text-gray-900 mb-3 leading-relaxed">{announcement.content}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">by {announcement.author}</span>
                          <span className="text-xs text-blue-600 font-medium">Official Announcement</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredPosts.length === 0 && announcements.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600">Be the first to share something with your fellow interns!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => {
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
                                <Badge variant={post.scope === "squad" ? "default" : "secondary"} className="text-xs">
                                  {post.scope === "squad" ? (
                                    <>
                                      <Users className="h-3 w-3 mr-1" />
                                      Squad
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="h-3 w-3 mr-1" />
                                      All
                                    </>
                                  )}
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

                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
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
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
