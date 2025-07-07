"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  Shield, 
  BookOpen, 
  Target, 
  FileText, 
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react"
import {
  checkBackendStatus,
  getUserProfile,
  searchResources,
  getTherapyModules,
  trackMood,
  exportComprehensiveReport,
  type BackendStatus,
  type UserProfile,
  type TherapyModules
} from "@/lib/api"

// Import API functions and base URL
import { API_BASE_URL, checkApiConnection } from "@/lib/api"

const Dashboard = () => {
  const { theme } = useTheme()
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [therapyModules, setTherapyModules] = useState<TherapyModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMood, setCurrentMood] = useState<number>(5)
  const [userId, setUserId] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('mindmate_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    
    // Handle ngrok authorization first if needed
    const handleNgrokAuth = async () => {
      if (API_BASE_URL.includes('ngrok')) {
        try {
          // Import the authorizeNgrok function
          const { authorizeNgrok } = await import('@/lib/api');
          
          // Try to pre-authorize the ngrok tunnel before loading data
          console.log('Pre-authorizing ngrok tunnel...');
          await authorizeNgrok();
          console.log('Ngrok pre-authorization completed');
        } catch (err) {
          console.warn('Ngrok pre-authorization failed:', err);
        }
      }
      
      // Now load the dashboard data
      loadDashboardData();
    };
    
    // Start the process
    handleNgrokAuth();
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading dashboard data...');
      
      // Get authenticated user ID
      const storedUserId = localStorage.getItem('mindmate_user_id');
      if (!storedUserId) {
        setError("User authentication required");
        setLoading(false);
        return;
      }
      setUserId(storedUserId);
      console.log('Authenticated user ID:', storedUserId);
      
      // Try to authorize ngrok first if needed
      if (API_BASE_URL.includes('ngrok')) {
        try {
          // Import the authorizeNgrok function
          const { authorizeNgrok } = await import('@/lib/api');
          
          // Try to pre-authorize the ngrok tunnel before loading data
          console.log('Pre-authorizing ngrok tunnel before API calls...');
          await authorizeNgrok();
          console.log('Ngrok pre-authorization completed');
        } catch (err) {
          console.warn('Ngrok pre-authorization failed:', err);
        }
      }
      
      // Check local storage for cached data to use immediately while waiting for API
      const cachedProfile = localStorage.getItem('mindmate_profile_cache');
      if (cachedProfile) {
        try {
          const profileData = JSON.parse(cachedProfile);
          console.log('Using cached profile temporarily:', profileData);
          setUserProfile(profileData);
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }
      
      // Fallback data
      const fallbackStatus: BackendStatus = {
        status: "offline",
        model: "fallback",
        whisper_loaded: false,
        features: {
          mood_tracking: true,
          crisis_detection: true,
          goal_tracking: true,
          personalization: true
        }
      };
      
      // Check connectivity to API before attempting data loads
      let isConnected = false;
      let backendAvailable = false;
      
      try {
        // Use our dedicated API check function from api.ts
        isConnected = await checkApiConnection();
        console.log('API connectivity check:', isConnected ? 'Connected' : 'Disconnected');
        
        if (isConnected) {
          // If the connection is established, try to get actual status data
          try {
            // Add cache-busting parameter
            const timestamp = new Date().getTime();
            const response = await fetch(`${API_BASE_URL}/api/status?_=${timestamp}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              },
              mode: 'cors',
              signal: AbortSignal.timeout(5000) // Give it a bit more time
            });
            
            if (response.ok) {
              // Check if the response is actually JSON and not HTML
              const contentType = response.headers.get('content-type');
              
              if (contentType && contentType.includes('application/json')) {
                try {
                  const data = await response.json();
                  console.log('API status check successful, received:', data);
                  
                  // Update the status with actual backend data
                  setBackendStatus(data);
                  backendAvailable = true;
                } catch (parseError) {
                  console.warn('API returned OK but invalid JSON:', parseError);
                  // Likely HTML response from ngrok - try to authorize again
                  const { authorizeNgrok } = await import('@/lib/api');
                  await authorizeNgrok();
                }
              } else {
                console.warn('API returned non-JSON content type:', contentType);
                // Likely HTML response from ngrok - try to authorize again
                const { authorizeNgrok } = await import('@/lib/api');
                await authorizeNgrok();
                
                // Save the fallback status since we'll need it
                setBackendStatus(fallbackStatus);
              }
            } else {
              console.warn('API returned non-OK status:', response.status);
              // Use fallback status
              setBackendStatus(fallbackStatus);
            }
          } catch (statusError) {
            console.warn('Failed to fetch detailed status after connectivity check:', statusError);
            // Use fallback status
            setBackendStatus(fallbackStatus);
          }
        } else {
          console.warn('API connectivity check returned false');
          // Use fallback status
          setBackendStatus(fallbackStatus);
        }
      } catch (e) {
        console.warn('API connectivity test failed:', e);
        isConnected = false;
        // Use fallback status
        setBackendStatus(fallbackStatus);
      }
      
      // We already handled the backend status check above, so we don't need to call checkBackendStatus again
      // Focus on loading user profile data and therapy modules
      
      // Load user profile with enhanced error handling
      let profileLoaded = false;
      
      try {
        // Attempt to load profile with retry for HTML responses
        let retries = 0;
        const maxRetries = 2;
        
        while (!profileLoaded && retries <= maxRetries) {
          try {
            console.log(`Attempt ${retries + 1}/${maxRetries + 1} to load user profile`);
            const profile = await getUserProfile(storedUserId);
            
            // Check if we got a valid profile object
            if (profile && profile.user_id) {
              console.log('User profile loaded successfully:', profile);
              setUserProfile(profile);
              
              // Save to cache for future use
              localStorage.setItem('mindmate_profile_cache', JSON.stringify(profile));
              localStorage.setItem('mindmate_profile_cache_time', Date.now().toString());
              
              profileLoaded = true;
              break;
            } else {
              console.warn('Received invalid profile format');
              retries++;
              
              // Try to authorize ngrok before retry
              if (API_BASE_URL.includes('ngrok')) {
                const { authorizeNgrok } = await import('@/lib/api');
                await authorizeNgrok();
              }
            }
          } catch (attemptError) {
            console.warn(`Profile load attempt ${retries + 1} failed:`, attemptError);
            retries++;
            
            // Try to authorize ngrok before retry
            if (API_BASE_URL.includes('ngrok')) {
              const { authorizeNgrok } = await import('@/lib/api');
              await authorizeNgrok();
            }
            
            // Short delay before retry
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      } catch (profileError) {
        console.error('All attempts to load profile failed:', profileError);
      }
      
      // If profile wasn't loaded successfully, use cache or fallback
      if (!profileLoaded) {
        console.log('Using cached or fallback profile data');
        
        // Check if we have cached data to use
        if (cachedProfile) {
          try {
            const parsedProfile = JSON.parse(cachedProfile);
            console.log('Using cached profile data:', parsedProfile);
            setUserProfile(parsedProfile);
          } catch (e) {
            console.error('Failed to parse cached profile:', e);
            useFallbackProfile();
          }
        } else {
          useFallbackProfile();
        }
      }
      
      // Function to set fallback profile when all else fails
      function useFallbackProfile() {
        console.log('Using fallback profile data');
        setUserProfile({
          user_id: storedUserId || 'guest_user',  // Ensure we always have a string user_id
          therapy_preferences: {
            preferred_approach: "cbt",
            communication_style: "supportive",
            goals: ["Reduce anxiety", "Improve sleep"]
          },
          session_stats: {
            total_sessions: 3,
            last_session: new Date().toISOString(),
            mood_improvements: 2
          },
          mood_trends: {
            trend: "improving",
            average_mood: 7.2,
            insights: ["Offline mode - using demo data", "Connect to internet for your real data"]
          }
        });
        
        // Cache this fallback profile for future use
        try {
          localStorage.setItem('mindmate_profile_cache', JSON.stringify(userProfile));
          localStorage.setItem('mindmate_profile_cache_time', Date.now().toString());
        } catch (e) {
          console.error('Failed to cache fallback profile:', e);
        }
      }
      
      // Load therapy modules with enhanced error handling
      let modulesLoaded = false;
      
      try {
        // Attempt to load therapy modules with retry for HTML responses
        let retries = 0;
        const maxRetries = 2;
        
        while (!modulesLoaded && retries <= maxRetries) {
          try {
            console.log(`Attempt ${retries + 1}/${maxRetries + 1} to load therapy modules`);
            const modules = await getTherapyModules();
            
            // Check if we got valid modules
            if (modules && modules.modules) {
              console.log('Therapy modules loaded successfully:', modules);
              setTherapyModules(modules);
              
              // Cache modules for future use
              localStorage.setItem('mindmate_modules_cache', JSON.stringify(modules));
              
              modulesLoaded = true;
              break;
            } else {
              console.warn('Received invalid modules format');
              retries++;
              
              // Try to authorize ngrok before retry
              if (API_BASE_URL.includes('ngrok')) {
                const { authorizeNgrok } = await import('@/lib/api');
                await authorizeNgrok();
              }
            }
          } catch (attemptError) {
            console.warn(`Modules load attempt ${retries + 1} failed:`, attemptError);
            retries++;
            
            // Try to authorize ngrok before retry
            if (API_BASE_URL.includes('ngrok')) {
              const { authorizeNgrok } = await import('@/lib/api');
              await authorizeNgrok();
            }
            
            // Short delay before retry
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      } catch (modulesError) {
        console.error('All attempts to load modules failed:', modulesError);
      }
      
      // If modules weren't loaded successfully, use cache or fallback
      if (!modulesLoaded) {
        console.log('Using cached or fallback modules data');
        
        // Check if we have cached modules
        const cachedModules = localStorage.getItem('mindmate_modules_cache');
        if (cachedModules) {
          try {
            const parsedModules = JSON.parse(cachedModules);
            console.log('Using cached modules data:', parsedModules);
            setTherapyModules(parsedModules);
          } catch (e) {
            console.error('Failed to parse cached modules:', e);
            useFallbackModules();
          }
        } else {
          useFallbackModules();
        }
      }
      
      // Function to set fallback modules when all else fails
      function useFallbackModules() {
        console.log('Using fallback modules data');
        setTherapyModules({
          modules: {
            "cbt": {
              name: "Cognitive Behavioral Therapy",
              techniques: ["thought_records", "behavioral_activation"],
              description: "Identify and change negative thought patterns"
            },
            "mindfulness": {
              name: "Mindfulness-Based Therapy",
              techniques: ["breathing_exercises", "body_scan"],
              description: "Cultivate present-moment awareness"
            }
          },
          default: "cbt"
        });
      }
      
    } catch (err: any) {
      console.error('Dashboard loading error:', err);
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSubmit = async () => {
    try {
      const userId = localStorage.getItem('mindmate_user_id');
      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }
      
      await trackMood({
        user_id: userId,
        mood_score: currentMood,
        emotions: ["focused", "hopeful"],
        notes: "Using MindMate dashboard"
      })
      
      // Reload profile to get updated mood trends
      const updatedProfile = await getUserProfile(userId);
      setUserProfile(updatedProfile);
    } catch (err: any) {
      console.error("Failed to track mood:", err);
    }
  }
  
  const handleExportReport = async () => {
    if (!userId) {
      setExportError("User authentication required to export report");
      setExportStatus('error');
      return;
    }

    try {
      setExportStatus('loading');
      setExportError(null);
      
      await exportComprehensiveReport(userId);
      
      setExportStatus('success');
      // Reset success status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Report export failed:", err);
      setExportError(err.message || "Failed to export report");
      setExportStatus('error');
      // Reset error status after 5 seconds
      setTimeout(() => setExportStatus('idle'), 5000);
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
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-all duration-500 ease-in-out ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
      }`}>
        <HeaderCompo />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }
console.log(therapyModules?.modules);
  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
    }`}>
      <HeaderCompo />
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to MindMate</h1>
          <p className="text-lg opacity-80">Your comprehensive psychological support companion</p>
        </div>

        {/* System Status */}
        {backendStatus && (
          <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {backendStatus.status}
                  </Badge>
                  <p className="text-sm mt-1">API Status</p>
                </div>
                <div className="text-center">
                  <Badge variant="default">
                    Resources
                  </Badge>
                  <p className="text-sm mt-1">Knowledge Base</p>
                </div>
                <div className="text-center">
                  <Badge variant="default">
                    {therapyModules?.modules ? Object.keys(therapyModules.modules).length : 0} Modules
                  </Badge>
                  <p className="text-sm mt-1">Therapy Approaches</p>
                </div>
                <div className="text-center">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {backendStatus.model}
                  </Badge>
                  <p className="text-sm mt-1">AI Model</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className={`cursor-pointer transition-transform hover:scale-105 ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "hover:shadow-lg"}`}>
            <CardContent className="flex flex-col items-center text-center p-6">
              <Heart className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="font-semibold mb-2">Mood Tracking</h3>
              <p className="text-sm opacity-70 mb-4">Track and analyze your emotional wellbeing</p>
              <Button size="sm" className="w-full" onClick={() => window.location.href = '/mood-tracking'}>
                Track Mood
              </Button>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-transform hover:scale-105 ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "hover:shadow-lg"}`}>
            <CardContent className="flex flex-col items-center text-center p-6">
              <Brain className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="font-semibold mb-2">Chat Support</h3>
              <p className="text-sm opacity-70 mb-4">Get AI-powered psychological support</p>
              <Button size="sm" className="w-full" onClick={() => window.location.href = '/chat-enhanced'}>
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-transform hover:scale-105 ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "hover:shadow-lg"}`}>
            <CardContent className="flex flex-col items-center text-center p-6">
              <Shield className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="font-semibold mb-2">Crisis Assessment</h3>
              <p className="text-sm opacity-70 mb-4">Emergency mental health evaluation</p>
              <Button size="sm" className="w-full" variant="outline" onClick={() => window.location.href = '/crisis-assessment'}>
                Assessment
              </Button>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-transform hover:scale-105 ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "hover:shadow-lg"}`}>
            <CardContent className="flex flex-col items-center text-center p-6">
              <BookOpen className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Resources</h3>
              <p className="text-sm opacity-70 mb-4">Access therapy materials and guides</p>
              <Button size="sm" className="w-full" variant="outline" onClick={() => window.location.href = '/resources'}>
                Browse
              </Button>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer transition-transform hover:scale-105 ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "hover:shadow-lg"}`}>
            <CardContent className="flex flex-col items-center text-center p-6">
              <FileText className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="font-semibold mb-2">Export Report</h3>
              <p className="text-sm opacity-70 mb-4">Download your therapy progress report</p>
              <Button 
                size="sm" 
                className="w-full" 
                variant="outline"
                onClick={handleExportReport}
                disabled={!userId || exportStatus === 'loading'}
              >
                {exportStatus === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </div>
                ) : exportStatus === 'success' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Downloaded!</span>
                  </div>
                ) : (
                  <span>Export PDF</span>
                )}
              </Button>
              
              {exportStatus === 'error' && (
                <div className="mt-2 text-xs text-red-500">
                  {exportError || "Export failed"}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer transition-transform hover:scale-105 ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "hover:shadow-lg"}`}>
            <CardContent className="flex flex-col items-center text-center p-6">
              <Activity className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="font-semibold mb-2">Audio Transcription</h3>
              <p className="text-sm opacity-70 mb-4">Record and analyze your thoughts</p>
              <Button size="sm" className="w-full" variant="outline" onClick={() => window.location.href = '/audio-transcription'}>
                Record
              </Button>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer transition-transform hover:scale-105 ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "hover:shadow-lg"}`}>
            <CardContent className="flex flex-col items-center text-center p-6">
              <FileText className="h-12 w-12 text-teal-500 mb-4" />
              <h3 className="font-semibold mb-2">Export Reports</h3>
              <p className="text-sm opacity-70 mb-4">Generate PDF reports of your progress</p>
              <Button size="sm" className="w-full" variant="outline" onClick={() => window.location.href = '/session-export'}>
                Export
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Profile & Mood Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile */}
          {userProfile && (
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Session Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">
                        {userProfile?.session_stats?.total_sessions || 0}
                      </p>
                      <p className="text-sm opacity-70">Total Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {userProfile?.session_stats?.mood_improvements || 0}
                      </p>
                      <p className="text-sm opacity-70">Improvements</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Mood Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Mood</span>
                      <Badge variant="default">
                        {userProfile?.mood_trends?.average_mood || 5}/10
                      </Badge>
                    </div>
                    <Progress 
                      value={(userProfile?.mood_trends?.average_mood || 5) * 10} 
                      max={100} 
                      className="h-2"
                    />
                    <p className="text-sm opacity-70">
                      Trend: {userProfile?.mood_trends?.trend || "stable"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Mood Tracker */}
          <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Mood Check
              </CardTitle>
              <CardDescription>
                How are you feeling right now? (1-10)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Mood</span>
                  <span className="font-semibold">{currentMood}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs opacity-70">
                  <span>Very Low</span>
                  <span>Excellent</span>
                </div>
              </div>
              <Button onClick={handleMoodSubmit} className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Track Mood
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Therapy Modules */}
        {therapyModules && (
          <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Available Therapy Modules
              </CardTitle>
              <CardDescription>
                Explore different therapeutic approaches tailored to your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {therapyModules?.modules && typeof therapyModules.modules === 'object' ? Object.entries(therapyModules.modules).map(([key, module]: [string, any]) => (
                  <div 
                    key={key} 
                    className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-600 bg-gray-750" : "border-gray-200 bg-gray-50"} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <h4 className="font-semibold mb-2 capitalize">{key.replace('_', ' ')}</h4>
                    <p className="text-sm opacity-70 mb-3">{module.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {module.techniques?.slice(0, 2).map((technique: string, idx: number) => (
                        <Badge key={idx} variant="default" className="text-xs">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )) : (
                  <p className="col-span-4 text-center py-4">No therapy modules available</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Enhanced Features
            </CardTitle>
            <CardDescription>
              Comprehensive psychological support capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backendStatus && backendStatus.features && typeof backendStatus.features === 'object' ? 
                Object.entries(backendStatus.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center gap-3">
                    {enabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="capitalize">{feature.replace('_', ' ')}</span>
                  </div>
                ))
              : (
                <div className="col-span-3 text-center py-4">
                  <p className="text-gray-500">Feature information not available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
