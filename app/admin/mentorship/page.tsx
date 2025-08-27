"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminMentorship() {
  return (
    <AuthGuard allowedRoles={["hr_admin"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mentorship Matching</h1>
              <p className="text-gray-600">Match interns with suitable mentors</p>
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mentorship System</h3>
                <p className="text-gray-600">
                  Advanced mentorship matching system with AI-powered recommendations and manual assignment tools would
                  be implemented here.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
