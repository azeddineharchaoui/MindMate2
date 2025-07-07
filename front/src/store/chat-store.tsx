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
    isStreaming: false,
    streamingContent: "",
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
        return {
            isStreaming,
            streamingContent: isStreaming ? state.streamingContent + content : content
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