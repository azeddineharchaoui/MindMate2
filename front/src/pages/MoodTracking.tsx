"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  TrendingUp, 
  Calendar,
  Smile,
  Frown,
  Meh,
  CheckCircle,
  Save,
  BarChart3,
  Target,
  AlertCircle,
  LockIcon,
  UserIcon
} from "lucide-react"
import { trackMood, getUserProfile, type MoodEntry, type UserProfile } from "@/lib/api"
import { useNavigate } from "react-router-dom"

const MoodTrackingPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const emotions = [
    "Happy", "Sad", "Anxious", "Calm", "Angry", "Peaceful",
    "Excited", "Depressed", "Hopeful", "Worried", "Grateful", "Frustrated",
    "Confident", "Insecure", "Energetic", "Tired", "Focused", "Scattered"
  ]

  const moodLabels = [
    { range: [1, 2], label: "Very Low", color: "text-red-600", icon: <Frown className="h-5 w-5" /> },
    { range: [3, 4], label: "Low", color: "text-orange-600", icon: <Frown className="h-5 w-5" /> },
    { range: [5, 6], label: "Neutral", color: "text-yellow-600", icon: <Meh className="h-5 w-5" /> },
    { range: [7, 8], label: "Good", color: "text-green-600", icon: <Smile className="h-5 w-5" /> },
    { range: [9, 10], label: "Excellent", color: "text-blue-600", icon: <Smile className="h-5 w-5" /> },
  ]

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('mindmate_token');
    const storedUserId = localStorage.getItem('mindmate_user_id');
    
    if (token && storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    } else {
      // Allow anonymous usage with a warning
      setUserId(`guest_${Date.now()}`);
      setIsAuthenticated(false);
    }
  }, []);

  // Load user profile when userId is available
  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading profile for user: ${userId}`);
      const profile = await getUserProfile(userId);
      
      // Double-check that all required properties exist and are valid
      if (!profile || typeof profile !== 'object') {
        throw new Error("Invalid profile data returned");
      }
      
      // Validate and ensure mood_trends exists with all required properties
      if (!profile.mood_trends) {
        console.warn("No mood_trends in profile, creating default");
        profile.mood_trends = {
          trend: "stable",
          average_mood: 5.0,
          insights: []
        };
      } else {
        // Ensure average_mood is a number
        if (typeof profile.mood_trends.average_mood !== 'number') {
          console.warn("Missing or invalid average_mood in profile.mood_trends", profile.mood_trends);
          profile.mood_trends.average_mood = 5.0;
        }
        
        // Ensure insights is an array
        if (!profile.mood_trends.insights || !Array.isArray(profile.mood_trends.insights)) {
          console.warn("Missing or invalid insights array in profile.mood_trends");
          profile.mood_trends.insights = [];
        }
        
        // Ensure trend is a string
        if (typeof profile.mood_trends.trend !== 'string') {
          console.warn("Missing or invalid trend in profile.mood_trends");
          profile.mood_trends.trend = "stable";
        }
      }
      
      setUserProfile(profile);
      console.log("Profile loaded successfully with mood trends:", profile.mood_trends);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      
      // Create a fallback profile directly in the component
      const fallbackProfile = {
        user_id: userId,
        therapy_preferences: {
          preferred_approach: "cbt",
          communication_style: "supportive",
          goals: ["Manage stress", "Improve mood"]
        },
        session_stats: {
          total_sessions: 0,
          last_session: new Date().toISOString(),
          mood_improvements: 0
        },
        mood_trends: {
          trend: "stable",
          average_mood: 5.0,
          insights: ["Error loading profile", "Using fallback data", "Check your connection"]
        }
      };
      
      setUserProfile(fallbackProfile);
      setError("Failed to load your profile data. Using offline mode.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMoodLabel = () => {
    const label = moodLabels.find(l => moodScore >= l.range[0] && moodScore <= l.range[1]);
    return label || moodLabels[2]; // Default to neutral
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID is required. Please login to track your mood.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const moodData: MoodEntry = {
        user_id: userId,
        mood_score: moodScore,
        emotions: selectedEmotions,
        notes: notes.trim()
      };

      console.log("Submitting mood data:", moodData);
      const result = await trackMood(moodData);
      console.log("Mood tracking result:", result);
      
      // Check if it's local-only mode
      let successMessage = "Your mood has been tracked successfully!";
      if (result.status === "local_only") {
        successMessage = "Your mood has been saved locally (offline mode). It will sync when connection is restored.";
      }
      
      // Reload profile to get updated trends
      await loadUserProfile();
      
      setSuccess(true);
      
      // Reset form
      setSelectedEmotions([]);
      setNotes("");
      
      // Show toast with appropriate message
      console.log(successMessage);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to track mood:", err);
      
      // Provide more detailed error message
      const errorMessage = err.message || "Failed to track your mood. Please try again.";
      setError(errorMessage);
      
      // If it's a network error, suggest offline mode
      if (errorMessage.includes("Network") || errorMessage.includes("CORS")) {
        setError("Network error: Your mood was saved locally. It will sync when connection is restored.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
    }`}>
      <HeaderCompo />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
          }`}>
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Mood Tracking</h1>
          <p className="text-lg opacity-80 max-w-3xl mx-auto">
            Monitor your emotional wellbeing and track mood patterns over time
          </p>
        </div>
        
        {!isAuthenticated && (
          <Alert variant="warning" className="mb-4 border-yellow-500 bg-yellow-50 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You're in guest mode</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Sign in to save your mood history and get personalized insights.</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 text-yellow-700 border-yellow-300"
                onClick={() => navigate('/login')}
              >
                <UserIcon className="h-4 w-4 mr-1" />
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.includes("local") ? (
                <span className="flex flex-col gap-1">
                  <span>{error}</span>
                  <span className="text-sm opacity-80">Your data is still saved locally</span>
                </span>
              ) : (
                error
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {userProfile?.mood_trends?.trend === "local_only" ? (
                "Your mood has been saved locally. It will sync when connection is restored."
              ) : (
                "Your mood has been tracked successfully!"
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Entry Card */}
          <Card className={`lg:col-span-2 ${theme === "dark" ? "bg-gray-800 border-gray-700" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                How are you feeling today?
              </CardTitle>
              <CardDescription>
                Track your mood and emotions to build self-awareness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Your Mood</h3>
                  <div className={`flex items-center gap-2 ${getCurrentMoodLabel().color}`}>
                    {getCurrentMoodLabel().icon}
                    <span className="font-medium">{getCurrentMoodLabel().label}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between mt-2 text-xs">
                    <span>Very Low</span>
                    <span>Neutral</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
              
              {/* Emotions Selection */}
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Select Emotions</h3>
                <div className="flex flex-wrap gap-2">
                  {emotions.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        selectedEmotions.includes(emotion)
                          ? theme === "dark" 
                            ? "bg-blue-600 text-white" 
                            : "bg-blue-500 text-white"
                          : theme === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Notes (Optional)</h3>
                <Textarea
                  placeholder="What's contributing to your mood? Any thoughts or events to note?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
              
              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Mood Entry
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* Mood Analytics Card */}
          <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Your Mood Trends
              </CardTitle>
              <CardDescription>
                Insights from your tracking history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userProfile && userProfile.mood_trends ? (
                <>
                  {/* Average Mood - With defensive checks for mood_trends properties */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Average Mood</h3>
                      <Badge variant="outline">
                        {(typeof userProfile.mood_trends.average_mood === 'number' 
                          ? userProfile.mood_trends.average_mood 
                          : 5).toFixed(1)}/10
                      </Badge>
                    </div>
                    <Progress 
                      value={(typeof userProfile.mood_trends.average_mood === 'number' 
                        ? userProfile.mood_trends.average_mood 
                        : 5) * 10} 
                      className="h-2" 
                    />
                  </div>
                  
                  {/* Trend - With safe fallbacks */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Overall Trend</h3>
                    <div className="flex items-center gap-2">
                      {(() => {
                        // Safe access to trend with fallback
                        const trend = typeof userProfile.mood_trends.trend === 'string' 
                          ? userProfile.mood_trends.trend 
                          : 'stable';
                          
                        if (trend === 'improving') {
                          return (
                            <>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Improving
                              </Badge>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </>
                          );
                        } else if (trend === 'declining') {
                          return (
                            <>
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Declining
                              </Badge>
                              <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
                            </>
                          );
                        } else {
                          return (
                            <>
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                {trend === 'not_enough_data' ? 'Need More Data' : 'Stable'}
                              </Badge>
                              <TrendingUp className="h-4 w-4 text-yellow-500 transform rotate-90" />
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  
                  {/* Insights - With comprehensive error handling */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Insights</h3>
                    <ul className="space-y-2">
                      {(() => {
                        // Safely access insights with multiple fallbacks
                        try {
                          if (userProfile.mood_trends.insights && 
                              Array.isArray(userProfile.mood_trends.insights) && 
                              userProfile.mood_trends.insights.length > 0) {
                            return userProfile.mood_trends.insights.map((insight, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{insight || "Keep tracking your mood"}</span>
                              </li>
                            ));
                          }
                        } catch (err) {
                          console.error("Error rendering insights:", err);
                        }
                        
                        // Default fallback if insights are invalid or empty
                        return (
                          <li className="text-sm italic opacity-70">
                            Track your mood regularly to receive personalized insights
                          </li>
                        );
                      })()}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No data yet</h3>
                  <p className="text-sm opacity-70">
                    Start tracking your mood to see trends and insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tips for Mood Management */}
        <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Tips for Mood Management
            </CardTitle>
            <CardDescription>
              Evidence-based strategies to improve emotional wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/*
                {
                  title: "Physical Activity",
                  description: "Even short bursts of exercise can boost endorphins and improve mood significantly.",
                  icon: <Heart className="h-10 w-10 mb-2 text-red-500" />
                },
                {
                  title: "Mindfulness Practice",
                  description: "Regular meditation and mindfulness reduces stress and improves emotional regulation.",
                  icon: <Brain className="h-10 w-10 mb-2 text-blue-500" />
                },
                {
                  title: "Social Connection",
                  description: "Quality time with supportive people is strongly linked to improved mental health.",
                  icon: <Users className="h-10 w-10 mb-2 text-green-500" />
                },
              */}
              {/*
                {
                  title: "Physical Activity",
                  description: "Even short bursts of exercise can boost endorphins and improve mood significantly.",
                  icon: <Heart className="h-10 w-10 mb-2 text-red-500" />
                },
                {
                  title: "Mindfulness Practice",
                  description: "Regular meditation and mindfulness reduces stress and improves emotional regulation.",
                  icon: <Brain className="h-10 w-10 mb-2 text-blue-500" />
                },
                {
                  title: "Social Connection",
                  description: "Quality time with supportive people is strongly linked to improved mental health.",
                  icon: <Users className="h-10 w-10 mb-2 text-green-500" />
                },
              */}
              {/*
                {
                  title: "Physical Activity",
                  description: "Even short bursts of exercise can boost endorphins and improve mood significantly.",
                  icon: <Heart className="h-10 w-10 mb-2 text-red-500" />
                },
                {
                  title: "Mindfulness Practice",
                  description: "Regular meditation and mindfulness reduces stress and improves emotional regulation.",
                  icon: <Brain className="h-10 w-10 mb-2 text-blue-500" />
                },
                {
                  title: "Social Connection",
                  description: "Quality time with supportive people is strongly linked to improved mental health.",
                  icon: <Users className="h-10 w-10 mb-2 text-green-500" />
                },
              */}
              {/*
                {
                  title: "Physical Activity",
                  description: "Even short bursts of exercise can boost endorphins and improve mood significantly.",
                  icon: <Heart className="h-10 w-10 mb-2 text-red-500" />
                },
                {
                  title: "Mindfulness Practice",
                  description: "Regular meditation and mindfulness reduces stress and improves emotional regulation.",
                  icon: <Brain className="h-10 w-10 mb-2 text-blue-500" />
                },
                {
                  title: "Social Connection",
                  description: "Quality time with supportive people is strongly linked to improved mental health.",
                  icon: <Users className="h-10 w-10 mb-2 text-green-500" />
                },
              */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MoodTrackingPage
