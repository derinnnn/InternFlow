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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockUsers, mockSquads, skillCategories, mockDepartments, mockMentorshipGroups } from "@/lib/mock-data"
import { Camera, Edit2, Save, X, AlertTriangle, FileText, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const assignMentorshipGroup = (internInterests: string[], allUsers: any[], existingGroups: any[]) => {
  // Find other interns with similar interests
  const otherInterns = allUsers.filter((u) => u.role === "intern" && u.interests && u.interests.length > 0)

  // Calculate interest overlap with each intern
  const interestMatches = otherInterns
    .map((intern) => {
      const sharedInterests = internInterests.filter((interest) => intern.interests.includes(interest))
      return {
        intern,
        sharedInterests,
        overlapCount: sharedInterests.length,
      }
    })
    .filter((match) => match.overlapCount >= 2) // Minimum 2 shared interests

  // Try to find existing group with space and good interest match
  for (const group of existingGroups) {
    if (group.members.length < 6) {
      // Max 6 members per group
      const groupInterests = group.sharedInterests
      const commonWithGroup = internInterests.filter((interest) => groupInterests.includes(interest))
      if (commonWithGroup.length >= 2) {
        return {
          groupId: group.id,
          groupName: group.name,
          sharedInterests: commonWithGroup,
        }
      }
    }
  }

  // Create new group if no suitable existing group found
  const topMatches = interestMatches.sort((a, b) => b.overlapCount - a.overlapCount).slice(0, 2) // Get top 2 matches for new group

  if (topMatches.length > 0) {
    const allSharedInterests = internInterests.filter((interest) =>
      topMatches.every((match) => match.sharedInterests.includes(interest)),
    )

    const newGroupId = `mentor_${Date.now()}`
    const groupName = `${allSharedInterests.slice(0, 2).join(" & ")} Group`

    return {
      groupId: newGroupId,
      groupName,
      sharedInterests: allSharedInterests,
      isNewGroup: true,
    }
  }

  // Fallback: assign to general group
  return {
    groupId: "mentor_general",
    groupName: "General Skills Group",
    sharedInterests: internInterests.slice(0, 3),
  }
}

export default function InternProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [editData, setEditData] = useState<any>({})
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [skillSearch, setSkillSearch] = useState("")
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [complaintType, setComplaintType] = useState<"poor_treatment" | "department_change" | null>(null)
  const [complaintData, setComplaintData] = useState({
    description: "",
    requestedDepartment: "",
    reasonForNewDept: "",
  })

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
    if (selectedInterests.length < 3) {
      toast({
        title: "Insufficient Interests",
        description: "Please select at least 3 interests for mentorship matching.",
        variant: "destructive",
      })
      return
    }

    if (selectedInterests.length > 5) {
      toast({
        title: "Too Many Interests",
        description: "Please select maximum 5 interests for focused mentorship matching.",
        variant: "destructive",
      })
      return
    }

    // Assign mentorship group based on interests
    const groupAssignment = assignMentorshipGroup(selectedInterests, mockUsers, mockMentorshipGroups)

    // Simulate saving profile data
    const updatedData = {
      ...editData,
      interests: selectedInterests,
      mentorship_group_id: groupAssignment.groupId,
    }
    setProfileData(updatedData)
    setIsEditing(false)

    // Update localStorage
    const updatedUser = { ...user, ...updatedData }
    localStorage.setItem("internflow_user", JSON.stringify(updatedUser))

    // Save group assignment if new group was created
    if (groupAssignment.isNewGroup) {
      const existingGroups = JSON.parse(localStorage.getItem("internflow_mentorship_groups") || "[]")
      const newGroup = {
        id: groupAssignment.groupId,
        name: groupAssignment.groupName,
        members: [user?.id],
        sharedInterests: groupAssignment.sharedInterests,
        createdDate: new Date(),
        description: `Focused on ${groupAssignment.sharedInterests.join(", ").toLowerCase()}`,
      }
      existingGroups.push(newGroup)
      localStorage.setItem("internflow_mentorship_groups", JSON.stringify(existingGroups))
    }

    toast({
      title: "Profile Updated",
      description: `Profile updated and assigned to ${groupAssignment.groupName}!`,
    })
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const filteredSkills = skillCategories.filter((skill) => skill.toLowerCase().includes(skillSearch.toLowerCase()))

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

  const handleComplaintSubmit = () => {
    if (!complaintType) {
      toast({
        title: "Error",
        description: "Please select a complaint type.",
        variant: "destructive",
      })
      return
    }

    if (!complaintData.description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description.",
        variant: "destructive",
      })
      return
    }

    if (
      complaintType === "department_change" &&
      (!complaintData.requestedDepartment || !complaintData.reasonForNewDept.trim())
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for department change request.",
        variant: "destructive",
      })
      return
    }

    // Create complaint object
    const complaint = {
      id: Date.now(),
      internId: user?.id,
      internName: user?.name,
      type: complaintType,
      description: complaintData.description,
      requestedDepartment: complaintType === "department_change" ? complaintData.requestedDepartment : undefined,
      reasonForNewDept: complaintType === "department_change" ? complaintData.reasonForNewDept : undefined,
      status: "pending",
      timestamp: new Date().toISOString(),
      hrNotes: "",
    }

    // Save to localStorage
    const existingComplaints = JSON.parse(localStorage.getItem("internflow_complaints") || "[]")
    const updatedComplaints = [complaint, ...existingComplaints]
    localStorage.setItem("internflow_complaints", JSON.stringify(updatedComplaints))

    // Reset form
    setComplaintData({
      description: "",
      requestedDepartment: "",
      reasonForNewDept: "",
    })
    setComplaintType(null)
    setShowComplaintForm(false)

    toast({
      title: "Complaint Submitted",
      description: "Your complaint has been submitted to HR for review.",
    })
  }

  if (!profileData) {
    return <div>Loading...</div>
  }

  const squad = mockSquads.find((s) => s.id === profileData.squad_id)
  const lineManager = mockUsers.find((u) => u.id === profileData.line_manager_id)
  const mentorshipGroup = mockMentorshipGroups.find((g) => g.id === profileData.mentorship_group_id)

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
              <div className="flex gap-2">
                <Dialog open={showComplaintForm} onOpenChange={setShowComplaintForm}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      File Complaint
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>File Complaint or Request</DialogTitle>
                      <DialogDescription>
                        Submit a complaint about poor treatment or request a department change
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium">Type of Complaint/Request</Label>
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="poor_treatment"
                              checked={complaintType === "poor_treatment"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setComplaintType("poor_treatment")
                                  setComplaintData({
                                    description: "",
                                    requestedDepartment: "",
                                    reasonForNewDept: "",
                                  })
                                }
                              }}
                            />
                            <Label htmlFor="poor_treatment" className="cursor-pointer">
                              Poor treatment or unprofessional behavior
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="department_change"
                              checked={complaintType === "department_change"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setComplaintType("department_change")
                                  setComplaintData({
                                    description: "",
                                    requestedDepartment: "",
                                    reasonForNewDept: "",
                                  })
                                }
                              }}
                            />
                            <Label htmlFor="department_change" className="cursor-pointer">
                              Request department change
                            </Label>
                          </div>
                        </div>
                      </div>

                      {complaintType && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="description">
                              {complaintType === "poor_treatment"
                                ? "Detailed Description"
                                : "Current Situation Description"}
                            </Label>
                            <Textarea
                              id="description"
                              placeholder={
                                complaintType === "poor_treatment"
                                  ? "Please describe the incident(s) in detail..."
                                  : "Describe your current situation and why you want to change departments..."
                              }
                              value={complaintData.description}
                              onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                              rows={4}
                              className="mt-1"
                            />
                          </div>

                          {complaintType === "department_change" && (
                            <>
                              <div>
                                <Label htmlFor="requestedDepartment">Preferred Department</Label>
                                <Select
                                  value={complaintData.requestedDepartment}
                                  onValueChange={(value) =>
                                    setComplaintData({ ...complaintData, requestedDepartment: value })
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockDepartments
                                      .filter((dept) => dept.name !== profileData.department)
                                      .map((dept) => (
                                        <SelectItem key={dept.id} value={dept.name}>
                                          {dept.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="reasonForNewDept">
                                  Why would you be a good fit for this department?
                                </Label>
                                <Textarea
                                  id="reasonForNewDept"
                                  placeholder="Explain your skills, interests, and experience that make you suitable for this department..."
                                  value={complaintData.reasonForNewDept}
                                  onChange={(e) =>
                                    setComplaintData({ ...complaintData, reasonForNewDept: e.target.value })
                                  }
                                  rows={3}
                                  className="mt-1"
                                />
                              </div>
                            </>
                          )}

                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleComplaintSubmit} className="flex-1">
                              <FileText className="h-4 w-4 mr-2" />
                              Submit {complaintType === "poor_treatment" ? "Complaint" : "Request"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowComplaintForm(false)
                                setComplaintType(null)
                                setComplaintData({
                                  description: "",
                                  requestedDepartment: "",
                                  reasonForNewDept: "",
                                })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

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

              {/* Enhanced Skills & Interests */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Skills & Interests</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Select 3-5 skills for mentorship group matching"
                      : "Your selected skills and interests"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search skills..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                        {filteredSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant={selectedInterests.includes(skill) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => handleInterestToggle(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span
                          className={`${selectedInterests.length < 3 ? "text-red-600" : selectedInterests.length > 5 ? "text-orange-600" : "text-green-600"}`}
                        >
                          Selected: {selectedInterests.length} (3-5 required for mentorship matching)
                        </span>
                        {selectedInterests.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInterests([])}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
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

              {/* Squad Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Squad Information</CardTitle>
                  <CardDescription>Date-based internship group</CardDescription>
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
                  <CardTitle>Mentorship Group</CardTitle>
                  <CardDescription>Interest-based learning group</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Group</Label>
                      <p className="text-gray-900 font-medium">{mentorshipGroup?.name || "Not assigned"}</p>
                    </div>
                    {mentorshipGroup && (
                      <>
                        <div>
                          <Label>Shared Interests</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mentorshipGroup.sharedInterests.slice(0, 3).map((interest: string) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Group Members</Label>
                          <p className="text-gray-600">{mentorshipGroup.members.length} members</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Line Manager */}
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
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Internship Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
