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
  AlertTriangle, 
  Shield, 
  Phone, 
  Heart,
  Brain,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react"
import { assessCrisis, type CrisisAssessment } from "@/lib/api"

const CrisisAssessmentPage = () => {
  const { theme } = useTheme()
  const [message, setMessage] = useState("")
  const [assessment, setAssessment] = useState<CrisisAssessment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Check for authentication on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('mindmate_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleAssessment = async () => {
    if (!message.trim()) return

    try {
      setLoading(true)
      setError(null)
      
      // Use the authenticated user ID if available
      const result = await assessCrisis(message, userId || undefined)
      setAssessment(result)
    } catch (err: any) {
      setError(err.message || "Failed to perform crisis assessment")
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return "text-red-600 bg-red-50 border-red-200"
      case "moderate": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return <XCircle className="h-5 w-5" />
      case "moderate": return <AlertTriangle className="h-5 w-5" />
      case "low": return <CheckCircle className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
    }`}>
      <HeaderCompo />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Crisis Assessment</h1>
          <p className="text-lg opacity-80">
            Get immediate support and professional guidance during difficult times
          </p>
        </div>

        {/* Emergency Banner */}
        <Alert variant="warning" className="border-orange-200 bg-orange-50 text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            If you're experiencing a mental health emergency, please call your local emergency services 
            or a crisis hotline immediately. This assessment is for support only and doesn't replace professional care.
          </AlertDescription>
        </Alert>

        {/* Crisis Hotlines */}
        <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-500" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                <Phone className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold text-red-800">Emergency</h3>
                <p className="text-red-700">911</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <Heart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Crisis Text Line</h3>
                <p className="text-blue-700">Text HOME to 741741</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-800">Suicide Prevention</h3>
                <p className="text-purple-700">988</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Input */}
        <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle>Describe Your Current Situation</CardTitle>
            <CardDescription>
              Please share what you're experiencing. This helps us provide appropriate support and resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Tell us about your current thoughts, feelings, or situation. Be as detailed as you feel comfortable sharing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-32"
              disabled={loading}
            />
            <Button 
              onClick={handleAssessment} 
              disabled={!message.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Perform Assessment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Assessment Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Assessment Results */}
        {assessment && (
          <div className="space-y-6">
            {/* Risk Assessment */}
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg border ${getRiskLevelColor(assessment.risk_assessment.risk_level)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getRiskIcon(assessment.risk_assessment.risk_level)}
                    <h3 className="font-semibold text-lg">
                      {assessment.risk_assessment.risk_level.toUpperCase()} RISK
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">Confidence:</span>
                    <Progress 
                      value={assessment.risk_assessment.confidence_score * 100} 
                      max={100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm font-medium">
                      {Math.round(assessment.risk_assessment.confidence_score * 100)}%
                    </span>
                  </div>
                </div>

                {assessment.risk_assessment.risk_factors && assessment.risk_assessment.risk_factors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Identified Risk Factors:</h4>
                    <div className="flex flex-wrap gap-2">
                      {assessment.risk_assessment.risk_factors.map((factor, idx) => (
                        <Badge key={idx} variant="default" className="bg-red-100 text-red-800">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.risk_assessment.recommendations && assessment.risk_assessment.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {assessment.risk_assessment.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Symptom Analysis */}
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Symptom Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Detected Symptoms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {assessment.detected_symptoms.symptoms && assessment.detected_symptoms.symptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="default" className="bg-blue-100 text-blue-800">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Emotional State:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Dominant Emotion:</span>
                        <Badge variant="default">
                          {assessment.detected_symptoms.dominant_emotion || 'Not detected'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Intensity:</span>
                        <Badge variant="default">
                          {assessment.detected_symptoms.emotional_intensity || 'Not detected'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Immediate Interventions */}
            {assessment.immediate_interventions && assessment.immediate_interventions.length > 0 && (
              <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Immediate Coping Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assessment.immediate_interventions.map((intervention, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-600 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
                        <h4 className="font-semibold mb-2">{intervention.technique}</h4>
                        <p className="text-sm opacity-80">{intervention.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions */}
            {assessment.recommended_actions && assessment.recommended_actions.length > 0 && (
              <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.recommended_actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CrisisAssessmentPage
