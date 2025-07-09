"use client"

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeContext";
import HeaderCompo from "@/pages/components/Header";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
    Mic, 
    StopCircle, 
    Send, 
    AlertTriangle, 
    Brain, 
    Heart,
    Shield,
    FileText,
    Download,
    Settings,
    Bot,
    Activity
} from "lucide-react";
import { 
    streamChatCompletion, 
    assessCrisis, 
    analyzeSymptoms,
    createSession,
    endSession,
    exportComprehensiveReport,
    transcribeAudio
} from "@/lib/api";
import { useSearchParams, useNavigate } from "react-router-dom";

const ChatPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const {
        messages,
        addMessage,
        isTyping,
        isStreaming,
        streamingContent,
        setStreamingState,
    } = useChatStore();
    const [searchParams] = useSearchParams();
    const urlData = searchParams.get("data") || "";

    const [inputValue, setInputValue] = useState(urlData);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [crisisAlert, setCrisisAlert] = useState<boolean>(false);
    const [lastAnalysis, setLastAnalysis] = useState<any>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [error, setError] = useState<string>("");
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        // Check for authentication
        const token = localStorage.getItem('mindmate_token');
        const storedUserId = localStorage.getItem('mindmate_user_id');
        
        if (!token || !storedUserId) {
            // Optionally redirect to login
            // navigate('/login');
            // For now, allow anonymous usage with a guest ID
            setUserId(`guest_${Date.now()}`);
        } else {
            setUserId(storedUserId);
        }
    }, []);
    
    // Initialize session when userId changes
    useEffect(() => {
        if (userId) {
            initializeSession();
        }
    }, [userId]);

    // Handle URL data parameter
    useEffect(() => {
        if (urlData && !hasProcessedRef.current) {
            hasProcessedRef.current = true;
            const userMessage = {
                id: Date.now().toString(),
                type: "user" as const,
                content: urlData,
                timestamp: new Date(),
            };
            addMessage(userMessage);
            generateAIResponse(urlData);
            setInputValue("");
        }
    }, [urlData]);

    const initializeSession = async () => {
        try {
            if (!userId) return;
            
            const session = await createSession(userId);
            setSessionId(session.session_id);
            console.log("Session created:", session.session_id);
        } catch (err) {
            console.error("Failed to create session:", err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            type: "user" as const,
            content: inputValue,
            timestamp: new Date(),
        };

        addMessage(userMessage);
        setInputValue("");
        generateAIResponse(inputValue);
    };

    const startRecording = async () => {
        try {
            setError("");
            
            // Request audio with specific constraints for better compatibility
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,          // Mono recording
                    sampleRate: 44100,        // Standard sample rate
                    echoCancellation: true,   // Enable echo cancellation
                    noiseSuppression: true,   // Enable noise suppression
                } 
            });
            
            // Use specific MIME type and configure the recorder
            const options = { 
                mimeType: 'audio/webm; codecs=opus',     // Use webm for better compatibility
                audioBitsPerSecond: 128000  // 128kbps bitrate
            };
            
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];
            
            console.log("Chat: Recording started with audio/webm format");

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    console.log(`Chat: Received audio chunk: ${event.data.size} bytes`);
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                console.log(`Chat: Recording stopped. Total chunks: ${audioChunksRef.current.length}`);
                
                if (audioChunksRef.current.length === 0) {
                    setError("No audio data was recorded. Please try again.");
                    return;
                }
                
                // Create audio blob from the recorded chunks
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                console.log(`Chat: Audio blob created. Size: ${audioBlob.size} bytes`);
                
                if (audioBlob.size < 100) {
                    setError("Recorded audio is too short or empty. Please try again.");
                    return;
                }
                
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);

                // Use the transcription API to get the text
                transcribeAudio(audioBlob)
                    .then(result => {
                        console.log("Chat: Transcription succeeded:", result);
                        const transcription = result.text || "[Audio could not be transcribed]";
                        const emotions = result.emotions ? 
                            `(Detected emotions: ${Object.entries(result.emotions)
                                .map(([emotion, score]) => `${emotion}: ${(Number(score) * 100).toFixed(0)}%`)
                                .join(', ')})` : '';
                        
                        const audioMessage = {
                            id: Date.now().toString(),
                            type: "user" as const,
                            content: `"${transcription}" ${emotions}`,
                            timestamp: new Date(),
                            audioUrl: audioUrl,
                        };
                        
                        addMessage(audioMessage);
                        generateAIResponse(transcription, audioBlob);
                    })
                    .catch(error => {
                        console.error("Chat: Transcription failed:", error);
                        const audioMessage = {
                            id: Date.now().toString(),
                            type: "user" as const,
                            content: "[Audio message - Transcription failed]",
                            timestamp: new Date(),
                            audioUrl: audioUrl,
                        };
                        
                        addMessage(audioMessage);
                        generateAIResponse("[Audio message]", audioBlob);
                    });
            };

            // Start recording with 10ms timeslice to get frequent chunks
            mediaRecorderRef.current.start(10);
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
            setError("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const performCrisisAssessment = async (message: string) => {
        try {
            const history = messages.map(m => m.content);
            const assessment = await assessCrisis(message, userId || undefined, history);
            
            // Check for high or critical risk levels to show alert
            const riskLevel = assessment?.risk_assessment?.risk_level?.toLowerCase() || "";
            if (riskLevel === "high" || riskLevel === "critical") {
                setCrisisAlert(true);
            }
            
            setLastAnalysis(assessment);
            return assessment;
        } catch (err) {
            console.error("Crisis assessment failed:", err);
            return null;
        }
    };

    const performSymptomAnalysis = async (message: string) => {
        try {
            const history = messages.map(m => m.content);
            const analysis = await analyzeSymptoms(message, history);
            setLastAnalysis(analysis);
            return analysis;
        } catch (err) {
            console.error("Symptom analysis failed:", err);
            return null;
        }
    };

    const generateAIResponse = async (prompt: string, audioBlob?: Blob) => {
        setStreamingState(true, "");

        let finalContent = "";
        const history: [string, string][] = messages
            .reduce((acc: [string, string][], msg, i, arr) => {
                if (msg.type === 'user' && i + 1 < arr.length && arr[i+1].type === 'ai') {
                    acc.push([msg.content, arr[i+1].content]);
                }
                return acc;
            }, []);

        // Perform background analysis for crisis detection and symptom analysis
        Promise.all([
            performCrisisAssessment(prompt),
            performSymptomAnalysis(prompt)
        ]).catch(err => console.error("Background analysis failed:", err));

        try {
            await streamChatCompletion(
                {
                    message: prompt,
                    audioFile: audioBlob || undefined,
                    user_id: userId || undefined,
                    session_id: sessionId || undefined,
                    history,
                    patient_type: "general",
                },
                {
                    onToken: (token) => {
                        finalContent += token;
                        setStreamingState(true, finalContent);
                    },
                    onComplete: () => {
                        const aiMessage = {
                            id: Date.now().toString(),
                            type: "ai" as const,
                            content: finalContent,
                            timestamp: new Date(),
                        };
                        addMessage(aiMessage);
                        setStreamingState(false, "");
                    },
                    onError: (errorMessage) => {
                        setStreamingState(false, "");
                        const errorMsg = {
                            id: Date.now().toString(),
                            type: "ai" as const,
                            content: `⚠️ ${errorMessage}`,
                            timestamp: new Date(),
                        };
                        addMessage(errorMsg);
                    },
                }
            );
        } catch (err: any) {
            console.error("Error in AI response:", err);
            setStreamingState(false, "");
        }
    };

    const handleExportChat = async () => {
        // Add a processing message to indicate export is in progress
        const processingMsg = {
            id: Date.now().toString(),
            type: "ai" as const,
            content: "📊 Preparing your report... This may take a few moments.",
            timestamp: new Date(),
        };
        addMessage(processingMsg);
        
        try {
            if (!userId) {
                console.error("No user ID available for report export");
                
                // If no user ID is available, show a message to encourage login
                const errorMsg = {
                    id: Date.now().toString(),
                    type: "ai" as const,
                    content: "⚠️ To export your chat history, please log in or create an account. Your data will be securely saved for future reference.",
                    timestamp: new Date(),
                };
                addMessage(errorMsg);
                return;
            }
            
            console.log(`Exporting report for user ${userId}, session ${sessionId || 'none'}`);
            
            // For comprehensive report we need a user ID and optionally a session ID
            await exportComprehensiveReport(userId, sessionId || undefined);
            
            // Add confirmation message
            const confirmationMsg = {
                id: Date.now().toString(),
                type: "ai" as const,
                content: "✅ Your chat report has been successfully exported! You can find the PDF in your downloads folder.",
                timestamp: new Date(),
            };
            addMessage(confirmationMsg);
        } catch (err: any) {
            console.error("Export failed:", err);
            
            // Provide more detailed error message if available
            let errorContent = "❌ There was an error exporting your chat report. Please try again later.";
            
            if (err.message) {
                if (err.message.includes("library not available")) {
                    errorContent = "❌ The PDF generation service is currently unavailable. Our team has been notified and is working to resolve this issue.";
                } else {
                    errorContent = `❌ Export error: ${err.message}`;
                }
            }
            
            // Show error message in chat
            const errorMsg = {
                id: Date.now().toString(),
                type: "ai" as const,
                content: errorContent,
                timestamp: new Date(),
            };
            addMessage(errorMsg);
        }
    };

    const handleEndSession = async () => {
        if (sessionId) {
            try {
                await endSession(sessionId);
                setSessionId(null);
            } catch (err) {
                console.error("Failed to end session:", err);
            }
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    return (
        <div className={`min-h-screen transition-all duration-500 ease-in-out ${
            theme === "dark"
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
                : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
        }`}>
            <HeaderCompo />

            {/* Crisis Alert Banner */}
            {crisisAlert && (
                <Alert variant="destructive" className="mx-4 mt-4 border-red-500 bg-red-50 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Crisis Detected - Immediate Support Recommended</AlertTitle>
                    <AlertDescription>
                        If you're experiencing a mental health emergency, please call 911, 988 (Suicide & Crisis Lifeline), or text HOME to 741741.
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2 text-red-700 border-red-300"
                            onClick={() => setCrisisAlert(false)}
                        >
                            Acknowledge
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
                {/* Enhanced Header with Session Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${theme === "dark" ? "bg-blue-600" : "bg-blue-500"}`}>
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold">MindMate Assistant</h2>
                            {sessionId && (
                                <p className="text-sm opacity-70">Session: {sessionId.slice(0, 8)}...</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {lastAnalysis && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowAnalysis(!showAnalysis)}
                            >
                                <Brain className="h-4 w-4 mr-1" />
                                Analysis
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleExportChat}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                        {sessionId && (
                            <Button variant="outline" size="sm" onClick={handleEndSession}>
                                End Session
                            </Button>
                        )}
                    </div>
                </div>

                {/* Analysis Panel */}
                {showAnalysis && lastAnalysis && (
                    <div className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Session Analysis
                        </h3>
                        
                        {lastAnalysis.risk_assessment && (
                            <div className="mb-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Risk Assessment
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge 
                                        variant="default" 
                                        className={
                                            lastAnalysis.risk_assessment.risk_level === "high" ? "bg-red-100 text-red-800" :
                                            lastAnalysis.risk_assessment.risk_level === "moderate" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-green-100 text-green-800"
                                        }
                                    >
                                        {lastAnalysis.risk_assessment.risk_level.toUpperCase()} RISK
                                    </Badge>
                                    <span className="text-sm opacity-70">
                                        Confidence: {Math.round(lastAnalysis.risk_assessment.confidence_score * 100)}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {lastAnalysis.detected_symptoms && (
                            <div className="mb-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    Emotional State
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                                        {lastAnalysis.detected_symptoms.dominant_emotion}
                                    </Badge>
                                    <Badge variant="default" className="bg-purple-100 text-purple-800">
                                        {lastAnalysis.detected_symptoms.emotional_intensity}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {lastAnalysis.analysis && (
                            <div>
                                <h4 className="font-medium mb-2">Detected Symptoms</h4>
                                <div className="flex flex-wrap gap-1">
                                    {lastAnalysis.analysis.symptoms?.map((symptom: string, idx: number) => (
                                        <Badge key={idx} variant="default" className="text-xs bg-gray-100 text-gray-700">
                                            {symptom}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-6">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} mb-4 last:mb-0`}>
                            <div className={`max-w-[85%] rounded-3xl px-4 py-3 ${message.type === "user"
                                ? "bg-gradient-to-r w-max from-blue-500 to-indigo-600 text-white"
                                : theme === "dark"
                                    ? "bg-gray-800 text-gray-100"
                                    : "bg-gray-50 text-gray-800 shadow-sm"}`}>

                                {/* Header with avatar and name */}
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${message.type === "user"
                                        ? "bg-white/20 backdrop-blur-sm"
                                        : theme === "dark"
                                            ? "bg-cyan-400/90"
                                            : "bg-gradient-to-r from-cyan-500 to-blue-500"}`}>

                                        {message.type === "user" ? (
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <Bot className="h-5 w-5 text-white" />
                                        )}
                                    </div>
                                    <span className="font-semibold text-sm">
                                        {message.type === "user" ? "You" : "MindMate"}
                                    </span>
                                </div>

                                {/* Message content */}
                                {message.audioUrl ? (
                                    <div className="mt-1 mb-1">
                                        <audio
                                            controls
                                            src={message.audioUrl}
                                            className="w-[250px] rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <p className={`whitespace-pre-wrap text-sm/relaxed ${message.type === "user" ? "text-white/90" : ""}`}>
                                        {message.content}
                                    </p>
                                )}

                                {/* Timestamp */}
                                <div className={`text-xs mt-2 ${message.type === "user"
                                    ? "text-white/60 text-right"
                                    : theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-500"}`}>
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="flex justify-center my-4">
                            <div className={`rounded-lg px-4 py-3 max-w-lg bg-red-100 border border-red-300 text-red-800`}>
                                <div className="flex items-center">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    <span>{error}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {isStreaming && (
                        <div className="flex justify-start">
                            <div className={`max-w-3xl rounded-2xl px-5 py-4 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800 border border-gray-200"}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-cyan-500" : "bg-blue-500"}`}>
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-medium">MindMate</span>
                                </div>
                                <p>
                                    {streamingContent}
                                    <span className="ml-1 inline-block h-4 w-1 bg-current align-middle animate-pulse"></span>
                                </p>
                                <div className="text-xs opacity-70 mt-2">
                                    {new Date().toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Input Area */}
                <div className={`p-5 rounded-[10px] sticky bottom-0 pb-4 transition-all duration-500 ease-in-out ${
                    theme === "dark"
                        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
                        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
                }`}>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        {isRecording ? (
                            <button type="button" onClick={stopRecording} className={`p-3 rounded-xl transition ${theme === "dark" ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-600 text-white hover:bg-red-700"}`} title="Stop Recording">
                                <StopCircle className="h-6 w-6" />
                            </button>
                        ) : (
                            <button type="button" onClick={startRecording} className={`p-3 rounded-xl transition ${theme === "dark" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} title="Record Audio">
                                <Mic className="h-6 w-6" />
                            </button>
                        )}

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            className={`flex-1 px-5 py-4 rounded-xl border-0 text-lg shadow-lg transition-all duration-300 focus:ring-4 focus:outline-none ${
                                theme === "dark"
                                    ? "bg-gray-800 text-white placeholder-gray-400 focus:ring-cyan-500/30"
                                    : "bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500/20"
                            }`}
                        />

                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className={`p-3 rounded-xl transition ${
                                theme === "dark"
                                    ? "bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-cyan-500/50"
                                    : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/50"
                            }`}
                            title="Send"
                        >
                            <Send className="h-6 w-6" />
                        </button>
                    </form>

                    {isRecording && (
                        <div className="mt-2 text-center">
                            <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 animate-pulse">
                                Recording...
                            </div>
                        </div>
                    )}

                    <p className={`text-xs mt-2 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        MindMate provides supportive guidance but is not a substitute for professional mental health care.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
