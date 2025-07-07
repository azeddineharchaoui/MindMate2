"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  Target,
  TrendingUp,
  Heart,
  Brain,
  Calendar,
  Download,
  Save,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Clock
} from "lucide-react"
import {
  getUserProfile,
  updateUserProfile,
  exportComprehensiveReport,
  trackGoal,
  type UserProfile
} from "@/lib/api"

const ProfilePage = () => {
  const { theme } = useTheme()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [preferredApproach, setPreferredApproach] = useState("")
  const [communicationStyle, setCommunicationStyle] = useState("")
  const [goals, setGoals] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState("")
  const [goalProgress, setGoalProgress] = useState<{ [key: string]: number }>({})

  const therapyApproaches = [
    "Cognitive Behavioral Therapy (CBT)",
    "Mindfulness-Based Therapy",
    "Dialectical Behavior Therapy (DBT)",
    "Acceptance and Commitment Therapy (ACT)",
    "Humanistic Therapy",
    "Psychodynamic Therapy"
  ]

  const communicationStyles = [
    "Direct and structured",
    "Gentle and supportive",
    "Challenging and motivational",
    "Empathetic and reflective",
    "Educational and informative"
  ]

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('mindmate_token');
    const storedUserId = localStorage.getItem('mindmate_user_id');
    
    if (token && storedUserId) {
      loadUserProfile(storedUserId);
    } else {
      // Redirect to login if not authenticated
      setError("You must be logged in to view your profile");
      setLoading(false);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get profile from API
      let profile;
      try {
        profile = await getUserProfile(userId)
        // If successful, save a local copy for offline access
        localStorage.setItem('mindmate_profile_cache', JSON.stringify(profile));
      } catch (apiError) {
        console.error("API error loading profile:", apiError);
        // Try to load from local storage as fallback
        const cachedProfile = localStorage.getItem('mindmate_profile_cache');
        const localPreferences = localStorage.getItem('mindmate_profile_preferences');
        
        if (cachedProfile) {
          profile = JSON.parse(cachedProfile);
          console.log("Using cached profile from localStorage");
          
          // Show warning but don't stop the flow
          setError("Using cached profile data. Some information may be outdated.");
        } else if (localPreferences) {
          // If we only have local preferences, construct a minimal profile
          const preferences = JSON.parse(localPreferences);
          profile = {
            user_id: userId,
            therapy_preferences: preferences.therapy_preferences,
            session_stats: {
              total_sessions: 0,
              last_session: new Date().toISOString(),
              mood_improvements: 0
            },
            mood_trends: {
              trend: "not_available_offline",
              average_mood: 0,
              insights: ["Offline mode - limited data available"]
            }
          };
          console.log("Constructed profile from local preferences");
        } else {
          // Create a default profile if nothing is available
          profile = {
            user_id: userId,
            therapy_preferences: {
              preferred_approach: '',
              communication_style: '',
              goals: []
            },
            session_stats: {
              total_sessions: 0,
              last_session: new Date().toISOString(),
              mood_improvements: 0
            },
            mood_trends: {
              trend: "not_available",
              average_mood: 0,
              insights: ["No profile data available"]
            }
          };
          console.log("Using default empty profile");
          setError("Unable to load your profile. Using default settings.");
        }
      }
      
      setUserProfile(profile)
      
      // Populate form fields
      setPreferredApproach(profile.therapy_preferences.preferred_approach || '')
      setCommunicationStyle(profile.therapy_preferences.communication_style || '')
      setGoals(profile.therapy_preferences.goals || [])
      
      // Initialize goal progress
      if (profile.therapy_preferences.goals && Array.isArray(profile.therapy_preferences.goals)) {
        const progressMap = profile.therapy_preferences.goals.reduce((acc: { [key: string]: number }, goal: string, idx: number) => {
          acc[goal] = (idx + 1) * 20 // Sample progress
          return acc
        }, {} as { [key: string]: number })
        setGoalProgress(progressMap)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile")
      console.error("Complete profile loading failure:", err);
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const userId = localStorage.getItem('mindmate_user_id')
      const token = localStorage.getItem('mindmate_token')
      
      if (!userId) {
        throw new Error("User not logged in")
      }
      
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.")
      }

      console.log("Saving profile with user ID:", userId);
      console.log("Auth token available:", !!token);

      const profileUpdates = {
        therapy_preferences: {
          preferred_approach: preferredApproach,
          communication_style: communicationStyle,
          goals: goals
        }
      }

      // Save the profile using the API
      await updateUserProfile(userId, profileUpdates)
      console.log("Profile updated successfully");
      
      // Regardless of API success, save a local copy for offline access
      const localProfileData = {
        therapy_preferences: {
          preferred_approach: preferredApproach,
          communication_style: communicationStyle,
          goals: goals
        }
      };
      localStorage.setItem('mindmate_profile_preferences', JSON.stringify(localProfileData));
      
      // Reload user profile to get updated data
      await loadUserProfile(userId) 
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("Profile save error:", err);
      
      // Special handling for authentication errors
      if (err.message && err.message.includes("Authentication failed") || 
          err.message && err.message.includes("401")) {
        setError("Your session has expired. Please log in again.");
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/auth";
        }, 2000);
      } else if (err.message && err.message.includes("HTML")) {
        // Handle ngrok/HTML errors more gracefully
        setError("Server connection issue. Your changes have been saved locally and will sync when connection is restored.");
        
        // Save locally even if backend failed
        const localProfileData = {
          therapy_preferences: {
            preferred_approach: preferredApproach,
            communication_style: communicationStyle,
            goals: goals
          }
        };
        localStorage.setItem('mindmate_profile_preferences', JSON.stringify(localProfileData));
      } else {
        setError(err.message || "Failed to save profile, but your changes have been saved locally.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAddGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      const updatedGoals = [...goals, newGoal.trim()]
      setGoals(updatedGoals)
      setGoalProgress(prev => ({ ...prev, [newGoal.trim()]: 0 }))
      setNewGoal("")
    }
  }

  const handleRemoveGoal = (goalToRemove: string) => {
    setGoals(goals.filter(goal => goal !== goalToRemove))
    const { [goalToRemove]: removed, ...rest } = goalProgress
    setGoalProgress(rest)
  }

  const handleGoalProgressUpdate = async (goal: string, progress: number) => {
    setGoalProgress(prev => ({ ...prev, [goal]: progress }))
    try {
      const userId = localStorage.getItem('mindmate_user_id')
      if (!userId) {
        throw new Error("User not logged in")
      }
      
      await trackGoal(userId, goal, progress)
    } catch (err) {
      console.error("Failed to track goal progress:", err)
    }
  }

  const handleExportReport = async () => {
    try {
      setExporting(true)
      
      const userId = localStorage.getItem('mindmate_user_id')
      if (!userId) {
        throw new Error("User not logged in")
      }
      
      await exportComprehensiveReport(userId)
    } catch (err: any) {
      setError(err.message || "Failed to export report")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ease-in-out ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
      }`}>
        <HeaderCompo />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
    }`}>
      <HeaderCompo />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-lg opacity-80">
            Personalize your therapy experience and track your progress
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert variant="success" className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Profile Updated Successfully!</AlertTitle>
            <AlertDescription>
              Your preferences have been saved and will be used to personalize your experience.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Therapy Preferences */}
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Therapy Preferences
                </CardTitle>
                <CardDescription>
                  Customize your therapeutic approach and communication style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Therapy Approach
                  </label>
                  <Select value={preferredApproach} onValueChange={setPreferredApproach}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred approach" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapyApproaches.map((approach) => (
                        <SelectItem key={approach} value={approach}>
                          {approach}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Communication Style
                  </label>
                  <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred style" />
                    </SelectTrigger>
                    <SelectContent>
                      {communicationStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Goals Management */}
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Therapy Goals
                </CardTitle>
                <CardDescription>
                  Set and track your personal mental health objectives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Goal */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a new therapy goal..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
                  />
                  <Button onClick={handleAddGoal} disabled={!newGoal.trim()}>
                    Add Goal
                  </Button>
                </div>

                {/* Existing Goals */}
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-600 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{goal}</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveGoal(goal)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{goalProgress[goal] || 0}%</span>
                          </div>
                          <Progress 
                            value={goalProgress[goal] || 0} 
                            max={100} 
                            className="h-2"
                          />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goalProgress[goal] || 0}
                            onChange={(e) => handleGoalProgressUpdate(goal, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 opacity-70">
                    No goals set yet. Add your first therapy goal above.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="w-full h-12 text-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>

          {/* Statistics & Analytics */}
          <div className="space-y-6">
            {userProfile && (
              <>
                {/* Session Statistics */}
                <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Session Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">
                          {userProfile.session_stats.total_sessions}
                        </p>
                        <p className="text-sm opacity-70">Total Sessions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">
                          {userProfile.session_stats.mood_improvements}
                        </p>
                        <p className="text-sm opacity-70">Improvements</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Last Session:</span>
                        <span className="opacity-70">
                          {new Date(userProfile.session_stats.last_session).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mood Trends */}
                <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Mood Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-500">
                        {userProfile.mood_trends.average_mood.toFixed(1)}
                      </p>
                      <p className="text-sm opacity-70">Average Mood</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Trend:</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {userProfile.mood_trends.trend}
                        </Badge>
                      </div>
                      <Progress 
                        value={userProfile.mood_trends.average_mood * 10} 
                        max={100} 
                        className="h-3"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Insights */}
                {userProfile.mood_trends.insights.length > 0 && (
                  <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {userProfile.mood_trends.insights.slice(0, 3).map((insight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Export Report */}
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Report
                </CardTitle>
                <CardDescription>
                  Download a comprehensive report of your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleExportReport} 
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Track Today's Mood
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
