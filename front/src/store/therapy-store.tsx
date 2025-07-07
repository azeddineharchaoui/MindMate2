"use client"
import { create } from "zustand"

interface TherapyState {
  // Therapy Session State
  currentTherapyModule: string
  availableModules: Record<string, any>
  sessionGoals: string[]
  sessionNotes: string
  
  // Resources and Recommendations
  resourceSearchResults: any[]
  therapeuticRecommendations: any[]
  currentResources: any[]
  
  // Assessment Results
  lastSymptomAnalysis: any | null
  riskLevel: string
  emergencyMode: boolean
  
  // Progress Tracking
  goals: Array<{
    id: string
    goal: string
    progress: number
    created_at: string
    target_date: string
  }>
  
  // Worksheets and Tools
  availableWorksheets: string[]
  completedWorksheets: string[]
  
  // Actions
  setTherapyModule: (module: string) => void
  setAvailableModules: (modules: Record<string, any>) => void
  addSessionGoal: (goal: string) => void
  updateSessionNotes: (notes: string) => void
  setResourceSearchResults: (results: any[]) => void
  addTherapeuticRecommendation: (recommendation: any) => void
  setSymptomAnalysis: (analysis: any) => void
  setRiskLevel: (level: string) => void
  setEmergencyMode: (emergency: boolean) => void
  addGoal: (goal: string, targetDate: string) => void
  updateGoalProgress: (goalId: string, progress: number) => void
  addCompletedWorksheet: (worksheet: string) => void
  clearTherapySession: () => void
}

export const useTherapyStore = create<TherapyState>((set, get) => ({
  // Initial state
  currentTherapyModule: "cbt",
  availableModules: {},
  sessionGoals: [],
  sessionNotes: "",
  resourceSearchResults: [],
  therapeuticRecommendations: [],
  currentResources: [],
  lastSymptomAnalysis: null,
  riskLevel: "LOW",
  emergencyMode: false,
  goals: [],
  availableWorksheets: ["mood_tracking", "anxiety_worksheet", "depression_worksheet", "coping_strategies"],
  completedWorksheets: [],
  
  // Actions
  setTherapyModule: (module) => set({ currentTherapyModule: module }),
  
  setAvailableModules: (modules) => set({ availableModules: modules }),
  
  addSessionGoal: (goal) => set((state) => ({
    sessionGoals: [...state.sessionGoals, goal]
  })),
  
  updateSessionNotes: (notes) => set({ sessionNotes: notes }),
  
  setResourceSearchResults: (results) => set({ resourceSearchResults: results }),
  
  addTherapeuticRecommendation: (recommendation) => set((state) => ({
    therapeuticRecommendations: [...state.therapeuticRecommendations, recommendation]
  })),
  
  setSymptomAnalysis: (analysis) => set({ 
    lastSymptomAnalysis: analysis,
    riskLevel: analysis?.analysis?.risk_level || "LOW"
  }),
  
  setRiskLevel: (level) => set({ riskLevel: level }),
  
  setEmergencyMode: (emergency) => set({ emergencyMode: emergency }),
  
  addGoal: (goal, targetDate) => set((state) => ({
    goals: [...state.goals, {
      id: `goal_${Date.now()}`,
      goal,
      progress: 0,
      created_at: new Date().toISOString(),
      target_date: targetDate
    }]
  })),
  
  updateGoalProgress: (goalId, progress) => set((state) => ({
    goals: state.goals.map(g => 
      g.id === goalId ? { ...g, progress } : g
    )
  })),
  
  addCompletedWorksheet: (worksheet) => set((state) => ({
    completedWorksheets: [...state.completedWorksheets, worksheet]
  })),
  
  clearTherapySession: () => set({
    sessionGoals: [],
    sessionNotes: "",
    currentResources: [],
    therapeuticRecommendations: []
  })
}))
