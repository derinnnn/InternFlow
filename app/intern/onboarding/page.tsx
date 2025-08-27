"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { mockOnboardingTasks } from "@/lib/mock-data"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InternOnboarding() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState(mockOnboardingTasks)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])

  useEffect(() => {
    // Load completed tasks from localStorage
    const saved = localStorage.getItem(`onboarding_${user?.id}`)
    if (saved) {
      const completed = JSON.parse(saved)
      setCompletedTasks(completed)
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          completed: completed.includes(task.id),
        })),
      )
    }
  }, [user])

  const handleTaskToggle = (taskId: number) => {
    const newCompleted = tasks.find((t) => t.id === taskId)?.completed
      ? completedTasks.filter((id) => id !== taskId)
      : [...completedTasks, taskId]

    setCompletedTasks(newCompleted)
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))

    // Save to localStorage
    localStorage.setItem(`onboarding_${user?.id}`, JSON.stringify(newCompleted))

    toast({
      title: newCompleted.includes(taskId) ? "Task Completed" : "Task Unchecked",
      description: `Onboarding progress updated.`,
    })
  }

  const totalTasks = tasks.length
  const completedCount = tasks.filter((t) => t.completed).length
  const progressPercentage = (completedCount / totalTasks) * 100

  const tasksByCategory = tasks.reduce(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = []
      }
      acc[task.category].push(task)
      return acc
    },
    {} as Record<string, typeof tasks>,
  )

  const getCategoryProgress = (category: string) => {
    const categoryTasks = tasksByCategory[category]
    const completed = categoryTasks.filter((t) => t.completed).length
    return (completed / categoryTasks.length) * 100
  }

  const getCategoryIcon = (category: string) => {
    const progress = getCategoryProgress(category)
    if (progress === 100) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (progress > 0) return <Clock className="h-5 w-5 text-blue-600" />
    return <AlertCircle className="h-5 w-5 text-gray-400" />
  }

  return (
    <AuthGuard allowedRoles={["intern"]}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Onboarding Tracker</h1>
              <p className="text-gray-600">Complete your setup to get started</p>
            </div>

            {/* Overall Progress */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>
                  {completedCount} of {totalTasks} tasks completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Category Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {Object.keys(tasksByCategory).map((category) => (
                <Card key={category}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{category}</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(getCategoryProgress(category))}%</p>
                      </div>
                      {getCategoryIcon(category)}
                    </div>
                    <Progress value={getCategoryProgress(category)} className="h-2 mt-3" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Task Lists by Category */}
            <div className="space-y-6">
              {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {category}
                      </CardTitle>
                      <Badge variant={getCategoryProgress(category) === 100 ? "default" : "secondary"}>
                        {categoryTasks.filter((t) => t.completed).length}/{categoryTasks.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryTasks.map((task) => (
                        <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleTaskToggle(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                              >
                                {task.title}
                                {task.required && <span className="text-red-500 ml-1">*</span>}
                              </h4>
                              {task.eta && (
                                <Badge variant="outline" className="text-xs">
                                  ETA: {new Date(task.eta).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                              {task.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Completion Message */}
            {progressPercentage === 100 && (
              <Card className="mt-6 bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Congratulations! 🎉</h3>
                  <p className="text-green-700">You've completed all your onboarding tasks. Welcome to the team!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
