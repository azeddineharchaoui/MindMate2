"use client"

import React, { useState } from 'react'
import { analyzeSymptoms, SymptomAnalysis as SymptomAnalysisType } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/user-store'
import { AlertTriangle, Brain, Heart, Target, Lightbulb, Loader2, TrendingUp } from 'lucide-react'

interface SymptomAnalysisProps {
  className?: string
  conversationHistory?: string[]
}

export const SymptomAnalysis: React.FC<SymptomAnalysisProps> = ({ 
  className = "", 
  conversationHistory = [] 
}) => {
  const [message, setMessage] = useState('')
  const [analysis, setAnalysis] = useState<SymptomAnalysisType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { addSymptomHistory } = useUserStore()

  const handleAnalyze = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await analyzeSymptoms(message, conversationHistory)
      setAnalysis(result)
      
      // Store in user store
      addSymptomHistory({
        date: new Date().toISOString(),
        symptoms: result.analysis.symptoms,
        risk_factors: result.analysis.risk_factors,
        dominant_emotion: result.analysis.dominant_emotion,
        emotional_intensity: result.analysis.emotional_intensity
      })
      
    } catch (err: any) {
      setError(err.message || 'Failed to analyze symptoms')
      console.error('Symptom analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': case 'moderate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': case 'mild': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Brain className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Symptom Analysis</h3>
          <p className="text-slate-400 text-sm">Describe your symptoms for personalized insights</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Describe your symptoms or concerns
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about what you're experiencing..."
            className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!message.trim() || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Symptoms...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Analyze Symptoms
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6 pt-4 border-t border-slate-600">
            {/* Analysis Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  <span className="font-medium text-white">Dominant Emotion</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {analysis.analysis.dominant_emotion}
                </Badge>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium text-white">Emotional Intensity</span>
                </div>
                <Badge className={getIntensityColor(analysis.analysis.emotional_intensity)}>
                  {analysis.analysis.emotional_intensity}
                </Badge>
              </div>
            </div>

            {/* Symptoms */}
            {analysis.analysis.symptoms && analysis.analysis.symptoms.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <span className="font-medium text-white">Identified Symptoms</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis.symptoms.map((symptom, index) => (
                    <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {analysis.analysis.risk_factors && analysis.analysis.risk_factors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="font-medium text-white">Risk Factors</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis.risk_factors.map((factor, index) => (
                    <Badge key={index} className="bg-red-500/20 text-red-300 border-red-500/30">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Approaches */}
            {analysis.suggested_approaches && analysis.suggested_approaches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-white">Suggested Therapeutic Approaches</span>
                </div>
                <div className="space-y-3">
                  {analysis.suggested_approaches.map((approach, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="font-medium text-green-300 mb-1">{approach.approach}</div>
                      <div className="text-sm text-slate-300">{approach.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monitoring Suggestions */}
            {analysis.monitoring_suggestions && analysis.monitoring_suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium text-white">Monitoring Suggestions</span>
                </div>
                <div className="space-y-2">
                  {analysis.monitoring_suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-sm text-slate-300">{suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SymptomAnalysis
