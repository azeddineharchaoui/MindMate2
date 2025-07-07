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
    Bot
} from "lucide-react";
import { 
    streamChatCompletion, 
    assessCrisis, 
    analyzeSymptoms,
    createSession,
    endSession,
    exportToPDF
} from "@/lib/api";
import { useSearchParams } from "react-router-dom";

const ChatPage = () => {
    const { theme } = useTheme();

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
    const [crisisAlert, setCrisisAlert] = useState<boolean>(false);
    const [lastAnalysis, setLastAnalysis] = useState<any>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        // Initialize session
        initializeSession();
        
        if (urlData && !hasProcessedRef.current) {
            hasProcessedRef.current = true;
            const userMessage = {
                id: Date.now().toString(),
                type: "user",
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
            const session = await createSession("demo_user");
            setSessionId(session.session_id);
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);

                const audioMessage = {
                    id: Date.now().toString(),
                    type: "user" as const,
                    content: "[Audio message]",
                    timestamp: new Date(),
                    audioUrl: audioUrl,
                };

                addMessage(audioMessage);
                generateAIResponse("[Audio message]", audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const processStreamingBuffer = () => {
        if (streamingBufferRef.current.length === 0 || isProcessingRef.current) {
            return;
        }

        isProcessingRef.current = true;
        const word = streamingBufferRef.current.shift();

        if (word) {
            setStreamingState(true, word);

            // Adjust this delay for faster/slower typing speed
            const delay = word.match(/[,.!?]/) ? 150 : 50;

            setTimeout(() => {
                isProcessingRef.current = false;
                processStreamingBuffer();
            }, delay);
        } else {
            isProcessingRef.current = false;
        }
    };

    const generateAIResponse = async (prompt: string, audioBlob?: Blob) => {
        // 1. Reset the streaming state and content for the new response
        setStreamingState(true, ""); // Clear previous content

        // This will hold the complete message for saving at the end
        let finalContent = "";

        const history = messages.map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
        }));

        try {
            await streamChatCompletion(
                {
                    message: prompt,
                    audioFile: audioBlob || undefined,
                    history,
                    patient_type: "general",
                },
                {
                    onToken: (token) => {
                        // Append the new token to the previous content
                        setStreamingState(true, token);

                        // Also build up the final content in our local variable
                        finalContent += token;
                    },
                    onComplete: () => {
                        // Use the complete, locally accumulated message
                        const aiMessage = {
                            id: Date.now().toString(),
                            type: "ai" as const,
                            content: finalContent, // Use the complete message here
                            timestamp: new Date(),
                        };
                        addMessage(aiMessage);

                        // Reset the streaming state completely
                        setStreamingState(false, ""); // Clear streaming content
                    },
                    onError: (errorMessage) => {
                        setStreamingState(false, ""); // Clear streaming content on error
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
            // Ensure streaming state is turned off on error
            setStreamingState(false, "");
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
        }`}
        >
            <HeaderCompo />

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
                <div className="flex-1 overflow-y-auto space-y-6">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} mb-4 last:mb-0`}>
                            <div className={`max-w-[85%] rounded-3xl px-4 py-3 ${message.type === "user"
                                ? "bg-gradient-to-r w-max from-blue-500 to-indigo-600 text-white"
                                : theme === "dark"
                                    ? "bg-gray-800 text-gray-100"
                                    : "bg-gray-50 text-gray-800 shadow-sm"}`}
                                 style={{
                                     boxShadow: message.type !== "user" && theme !== "dark"
                                         ? "0 1px 2px rgba(0,0,0,0.05)"
                                         : "none"
                                 }}>

                                {/* Header with avatar and name */}
                                <div className="flex items-center  space-x-3 mb-2">
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
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="font-semibold text-sm">
        {message.type === "user" ? "You" : "Medi Mate"}
      </span>
                                </div>

                                {/* Message content */}
                                {message.audioUrl ? (
                                    <div className="mt-1 mb-1">
                                        <audio
                                            controls
                                            src={message.audioUrl}
                                            className="w-[250px] rounded-lg"
                                            style={{
                                                '--track-color': message.type === 'user' ? '#ffffff40' : '#00000020',
                                                '--thumb-color': message.type === 'user' ? '#ffffff' : '#3b82f6'
                                            }}
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

                    {isStreaming && (
                        <div className="flex justify-start">
                            <div className={`max-w-3xl rounded-2xl px-5 py-4 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800 border border-gray-200"}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-cyan-500" : "bg-blue-500"}`}>
                                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">AI Assistant</span>
                                </div>
                                <p>
                                    {streamingContent}
                                    <span className="ml-1 inline-block h-4 w-1 bg-current align-middle animate-blink"></span>
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

                <div  className={`p-5 rounded-[10px] sticky bottom-0 pb-4 transition-all duration-500 ease-in-out ${
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
                        AI Agent may produce inaccurate information about people, places, or facts.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .animate-blink {
                    animation: blink 1s step-end infinite;
                }
            `}</style>
        </div>
    );
};

export default ChatPage;