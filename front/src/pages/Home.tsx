"use client"

import React, { useState } from "react"
import { 
    Stethoscope, 
    Shield, 
    Brain, 
    Lock, 
    Server, 
    Heart, 
    CheckCircle, 
    UserCheck,
    BarChart3,
    Activity,
    MessageCircle,
    Target,
    BookOpen,
    ArrowRight,
    Zap
} from "lucide-react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage: React.FC = () => {
    const { theme } = useTheme()
    const [inputValue, setInputValue] = useState("")
    const navigate = useNavigate()
    
    const handleQuickStart = () => {
        if (inputValue.trim()) {
            navigate(`/chat-enhanced?data=${encodeURIComponent(inputValue)}`)
        } else {
            navigate('/dashboard')
        }
    }

    const coreFeatures = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: "AI-Powered Chat Support",
            description: "Get intelligent, empathetic responses with advanced NLP models for psychological support.",
            link: "/chat-enhanced"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Crisis Assessment",
            description: "Real-time risk evaluation with immediate intervention strategies and emergency resources.",
            link: "/crisis-assessment"
        },
        {
            icon: <Activity className="w-8 h-8" />,
            title: "Mood Tracking",
            description: "Monitor emotional wellbeing with comprehensive analytics and personalized insights.",
            link: "/mood-tracking"
        },
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: "Therapy Resources",
            description: "Evidence-based therapeutic tools, techniques, and educational materials.",
            link: "/resources"
        },
    ]

    const advancedFeatures = [
        {
            icon: <Stethoscope className="w-6 h-6" />,
            title: "Dynamic Prompt Engineering",
            description: "Adaptive therapeutic responses based on individual needs and session context.",
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Session Analytics",
            description: "Comprehensive tracking of progress, mood trends, and therapeutic outcomes.",
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Personalized Goals",
            description: "Set and track therapy objectives with progress monitoring and insights.",
        },
        {
            icon: <Heart className="w-6 h-6" />,
            title: "Multimodal Support",
            description: "Text and voice interaction with emotional analysis and sentiment detection.",
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Secure & Private",
            description: "End-to-end encryption with local processing options for sensitive data.",
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Real-time Processing",
            description: "Instant responses with streaming chat and immediate crisis detection.",
        },
    ]

    const useCases = [
        {
            category: "For Healthcare Professionals",
            icon: <UserCheck className="w-6 h-6" />,
            items: [
                "AI-Assisted Clinical Assessments",
                "Patient Education Material Generation",
                "Differential Diagnosis Exploration",
                "Workflow Enhancement & Consultation Support",
            ],
        },
    ]

    const techSpecs = [
        { label: "Backend", value: "Python 3.8+ with Jupyter" },
        { label: "AI Models", value: "Llama 3.2, Gemma 7B, Gemini 2.0" },
        { label: "Interface", value: "Gradio Web UI" },
        { label: "Deployment", value: "Local server, Docker ready" },
        { label: "APIs", value: "OpenRouter, Ollama" },
        { label: "Response Time", value: "2-5 seconds" },
        { label: "Uptime", value: "99.9% availability" },
    ]

    return (
        <div
            className={`min-h-screen transition-all duration-500 ease-in-out ${
                theme === "dark"
                    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
                    : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
            }`}
        >
            <HeaderCompo/>

            {/* Hero Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated background elements */}
                {theme === 'dark' ? (
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500 filter blur-3xl opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-blue-600 filter blur-3xl opacity-20 animate-pulse"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-200 filter blur-3xl animate-float"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-100 filter blur-3xl animate-float-delay"></div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Headline with animated gradient */}
                    <h1
                        className={`text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 ${
                            theme === 'dark'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300'
                                : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500'
                        }`}
                    >
                        <span className="block">Empowering Health Through</span>
                        <span className="block mt-4">
                    <span className="animate-text-shimmer">Intelligent Agents</span>
                </span>
                    </h1>

                    {/* Subtext with better typography */}
                    <p
                        className={`mt-8 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                    >
                        Your Personal Health Companion , MediMate !
                        <span className={`block mt-2 ${theme === 'dark' ? 'text-cyan-200' : 'text-blue-500'}`}>
                </span>
                    </p>

                    {/* Enhanced input form with micro-interactions */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // handle input submit here
                        }}
                        className="mt-12 flex justify-center items-center max-w-2xl mx-auto relative"
                    >
                        <input
                            type="text"
                            placeholder="Tell me , what do you feel today ?"
                            className={`flex-1 px-6 py-5 rounded-xl border-0 text-lg shadow-lg transition-all duration-300 focus:ring-4 focus:outline-none ${
                                theme === 'dark'
                                    ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-cyan-500/30'
                                    : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500/20'
                            }`}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                        />
                        <button
                            onClick={handleQuickStart}
                            type="submit"
                            className={`absolute right-2 p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                theme === 'dark'
                                    ? 'bg-cyan-500 text-gray-900 hover:bg-cyan-400'
                                    : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                            style={{boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)'}}
                            title="Send"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 5l7 7-7 7M5 12h16"
                                />
                            </svg>
                        </button>
                    </form>


                </div>
            </section>
        </div>
    )
}

export default HomePage
