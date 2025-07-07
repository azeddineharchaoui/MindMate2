"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  FileDown, 
  FileText, 
  FileCheck,
  Save,
  Calendar,
  Clock,
  CheckCircle,
  Info,
  Download,
  ClipboardList
} from "lucide-react"
import { exportComprehensiveReport, getUserProfile } from "@/lib/api"

const SessionExport: React.FC = () => {
  const { theme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [recentSessions, setRecentSessions] = useState<Array<{id: string, date: string, title: string}>>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  
  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('mindmate_token')
    const storedUserId = localStorage.getItem('mindmate_user_id')
    
    if (token && storedUserId) {
      setIsAuthenticated(true)
      setUserId(storedUserId)
      
      // Load user profile and recent sessions
      loadUserProfile(storedUserId)
    }
  }, [])
  
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
      
      // For demo purposes, generate some mock sessions
      // In a real implementation, this would come from the backend
      const mockSessions = [
        { id: "session_1", date: "2023-11-15", title: "Initial Assessment" },
        { id: "session_2", date: "2023-11-22", title: "Follow-up Session" },
        { id: "session_3", date: "2023-11-29", title: "Progress Review" },
        { id: "session_4", date: "2023-12-06", title: "CBT Session" },
        { id: "session_5", date: "2023-12-13", title: "Mindfulness Training" },
      ]
      setRecentSessions(mockSessions)
      
    } catch (err: any) {
      setError("Failed to load user profile. Please try again later.")
      console.error("Profile loading error:", err)
    }
  }
  
  const handleExportComprehensive = async () => {
    if (!userId) {
      setError("You must be logged in to export reports")
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await exportComprehensiveReport(userId, sessionId || undefined)
      setSuccess("Your comprehensive report has been successfully generated and downloaded.")
    } catch (err: any) {
      console.error("Export error:", err)
      setError(err.message || "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }
  
  const handleExportSession = async () => {
    if (!userId || !sessionId) {
      setError("Please select a session to export")
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await exportComprehensiveReport(userId, sessionId)
      setSuccess("Your session report has been successfully generated and downloaded.")
    } catch (err: any) {
      console.error("Export error:", err)
      setError(err.message || "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
    }`}>
      <HeaderCompo />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Session Export</h1>
            <p className="text-lg opacity-80">
              Generate and download comprehensive reports of your therapy sessions, 
              mood tracking data, and progress analytics
            </p>
          </div>
          
          {!isAuthenticated ? (
            <Alert className="mb-8">
              <Info className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You need to be logged in to access session export features.
                <div className="mt-4">
                  <Button onClick={() => window.location.href = "/login"}>
                    Login Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Card className={`mb-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileCheck className="mr-2 h-5 w-5" />
                    Export Individual Session
                  </CardTitle>
                  <CardDescription>
                    Download a detailed report of a specific therapy session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Session</label>
                      <Select value={sessionId} onValueChange={setSessionId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a session" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Sessions</SelectItem>
                          {recentSessions.map(session => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.date} - {session.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={handleExportSession}
                      disabled={loading || !sessionId}
                      className="w-full"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export Session Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`mb-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Comprehensive Progress Report
                  </CardTitle>
                  <CardDescription>
                    Generate a full report with mood trends, session summaries, and therapeutic progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userProfile && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className={`p-4 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 mr-2 opacity-70" />
                            <span className="text-sm opacity-70">Total Sessions</span>
                          </div>
                          <p className="text-2xl font-semibold">
                            {userProfile.session_stats?.total_sessions || 0}
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 mr-2 opacity-70" />
                            <span className="text-sm opacity-70">Last Session</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {userProfile.session_stats?.last_session 
                              ? new Date(userProfile.session_stats.last_session).toLocaleDateString() 
                              : "No sessions yet"}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleExportComprehensive}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate Comprehensive Report
                    </Button>
                    
                    <p className="text-sm opacity-70 text-center">
                      This report includes mood trends, session summaries, goals progress, 
                      and personalized insights based on your therapy journey.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default SessionExport
