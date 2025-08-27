"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUsers, mockSquads, availableInterests } from "@/lib/mock-data"
import { Camera, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InternProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [editData, setEditData] = useState<any>({})
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      const userData = mockUsers.find((u) => u.id === user.id)
      if (userData) {
        setProfileData(userData)
        setEditData(userData)
        setSelectedInterests(userData.interests || [])
      }
    }
  }, [user])

  const handleSave = () => {
    // Simulate saving profile data
    const updatedData = {
      ...editData,
      interests: selectedInterests,
    }
    setProfileData(updatedData)
    setIsEditing(false)

    // Update localStorage
    const updatedUser = { ...user, ...updatedData }
    localStorage.setItem("internflow_user", JSON.stringify(updatedUser))

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditData({ ...editData, profile_picture: e.target?.result })
      }
      reader.readAsDataURL(file)
    }
  }

  if (!profileData) {
    return <div>Loading...</div>
  }

  const squad = mockSquads.find((s) => s.id === profileData.squad_id)
  const lineManager = mockUsers.find((u) => u.id === profileData.line_manager_id)

  return (
    <AuthGuard allowedRoles={["intern"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your personal information</p>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture and Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto">
                      <AvatarImage src={editData.profile_picture || profileData.profile_picture} />
                      <AvatarFallback className="text-2xl">
                        {profileData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                        <Camera className="h-4 w-4" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mt-4">{profileData.name}</h3>
                  <p className="text-gray-600">{profileData.department} Intern</p>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{profileData.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{profileData.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{profileData.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="department">Department</Label>
                      <p className="text-gray-900 font-medium">{profileData.department}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                  <CardDescription>
                    {isEditing ? "Select at least 3 interests for mentorship matching" : "Your selected interests"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {availableInterests.map((interest) => (
                          <Badge
                            key={interest}
                            variant={selectedInterests.includes(interest) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleInterestToggle(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">Selected: {selectedInterests.length} (minimum 3 required)</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests?.map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Squad and Manager Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Squad Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Squad</Label>
                      <p className="text-gray-900 font-medium">{squad?.name}</p>
                    </div>
                    <div>
                      <Label>Squad Members</Label>
                      <p className="text-gray-600">{squad?.members.length} members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Manager</Label>
                      <p className="text-gray-900 font-medium">{lineManager?.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-gray-600">{lineManager?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Internship Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Internship Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Start Date</Label>
                      <p className="text-gray-900 font-medium">
                        {new Date(profileData.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <p className="text-gray-900 font-medium">{new Date(profileData.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
