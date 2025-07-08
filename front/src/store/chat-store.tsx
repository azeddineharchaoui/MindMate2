"use client"
import { create } from "zustand"

export interface Message {
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

interface ChatStore {
    messages: Message[]
    isTyping: boolean
    isStreaming: boolean,
    streamingContent: string,
    patientType: string
    hasEmergency: boolean
    addMessage: (msg: Message) => void
    setIsTyping: (state: boolean) => void
    setStreamingState: (isStreaming: boolean, content?: string) => void
    setPatientType: (type: string) => void
    clearHistory: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
    isTyping: false,
    isStreaming: false,
    streamingContent: "",
    patientType: "auto",
    hasEmergency: false,

    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg],
        hasEmergency: state.hasEmergency || msg.isEmergency === true,
    })),

    setIsTyping: (isTyping) => set({ isTyping }),

    setStreamingState: (isStreaming, content) => set((state) => {
        if (content === undefined) {
            return { isStreaming };
        }
        
        // If we're starting a new streaming session or clearing content
        if (!isStreaming || content === "") {
            return {
                isStreaming,
                streamingContent: content
            };
        }
        
        // For JSON token objects that may be sent directly from the backend
        let processedContent = content;
        try {
            if (typeof content === 'string' && content.trim().startsWith('{') && content.trim().endsWith('}')) {
                const parsed = JSON.parse(content);
                if (parsed && parsed.token !== undefined) {
                    processedContent = parsed.token;
                }
                // Ignore metadata objects
                if (parsed && (parsed.metadata || parsed.session_id)) {
                    return { isStreaming }; // Don't update content for metadata
                }
            }
        } catch (e) {
            // Not JSON or failed parsing, use as-is
            processedContent = content;
        }
        
        // Since we now pass the accumulated content from the component,
        // we just need to set it directly instead of appending
        return {
            isStreaming,
            streamingContent: processedContent
        };
    }),

    setPatientType: (type) => set({ patientType: type }),

    clearHistory: () => set({
        messages: [],
        hasEmergency: false,
        streamingContent: "",
        isStreaming: false
    })
}))