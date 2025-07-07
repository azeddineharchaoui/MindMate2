import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import { useUserStore } from "@/store/user-store"
import { useTherapyStore } from "@/store/therapy-store"
import { assessCrisis, CrisisAssessment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Phone, Heart, ExternalLink, CheckCircle } from "lucide-react"

interface CrisisAssessmentComponentProps {
  message?: string
  onAssessmentComplete?: (assessment: CrisisAssessment) => void
}

const CrisisAssessmentComponent: React.FC<CrisisAssessmentComponentProps> = ({ 
  message, 
  onAssessmentComplete 
}) => {
  const { theme } = useTheme()
  const { currentUserId } = useUserStore()
  const { setRiskLevel, setEmergencyMode } = useTherapyStore()
  
  const [inputMessage, setInputMessage] = useState(message || "")
  const [assessment, setAssessment] = useState<CrisisAssessment | null>(null)
  const [isAssessing, setIsAssessing] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<string[]>([])

  useEffect(() => {
    if (message) {
      handleAssessment(message)
    }
  }, [message])

  const handleAssessment = async (msg?: string) => {
    const messageToAssess = msg || inputMessage
    if (!messageToAssess.trim()) return

    setIsAssessing(true)
    try {
      const result = await assessCrisis(messageToAssess, currentUserId, conversationHistory)
      setAssessment(result)
      
      // Update therapy store
      setRiskLevel(result.risk_assessment.risk_level)
      setEmergencyMode(["CRITICAL", "HIGH"].includes(result.risk_assessment.risk_level))
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, messageToAssess].slice(-10))
      
      onAssessmentComplete?.(result)
    } catch (error) {
      console.error("Crisis assessment failed:", error)
      alert("Failed to perform crisis assessment. Please try again.")
    } finally {
      setIsAssessing(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "bg-red-100 text-red-800 border-red-200"
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200"
      case "MODERATE": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case "CRITICAL": 
      case "HIGH": 
        return <AlertTriangle className="h-5 w-5" />
      case "MODERATE": 
        return <Shield className="h-5 w-5" />
      case "LOW": 
        return <CheckCircle className="h-5 w-5" />
      default: 
        return <Shield className="h-5 w-5" />
    }
  }

  const emergencyContacts = [
    { name: "National Suicide Prevention Lifeline", number: "988", available: "24/7" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", available: "24/7" },
    { name: "Emergency Services", number: "911", available: "24/7" }
  ]

  return (
    <div className={`p-6 rounded-lg shadow-lg ${
      theme === "dark" 
        ? "bg-gray-800 text-white" 
        : "bg-white text-gray-900"
    }`}>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-blue-500" />
        <h3 className="text-xl font-semibold">Crisis Assessment</h3>
      </div>

      {/* Input Section */}
      {!message && (
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">
            Describe your current feelings or situation:
          </label>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="I'm feeling overwhelmed and don't know what to do..."
            className={`w-full h-24 p-3 rounded-lg border resize-none ${
              theme === "dark" 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "bg-white border-gray-300 placeholder-gray-500"
            }`}
          />
          <Button
            onClick={() => handleAssessment()}
            disabled={isAssessing || !inputMessage.trim()}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isAssessing ? "Assessing..." : "Assess Crisis Risk"}
          </Button>
        </div>
      )}

      {/* Assessment Results */}
      {assessment && (
        <div className="space-y-6">
          {/* Risk Level */}
          <div className={`p-4 rounded-lg border-2 ${getRiskLevelColor(assessment.risk_assessment.risk_level)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getRiskLevelIcon(assessment.risk_assessment.risk_level)}
              <span className="font-semibold">
                Risk Level: {assessment.risk_assessment.risk_level}
              </span>
              <Badge variant="outline" className="ml-auto">
                {Math.round(assessment.risk_assessment.confidence_score * 100)}% confidence
              </Badge>
            </div>
            
            {/* Risk Factors */}
            {assessment.risk_assessment.risk_factors?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {assessment.risk_assessment.risk_factors.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detected Symptoms */}
          {assessment.detected_symptoms?.symptoms?.length > 0 && (
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Detected Symptoms
              </h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {assessment.detected_symptoms.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
                {assessment.detected_symptoms.dominant_emotion && (
                  <p className="text-sm">
                    <strong>Dominant Emotion:</strong> {assessment.detected_symptoms.dominant_emotion} 
                    <span className="ml-2 text-gray-500">
                      ({assessment.detected_symptoms.emotional_intensity} intensity)
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Immediate Interventions */}
          {assessment.immediate_interventions?.length > 0 && (
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
            }`}>
              <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                Immediate Coping Techniques
              </h4>
              <div className="space-y-3">
                {assessment.immediate_interventions.map((intervention, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-3">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200">
                      {intervention.technique}
                    </h5>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {intervention.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {assessment.recommended_actions?.length > 0 && (
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-green-900/20" : "bg-green-50"
            }`}>
              <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {assessment.recommended_actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-green-600 dark:text-green-300">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Emergency Resources - Show for HIGH/CRITICAL risk */}
          {["CRITICAL", "HIGH"].includes(assessment.risk_assessment.risk_level) && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
              <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Resources
              </h4>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.available}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">
                        {contact.number}
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-3">
                If you're in immediate danger, please call 911 or go to your nearest emergency room.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CrisisAssessmentComponent
