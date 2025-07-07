"use client"

import React, { useState, useEffect } from 'react'
import { createSession, endSession, SessionData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/user-store'
import { useTherapyStore } from '@/store/therapy-store'
import { Play, Square, Clock, User, Calendar, Activity, Loader2 } from 'lucide-react'

interface SessionManagerProps {
  className?: string
  onSessionStart?: (sessionId: string) => void
  onSessionEnd?: (sessionId: string) => void
}

export const SessionManager: React.FC<SessionManagerProps> = ({ 
  className = "",
  onSessionStart,
  onSessionEnd
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const { 
    currentUserId, 
    currentSessionId, 
    setCurrentSessionId, 
    addSessionToHistory 
  } = useUserStore()
  
  const { 
    currentSession, 
    setCurrentSession, 
    clearCurrentSession 
  } = useTherapyStore()

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (currentSessionId && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentSessionId, sessionStartTime])

  const handleStartSession = async () => {
    if (!currentUserId) {
      setError('User ID is required to start a session')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const session = await createSession(currentUserId)
      setCurrentSessionId(session.session_id)
      setCurrentSession(session)
      setSessionStartTime(new Date())
      setElapsedTime(0)
      
      onSessionStart?.(session.session_id)
      
    } catch (err: any) {
      setError(err.message || 'Failed to start session')
      console.error('Session start error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!currentSessionId) return

    setIsLoading(true)
    setError(null)

    try {
      await endSession(currentSessionId)
      
      // Add to session history
      if (sessionStartTime) {
        const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
        addSessionToHistory({
          session_id: currentSessionId,
          date: sessionStartTime.toISOString(),
          duration,
          summary: `Session lasted ${formatTime(duration)}`
        })
      }
      
      // Clear current session state
      setCurrentSessionId(null)
      clearCurrentSession()
      setSessionStartTime(null)
      setElapsedTime(0)
      
      onSessionEnd?.(currentSessionId)
      
    } catch (err: any) {
      setError(err.message || 'Failed to end session')
      console.error('Session end error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionStatus = () => {
    if (currentSessionId) {
      return {
        status: 'active',
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: Activity
      }
    }
    return {
      status: 'inactive',
      color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      icon: Clock
    }
  }

  const sessionStatus = getSessionStatus()
  const StatusIcon = sessionStatus.icon

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <StatusIcon className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Session Manager</h3>
          <p className="text-slate-400 text-sm">Manage your therapy sessions</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Session Status */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-300 font-medium">Current Status</span>
            <Badge className={sessionStatus.color}>
              {sessionStatus.status}
            </Badge>
          </div>
          
          {currentSessionId && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="h-4 w-4" />
                <span>Session ID: {currentSessionId.slice(0, 8)}...</span>
              </div>
              
              {sessionStartTime && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>Started: {sessionStartTime.toLocaleTimeString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Duration: {formatTime(elapsedTime)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Session Controls */}
        <div className="flex gap-3">
          {!currentSessionId ? (
            <Button
              onClick={handleStartSession}
              disabled={isLoading || !currentUserId}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Session
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleEndSession}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending...
                </>
              ) : (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  End Session
                </>
              )}
            </Button>
          )}
        </div>

        {!currentUserId && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-yellow-300 text-sm">
              Please set your user ID to start a session
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}

        {/* Session Timer (prominent display when active) */}
        {currentSessionId && (
          <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-lg p-4 border border-blue-500/30">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-white mb-2">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-slate-400 text-sm">Session Duration</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionManager
