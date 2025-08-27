"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, FileText, ImageIcon, FileSpreadsheet, Presentation, Eye } from "lucide-react"
import { mockKnowledgeFiles } from "@/lib/mock-data"

export default function InternKnowledgePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "HR Documents", "IT Tools", "General", "Onboarding"]

  const filteredFiles = mockKnowledgeFiles.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || file.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "png":
      case "jpg":
        return <ImageIcon className="h-5 w-5 text-green-500" />
      case "xlsx":
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />
      case "pptx":
        return <Presentation className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const handleDownload = (fileName: string) => {
    // Simulate file download
    console.log(`Downloading ${fileName}`)
    // In a real app, this would trigger an actual download
  }

  const handlePreview = (fileName: string) => {
    // Simulate file preview
    console.log(`Previewing ${fileName}`)
    // In a real app, this would open a preview modal or new tab
  }

  return (
    <AuthGuard allowedRoles={["intern"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Knowledge Hub</h1>
                <p className="text-muted-foreground">
                  Access important documents, guides, and resources for your internship
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-5">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-sm font-medium truncate">{file.name}</CardTitle>
                                <CardDescription className="text-xs">{file.size}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {file.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="text-xs text-muted-foreground">
                              <p>Uploaded by: {file.uploaded_by}</p>
                              <p>Downloads: {file.downloads}</p>
                              <p>Date: {new Date(file.upload_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreview(file.name)}
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              <Button size="sm" onClick={() => handleDownload(file.name)} className="flex-1">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredFiles.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No files found</h3>
                      <p className="text-muted-foreground">Try adjusting your search terms or category filter</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
