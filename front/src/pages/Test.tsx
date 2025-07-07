// Your main page file, e.g., page.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useChatStore } from "@/store/chat-store" // Correct path using alias
import { streamChatCompletion, exportToPDF, checkBackendStatus } from "@/lib/api" // Correct path using alias

// --- UI Components (These can be moved to their own files for better organization) ---
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, Trash2, Stethoscope, Send, Mic, Square, Play, Pause, AlertTriangle,
  Paperclip, Image, FileAudio, Video, File, X, Clock, Wifi, WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Types ---
interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  isEmergency?: boolean
  audioUrl?: string
  fileUrl?: string
  fileName?: string
  fileType?: string
}

interface FileAttachment {
  file: File
  url: string
  type: string
}

// --- Utility Functions ---
const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const formatDate = (date: Date) => {
  const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString()
}
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (fileType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
  if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
  return <File className="h-4 w-4" />
}

// --- Reusable Components (largely unchanged) ---

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false); const [currentTime, setCurrentTime] = useState(0); const [duration, setDuration] = useState(0); const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      const audio = audioRef.current;
      const onLoadedMetadata = () => setDuration(audio.duration); const onTimeUpdate = () => setCurrentTime(audio.currentTime); const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
      audio.addEventListener('loadedmetadata', onLoadedMetadata); audio.addEventListener('timeupdate', onTimeUpdate); audio.addEventListener('ended', onEnded);
      return () => { audio.removeEventListener('loadedmetadata', onLoadedMetadata); audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('ended', onEnded); };
    }
  }, [audioUrl]);
  const togglePlay = () => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play(); setIsPlaying(!isPlaying); };
  const formatAudioTime = (time: number) => { const mins = Math.floor(time / 60); const secs = Math.floor(time % 60); return `${mins}:${secs.toString().padStart(2, '0')}`; };
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
      <Button size="sm" variant="ghost" onClick={togglePlay} className="h-8 w-8 p-0">{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
      <div className="flex-1"><div className="flex items-center space-x-2"><div className="flex-1 bg-slate-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}/></div><span className="text-xs text-slate-600 font-mono">{formatAudioTime(currentTime)} / {formatAudioTime(duration)}</span></div></div>
    </div>
  )
}
function FilePreview({ file, onRemove }: { file: FileAttachment; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between space-x-3 p-3 bg-slate-50 rounded-lg border">
      <div className="flex items-center space-x-2 min-w-0"><div className="flex-shrink-0">{getFileIcon(file.type)}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 truncate">{file.file.name}</p><p className="text-xs text-slate-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p></div></div>
      <Button size="sm" variant="ghost" onClick={onRemove} className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 flex-shrink-0"><X className="h-4 w-4" /></Button>
    </div>
  )
}
function TypingIndicator() {
  return <div className="flex justify-start mb-4"><div className="bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm max-w-xs"><div className="flex items-center space-x-2"><span className="text-sm text-slate-600">Dr. MediMate is thinking</span><div className="flex space-x-1"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div></div>
}
function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm max-w-md lg:max-w-lg">
        <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{content}<span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" /></div>
      </div>
    </div>
  )
}
function MessageBubble({ message, showDate }: { message: Message; showDate?: boolean }) {
  const isUser = message.type === "user";
  return (
    <div className="mb-4">
      {showDate && <div className="text-center mb-4"><Badge variant="secondary" className="text-xs">{formatDate(message.timestamp)}</Badge></div>}
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <div className={cn("max-w-md lg:max-w-lg px-4 py-3 shadow-sm", isUser ? "bg-blue-600 text-white rounded-2xl rounded-br-md" : "bg-white border border-slate-200 text-slate-900 rounded-2xl rounded-bl-md", message.isEmergency && "ring-2 ring-red-500")}>
          {message.audioUrl ? <AudioPlayer audioUrl={message.audioUrl} /> : message.fileUrl ? (
            <div className="space-y-2"><div className="flex items-center space-x-2">{getFileIcon(message.fileType || '')}<span className="text-sm font-medium">{message.fileName}</span></div>{message.fileType?.startsWith('image/') && <img src={message.fileUrl} alt={message.fileName || 'image'} className="max-w-full h-auto rounded-lg"/>}</div>
          ) : (<div className="prose prose-sm max-w-none"><p className="text-sm whitespace-pre-wrap">{message.content}</p></div>)}
          <div className="flex items-center justify-between mt-2">
            <div className={cn("text-xs flex items-center space-x-1", isUser ? "text-blue-100" : "text-slate-500")}><Clock className="h-3 w-3" /><span>{formatTime(message.timestamp)}</span></div>
            {message.isEmergency && <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Emergency</Badge>}
          </div>
        </div>
      </div>
    </div>
  )
}
function EmergencyBanner() {
  return <div className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-3 flex items-center space-x-3 shadow-sm z-10"><AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" /><div className="flex-1"><p className="font-semibold text-sm">⚠️ Emergency Detected</p><p className="text-xs text-red-700">Please seek immediate medical attention or call emergency services if this is urgent.</p></div></div>
}

// --- Core Interactive Components ---

function ChatInput() {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([])
  const [isSending, setIsSending] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  // Get state and actions from Zustand store
  const { addMessage, setIsTyping, setStreamingState, messages, patientType } = useChatStore()

  // --- Audio Recording Logic (Unchanged) ---
  const startRecording = async () => { /* ... same as original ... */ };
  const stopRecording = () => { /* ... same as original ... */ };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({ file, url: URL.createObjectURL(file), type: file.type }));
    setAttachedFiles(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const removeFile = (index: number) => {
    setAttachedFiles(prev => { const newFiles = [...prev]; URL.revokeObjectURL(newFiles[index].url); newFiles.splice(index, 1); return newFiles; });
  }

  // --- ** API-Connected Send Message Logic ** ---
  const sendMessage = async () => {
    if ((!input.trim() && !audioBlob && attachedFiles.length === 0) || isSending) return
    
    setIsSending(true)

    // Prepare user message
    let userContent = input.trim()
    if (attachedFiles.length > 0) {
      userContent += `\n\n[Attached ${attachedFiles.length} file(s): ${attachedFiles.map(f => f.file.name).join(', ')}]`
    }
    if (audioBlob && !userContent) {
        userContent = "[Voice Message]"
    }

    const userMessage: Message = {
      id: Date.now().toString(), type: "user", content: userContent, timestamp: new Date(),
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      fileUrl: attachedFiles[0] ? attachedFiles[0].url : undefined,
      fileName: attachedFiles[0] ? attachedFiles[0].file.name : undefined,
      fileType: attachedFiles[0] ? attachedFiles[0].type : undefined,
    }

    addMessage(userMessage)
    setInput(""); setAudioBlob(null); setAttachedFiles([]);
    setIsTyping(true)
    
    // Format history for the backend
    const history: [string, string][] = messages
      .filter(m => m.type === 'user' || m.type === 'ai')
      .reduce((acc, msg, i, arr) => {
        if (msg.type === 'user' && i + 1 < arr.length && arr[i+1].type === 'ai') {
          acc.push([msg.content, arr[i+1].content]);
        }
        return acc;
      }, [] as [string, string][]);

    let fullResponse = ""
    await streamChatCompletion(
      { 
        message: input.trim(),
        audioFile: audioBlob || undefined, // Send audio blob if it exists
        history, 
        patient_type: patientType 
      },
      {
        onToken: (token) => {
          setIsTyping(false) // Stop "thinking" indicator
          fullResponse += token
          setStreamingState(true, fullResponse)
        },
        onComplete: () => {
          setStreamingState(false)
          const isEmergency = fullResponse.includes("⚠️") || fullResponse.toLowerCase().includes("emergency");
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(), type: "ai", content: fullResponse,
            timestamp: new Date(), isEmergency,
          }
          addMessage(aiMessage)
          setIsSending(false)
        },
        onError: (error) => {
          setIsTyping(false)
          setStreamingState(false)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(), type: "ai", content: `❌ Error: ${error}`,
            timestamp: new Date(),
          }
          addMessage(errorMessage)
          setIsSending(false)
        }
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const formatRecordingTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`; };
  
  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {attachedFiles.length > 0 && <div className="mb-3 space-y-2">{attachedFiles.map((file, i) => <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />)}</div>}
      {audioBlob && <div className="mb-3 p-3 bg-slate-50 rounded-lg border flex items-center justify-between"><div className="flex items-center space-x-2"><FileAudio className="h-4 w-4 text-slate-600" /><span className="text-sm text-slate-600">Voice message ready</span></div><Button size="icon" variant="ghost" onClick={() => setAudioBlob(null)}><X className="h-4 w-4" /></Button></div>}
      <div className="flex items-end space-x-3">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message or use the mic..." className="min-h-[44px] max-h-32 resize-none" disabled={isSending || isRecording || !!audioBlob} />
        <div className="flex space-x-2">
          <Button size="icon" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSending || isRecording}><Paperclip className="h-4 w-4" /></Button>
          <Button size="icon" variant={isRecording ? "destructive" : "outline"} onClick={isRecording ? stopRecording : startRecording} disabled={isSending}>{isRecording ? <Square className="h-4 w-4"/> : <Mic className="h-4 w-4"/> }</Button>
          <Button size="icon" onClick={sendMessage} disabled={(!input.trim() && !audioBlob && attachedFiles.length === 0) || isSending} className="bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
      {isRecording && <div className="mt-2 flex items-center justify-center space-x-2 text-red-600"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /><span className="text-sm font-medium">Recording... {formatRecordingTime(recordingTime)}</span></div>}
      <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
    </div>
  )
}

function ChatMessages() {
  const { messages, isTyping, isStreaming, streamingContent } = useChatStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping, isStreaming, streamingContent])

  const shouldShowDate = (message: Message, index: number) => {
    if (index === 0) return true
    const prevMessage = messages[index - 1]
    return formatDate(message.timestamp) !== formatDate(prevMessage.timestamp)
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-50">
      {messages.map((msg, i) => <MessageBubble key={msg.id} message={msg} showDate={shouldShowDate(msg, i)} />)}
      {isTyping && <TypingIndicator />}
      {isStreaming && streamingContent && <StreamingMessage content={streamingContent} />}
    </div>
  )
}

function ChatHeader() {
  const [isExporting, setIsExporting] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "loading">("loading")

  const { patientType, setPatientType, messages, hasEmergency, clearHistory } = useChatStore()

  useEffect(() => {
    checkBackendStatus()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"))
  }, [])

  const handleExportPDF = async () => {
    if (messages.length === 0) return;
    setIsExporting(true)
    try {
      const history: [string, string][] = messages
        .filter(m => m.type === 'user' || m.type === 'ai')
        .reduce((acc, msg, i, arr) => {
            if (msg.type === 'user' && i + 1 < arr.length && arr[i+1].type === 'ai') {
                acc.push([msg.content, arr[i+1].content]);
            }
            return acc;
        }, [] as [string, string][]);

      await exportToPDF({ history, patient_type: patientType, is_emergency: hasEmergency })
    } catch (error: any) {
      alert(`Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearHistory = () => {
    clearHistory();
    setShowClearDialog(false);
  }

  return (
    <header className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md z-20">
      <div className="flex items-center space-x-3"><div className="bg-white rounded-full p-2"><Stethoscope className="h-6 w-6 text-blue-600" /></div><div><h1 className="text-xl font-semibold">Dr. MediMate</h1><p className="text-blue-100 text-sm flex items-center gap-1.5">{apiStatus === "loading" ? "Connecting..." : apiStatus === "online" ? <><Wifi className="h-4 w-4 text-green-300"/>Online</> : <><WifiOff className="h-4 w-4 text-red-300"/>Offline</>}</p></div></div>
      <div className="flex items-center space-x-3">
        <Select value={patientType} onValueChange={(v: any) => setPatientType(v)}>
          <SelectTrigger className="w-32 bg-white text-slate-900"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="auto">Auto</SelectItem><SelectItem value="pediatric">Pediatric</SelectItem><SelectItem value="chronic">Chronic</SelectItem></SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting || messages.length === 0} className="bg-white text-blue-600 hover:bg-blue-50"><FileText className="h-4 w-4 mr-2" />{isExporting ? "Exporting..." : "Export PDF"}</Button>
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogTrigger asChild><Button variant="outline" size="icon" disabled={messages.length === 0} className="bg-white text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Clear Chat History</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowClearDialog(false)}>Cancel</Button><Button variant="destructive" onClick={handleClearHistory}>Clear History</Button></DialogFooter></DialogContent>
        </Dialog>
      </div>
    </header>
  )
}

function ChatInterface() {
  const { hasEmergency, messages, addMessage } = useChatStore()
  
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: "welcome-message", type: "ai",
        content: "Hello! I'm Dr. MediMate. I can help with health questions but I'm not a substitute for professional medical care. How can I assist you?",
        timestamp: new Date(), isEmergency: false,
      })
    }
  }, []); // Runs only once on initial load if messages are empty

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader />
      {hasEmergency && <EmergencyBanner />}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatMessages />
      </div>
      <ChatInput />
    </div>
  )
}

export default function EnhancedMediMateChat() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-4xl h-screen sm:h-[calc(100vh-2rem)] bg-white shadow-2xl rounded-none sm:rounded-lg overflow-hidden flex flex-col">
        <ChatInterface />
      </div>
    </div>
  )
}