"use client"

import React, { useState, useRef } from "react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  StopCircle, 
  Volume2, 
  Download,
  FileAudio,
  Activity,
  Upload,
  RefreshCw,
  Heart,
  Brain,
  FileText
} from "lucide-react"
import { transcribeAudio } from "@/lib/api"

const AudioTranscription: React.FC = () => {
  const { theme } = useTheme()
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [emotionAnalysis, setEmotionAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Start recording audio
  const startRecording = async () => {
    try {
      setError(null)
      setTranscription(null)
      setEmotionAnalysis(null)
      setAudioUrl(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Process automatically after recording
        processAudioFile(audioBlob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setError("Could not access microphone. Please check your browser permissions.")
    }
  }
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all tracks of the active stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedAudio(file)
      setAudioUrl(URL.createObjectURL(file))
      setTranscription(null)
      setEmotionAnalysis(null)
      setError(null)
    }
  }
  
  // Process audio file (recorded or uploaded)
  const processAudioFile = async (audioFile: Blob) => {
    setLoading(true)
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 95))
    }, 300)
    
    try {
      const result = await transcribeAudio(audioFile)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (result.text) {
        setTranscription(result.text)
      }
      
      if (result.emotions) {
        setEmotionAnalysis(result.emotions)
      }
    } catch (err: any) {
      console.error("Transcription failed:", err)
      setError(err.message || "Failed to transcribe audio")
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }
  
  // Process uploaded file
  const processUploadedFile = () => {
    if (uploadedAudio) {
      processAudioFile(uploadedAudio)
    }
  }

  // Open file picker
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  // Clear current audio and results
  const resetAll = () => {
    setAudioUrl(null)
    setTranscription(null)
    setEmotionAnalysis(null)
    setUploadedAudio(null)
    setError(null)
  }
  
  // Generate emotion badges from analysis
  const renderEmotionBadges = () => {
    if (!emotionAnalysis) return null
    
    return Object.entries(emotionAnalysis)
      .filter(([_, value]) => (value as number) > 0.1)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([emotion, value]) => {
        const intensity = value as number
        let color = "bg-gray-200 text-gray-800"
        let icon = <Brain className="w-3 h-3 mr-1" />
        
        if (emotion === "joy" || emotion === "happiness") {
          color = intensity > 0.5 ? "bg-green-100 text-green-800" : "bg-green-50 text-green-600"
          icon = <Heart className="w-3 h-3 mr-1" />
        } else if (emotion === "sadness") {
          color = intensity > 0.5 ? "bg-blue-100 text-blue-800" : "bg-blue-50 text-blue-600"
        } else if (emotion === "anger") {
          color = intensity > 0.5 ? "bg-red-100 text-red-800" : "bg-red-50 text-red-600"
        } else if (emotion === "fear") {
          color = intensity > 0.5 ? "bg-purple-100 text-purple-800" : "bg-purple-50 text-purple-600"
        } else if (emotion === "surprise") {
          color = intensity > 0.5 ? "bg-yellow-100 text-yellow-800" : "bg-yellow-50 text-yellow-600"
        }
        
        return (
          <Badge key={emotion} className={`${color} px-2 py-1 mr-2 mb-2`}>
            {icon}
            {emotion}: {Math.round(intensity * 100)}%
          </Badge>
        )
      })
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
            <h1 className="text-3xl font-bold mb-4">Audio Transcription & Analysis</h1>
            <p className="text-lg opacity-80">
              Record or upload audio for intelligent transcription and emotional analysis. 
              Perfect for journaling, therapy sessions, and mood tracking.
            </p>
          </div>
          
          <Card className={`mb-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Audio Recorder
              </CardTitle>
              <CardDescription>
                Record your voice to capture thoughts, feelings, or journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {isRecording ? (
                  <div className="animate-pulse flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span>Recording...</span>
                  </div>
                ) : null}
                
                <div className="flex gap-4 justify-center">
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopRecording} 
                      variant="destructive"
                    >
                      <StopCircle className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  )}
                  
                  <Button
                    onClick={triggerFileUpload}
                    variant="outline"
                    disabled={loading || isRecording}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Audio
                  </Button>
                  
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
                
                {audioUrl && (
                  <div className="w-full">
                    <audio 
                      src={audioUrl} 
                      controls 
                      className="w-full"
                    />
                    
                    {uploadedAudio && (
                      <Button 
                        onClick={processUploadedFile}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                      >
                        <FileAudio className="mr-2 h-4 w-4" />
                        Process Audio File
                      </Button>
                    )}
                  </div>
                )}
                
                {loading && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing audio...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          {transcription && (
            <Card className={`mb-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Transcription Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-md bg-opacity-50 mb-4 text-lg">
                  {transcription}
                </div>
                
                {emotionAnalysis && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Emotion Analysis</h3>
                    <div className="flex flex-wrap">
                      {renderEmotionBadges()}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex gap-4">
                  <Button 
                    onClick={resetAll}
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Record New Audio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="text-center mt-10 opacity-80 text-sm">
            <p>
              Voice recordings are processed locally and are not stored on our servers unless explicitly saved.
              You can use this tool for journaling, therapy preparation, or mood tracking.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AudioTranscription
