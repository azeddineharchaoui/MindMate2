import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import { useUserStore } from "@/store/user-store"
import { trackMood, getUserProfile } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, TrendingUp, TrendingDown, Calendar, Smile, Frown, Meh } from "lucide-react"

const emotions = [
  { name: "happy", icon: "😊", color: "bg-green-100 text-green-800" },
  { name: "sad", icon: "😢", color: "bg-blue-100 text-blue-800" },
  { name: "anxious", icon: "😰", color: "bg-yellow-100 text-yellow-800" },
  { name: "angry", icon: "😠", color: "bg-red-100 text-red-800" },
  { name: "calm", icon: "😌", color: "bg-purple-100 text-purple-800" },
  { name: "excited", icon: "🤩", color: "bg-orange-100 text-orange-800" },
  { name: "confused", icon: "😕", color: "bg-gray-100 text-gray-800" },
  { name: "grateful", icon: "🙏", color: "bg-pink-100 text-pink-800" }
]

interface MoodTrackerProps {
  onMoodSubmit?: (moodData: any) => void
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSubmit }) => {
  const { theme } = useTheme()
  const { currentUserId, addMoodEntry, userProfile } = useUserStore()
  
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentMoods, setRecentMoods] = useState<any[]>([])

  useEffect(() => {
    if (currentUserId) {
      // Load recent mood data from user profile
      getUserProfile(currentUserId).then(profile => {
        setRecentMoods(profile.mood_trends?.insights || [])
      }).catch(console.error)
    }
  }, [currentUserId])

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }

  const handleMoodSubmit = async () => {
    if (!currentUserId) {
      alert("Please log in to track your mood")
      return
    }

    setIsSubmitting(true)
    try {
      const moodData = {
        user_id: currentUserId,
        mood_score: moodScore,
        emotions: selectedEmotions,
        notes
      }

      const result = await trackMood(moodData)
      
      // Update local store
      addMoodEntry({
        date: new Date().toISOString(),
        mood_score: moodScore,
        emotions: selectedEmotions,
        notes
      })

      // Call parent callback if provided
      onMoodSubmit?.(result)

      // Reset form
      setSelectedEmotions([])
      setNotes("")
      setMoodScore(5)

      alert("Mood tracked successfully!")
    } catch (error) {
      console.error("Failed to track mood:", error)
      alert("Failed to track mood. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMoodIcon = (score: number) => {
    if (score >= 8) return <Smile className="h-6 w-6 text-green-500" />
    if (score >= 4) return <Meh className="h-6 w-6 text-yellow-500" />
    return <Frown className="h-6 w-6 text-red-500" />
  }

  const getMoodColor = (score: number) => {
    if (score >= 8) return "text-green-500"
    if (score >= 4) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className={`p-6 rounded-lg shadow-lg ${
      theme === "dark" 
        ? "bg-gray-800 text-white" 
        : "bg-white text-gray-900"
    }`}>
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-pink-500" />
        <h3 className="text-xl font-semibold">Mood Tracker</h3>
      </div>

      {/* Mood Score Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">How are you feeling? (1-10)</label>
          <div className="flex items-center gap-2">
            {getMoodIcon(moodScore)}
            <span className={`text-lg font-bold ${getMoodColor(moodScore)}`}>
              {moodScore}
            </span>
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={moodScore}
          onChange={(e) => setMoodScore(parseInt(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Very Low</span>
          <span>Moderate</span>
          <span>Very High</span>
        </div>
      </div>

      {/* Emotion Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block">Select emotions you're experiencing:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              onClick={() => handleEmotionToggle(emotion.name)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedEmotions.includes(emotion.name)
                  ? `${emotion.color} border-current shadow-md scale-105`
                  : theme === "dark"
                    ? "border-gray-600 hover:border-gray-500 text-gray-300"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className="text-2xl mb-1">{emotion.icon}</div>
              <div className="text-xs font-medium capitalize">{emotion.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Notes (optional):</label>
        <Textarea
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
          placeholder="How was your day? What contributed to your mood?"
          className={`resize-none ${
            theme === "dark" 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300"
          }`}
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleMoodSubmit}
        disabled={isSubmitting || !currentUserId}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isSubmitting ? "Tracking..." : "Track Mood"}
      </Button>

      {/* Recent Trends */}
      {recentMoods.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Recent Insights
            </span>
          </div>
          <div className="space-y-1">
            {recentMoods.slice(0, 3).map((insight, index) => (
              <p key={index} className="text-xs text-blue-600 dark:text-blue-400">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MoodTracker
