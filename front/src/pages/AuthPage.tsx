"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Stethoscope, ArrowRight, AlertCircle } from "lucide-react"
import { useTheme } from "../components/ThemeContext"
import { loginUser, registerUser, getUserProfile } from "@/lib/api"

const AuthPage: React.FC = () => {
  const { theme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    agreeToTerms: false,
  })

  // Set initial state based on route
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false)
    } else {
      setIsLogin(true)
    }
  }, [location.pathname])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError("Passwords don't match")
        setLoading(false)
        return
      }

      if (isLogin) {
        // Login flow
        const response = await loginUser({
          username: formData.username,
          password: formData.password
        });

        if (response.token) {
          // Store token in localStorage
          localStorage.setItem('mindmate_token', response.token);
          localStorage.setItem('mindmate_user_id', response.user_id || '');
          
          // Attempt to pre-fetch profile data before redirecting
          try {
            const profile = await getUserProfile(response.user_id);
            // If successful, cache the profile
            localStorage.setItem('mindmate_profile_cache', JSON.stringify(profile));
          } catch (profileError) {
            console.error("Could not pre-fetch profile:", profileError);
            // Create a default profile cache
            const initialProfile = {
              user_id: response.user_id || '',
              therapy_preferences: {
                preferred_approach: "",
                communication_style: "",
                goals: []
              },
              session_stats: {
                total_sessions: 0,
                last_session: new Date().toISOString(),
                mood_improvements: 0
              },
              mood_trends: {
                trend: "not_enough_data",
                average_mood: 5.0,
                insights: ["Welcome back to MindMate!", "Start tracking your mood to see trends"]
              }
            };
            localStorage.setItem('mindmate_profile_cache', JSON.stringify(initialProfile));
          }
          
          // Redirect to dashboard after a small delay
          setTimeout(() => navigate('/dashboard'), 300);
        } else {
          setError(response.error || "Login failed");
        }
      } else {
        // Register flow
        try {
          // Validate form data
          if (!formData.username || !formData.email || !formData.password) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
          }
          
          console.log("Registration data:", {
            username: formData.username,
            email: formData.email,
            password: formData.password
          });
          
          // Using a try/catch block to handle network errors
          try {
            const response = await registerUser({
              username: formData.username,
              email: formData.email,
              password: formData.password
            });
            
            console.log("Registration response:", response);

            // Check if registration was successful - backend could respond with success or user_id
            if (response.success || response.user_id) {
              // Use fallback logic if backend is down
              if (response.success === true || response.user_id) {
                // Automatically login after registration
                try {
                  // Show feedback to the user that registration was successful
                  setError("Registration successful! Logging you in...");
                  
                  const loginResponse = await loginUser({
                    username: formData.username,
                    password: formData.password
                  });
                  
                  console.log("Auto-login response:", loginResponse);

                  if (loginResponse.token) {
                    localStorage.setItem('mindmate_token', loginResponse.token);
                    localStorage.setItem('mindmate_user_id', loginResponse.user_id || '');
                    
                    // Create an initial profile cache to avoid API issues on first dashboard load
                    const initialProfile = {
                      user_id: loginResponse.user_id || '',
                      therapy_preferences: {
                        preferred_approach: "",
                        communication_style: "",
                        goals: []
                      },
                      session_stats: {
                        total_sessions: 0,
                        last_session: new Date().toISOString(),
                        mood_improvements: 0
                      },
                      mood_trends: {
                        trend: "not_enough_data",
                        average_mood: 5.0,
                        insights: ["Welcome to MindMate!", "Start tracking your mood to see trends"]
                      }
                    };
                    
                    // Cache this initial profile
                    localStorage.setItem('mindmate_profile_cache', JSON.stringify(initialProfile));
                    
                    // Navigate to dashboard after a small delay to let the UI update
                    setTimeout(() => navigate('/dashboard'), 500);
                  } else {
                    // Registration successful but login failed
                    setError("Registration successful. Please log in.");
                    toggleAuthMode(); // Switch to login form
                  }
                } catch (loginErr) {
                  console.error("Auto-login error:", loginErr);
                  setError("Registration successful. Please log in manually.");
                  toggleAuthMode(); // Switch to login form
                }
              }
            } else {
              setError(response.error || "Registration failed. Please check your information.");
            }
          } catch (apiError: any) {
            console.error("API error during registration:", apiError);
            
            // If the backend is down, use a mock successful registration for testing
            if (apiError.message?.includes('Network Error')) {
              console.log("Using mock registration response due to network error");
              setError("Network error. Using mock registration. Please try to login.");
              toggleAuthMode();
            } else {
              setError(apiError.message || "Registration failed. Please try again.");
            }
          }
        } catch (error: any) {
          console.error("Registration error:", error);
          setError(error.response?.data?.error || error.message || "Registration failed. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false)
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      agreeToTerms: false,
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setError(null)
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
          : "bg-gradient-to-br from-white via-blue-50 to-white"
      }`}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
              theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
            }`}
          >
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {isLogin ? "Welcome Back" : "Join MediMate"}
          </h2>
          <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {isLogin
              ? "Sign in to your account to continue your medical consultations"
              : "Create your account to start your AI medical consultation journey"}
          </p>
        </div>

        {/* Auth Toggle */}
        <div
          className={`flex rounded-xl p-1 ${
            theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-gray-100 border border-gray-200"
          }`}
        >
          <button
            type="button"
            onClick={() => !isLogin && toggleAuthMode()}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
              isLogin
                ? theme === "dark"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-blue-500 text-white shadow-lg"
                : theme === "dark"
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => isLogin && toggleAuthMode()}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
              !isLogin
                ? theme === "dark"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-blue-500 text-white shadow-lg"
                : theme === "dark"
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <div
          className={`rounded-2xl p-8 transition-all duration-300 ${
            theme === "dark"
              ? "bg-gray-800/50 border border-gray-700 shadow-2xl"
              : "bg-white border border-gray-200 shadow-2xl"
          }`}
        >
          {error && (
            <div className={`p-4 mb-4 rounded-lg flex items-start gap-3 ${theme === "dark" ? "bg-red-900/50 text-red-200" : "bg-red-50 text-red-800"}`}>
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name - Register Only */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required={!isLogin}
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password - Register Only */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                    ) : (
                      <Eye className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Terms and Conditions - Register Only */}
            {!isLogin && (
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required={!isLogin}
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={`h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white"
                  }`}
                />
                <label
                  htmlFor="agreeToTerms"
                  className={`ml-2 block text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} underline`}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} underline`}
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {/* Forgot Password - Login Only */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                      theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white"
                    }`}
                  />
                  <label
                    htmlFor="remember-me"
                    className={`ml-2 block text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} underline`}
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-500/25"
                  : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 shadow-lg shadow-blue-500/25"
              } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                  {isLogin ? "Sign In" : "Create Account"}
                </>
              )}
            </button>

            <a
                href="/"
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-500/25"
                  : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 shadow-lg shadow-blue-500/25"
              }`}
            >Back home</a>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`w-full inline-flex justify-center py-2 px-4 border rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className={`w-full inline-flex justify-center py-2 px-4 border rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                >
                <path
                    fillRule="evenodd"
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.583
                    0-.288-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73
                    1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.332-5.467-5.93
                    0-1.31.47-2.38 1.236-3.22-.125-.303-.536-1.523.116-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.003-.404 1.02.005
                    2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.12 3.176.77.84 1.233 1.91 1.233 3.22
                    0 4.61-2.807 5.623-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.293 0 .323.216.699.825.58
                    C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"
                    clipRule="evenodd"
                />
                </svg>
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className={`text-center text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleAuthMode}
            className={`font-medium ${
              theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
            } underline`}
          >
            {isLogin ? "Sign up here" : "Sign in here"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
