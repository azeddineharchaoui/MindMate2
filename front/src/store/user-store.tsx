"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { UserProfile } from "@/lib/api"

interface UserState {
  // User Profile
  userProfile: UserProfile | null
  currentUserId: string | null
  currentSessionId: string | null
  
  // Mood Tracking
  moodHistory: Array<{
    date: string
    mood_score: number
    emotions: string[]
    notes: string
  }>
  
  // Session Management
  activeSessions: string[]
  sessionHistory: Array<{
    session_id: string
    date: string
    duration: number
    summary: string
  }>
  
  // Crisis and Symptoms
  lastCrisisAssessment: any | null
  symptomHistory: Array<{
    date: string
    symptoms: string[]
    risk_level: string
  }>
  
  // Actions
  setUserProfile: (profile: UserProfile) => void
  setCurrentUserId: (userId: string) => void
  setCurrentSessionId: (sessionId: string) => void
  addMoodEntry: (entry: any) => void
  addSessionToHistory: (session: any) => void
  setCrisisAssessment: (assessment: any) => void
  addSymptomHistory: (symptoms: any) => void
  clearUserData: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      userProfile: null,
      currentUserId: null,
      currentSessionId: null,
      moodHistory: [],
      activeSessions: [],
      sessionHistory: [],
      lastCrisisAssessment: null,
      symptomHistory: [],
      
      // Actions
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      setCurrentUserId: (userId) => set({ 
        currentUserId: userId,
        // Clear session when user changes
        currentSessionId: null 
      }),
      
      setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
      
      addMoodEntry: (entry) => set((state) => ({
        moodHistory: [entry, ...state.moodHistory].slice(0, 50) // Keep last 50 entries
      })),
      
      addSessionToHistory: (session) => set((state) => ({
        sessionHistory: [session, ...state.sessionHistory].slice(0, 20) // Keep last 20 sessions
      })),
      
      setCrisisAssessment: (assessment) => set({ lastCrisisAssessment: assessment }),
      
      addSymptomHistory: (symptoms) => set((state) => ({
        symptomHistory: [
          { date: new Date().toISOString(), ...symptoms },
          ...state.symptomHistory
        ].slice(0, 30) // Keep last 30 symptom assessments
      })),
      
      clearUserData: () => set({
        userProfile: null,
        currentUserId: null,
        currentSessionId: null,
        moodHistory: [],
        activeSessions: [],
        sessionHistory: [],
        lastCrisisAssessment: null,
        symptomHistory: []
      })
    }),
    {
      name: "mindmate-user-storage",
      partialize: (state) => ({
        // Only persist essential data
        currentUserId: state.currentUserId,
        moodHistory: state.moodHistory.slice(0, 10), // Only persist recent mood data
        sessionHistory: state.sessionHistory.slice(0, 5) // Only persist recent sessions
      })
    }
  )
)
