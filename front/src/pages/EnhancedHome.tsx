"use client"

import React, { useState } from "react"
import { 
    Stethoscope, 
    Shield, 
    Brain, 
    Lock, 
    Heart, 
    CheckCircle, 
    UserCheck,
    BarChart3,
    Activity,
    MessageCircle,
    Target,
    BookOpen,
    ArrowRight,
    Zap,
    Users,
    FileText
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
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "Audio Transcription",
            description: "Turn spoken thoughts into text with emotional analysis for journaling and therapy.",
            link: "/audio-transcription"
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Session Export",
            description: "Generate comprehensive PDF reports of your therapy sessions and progress.",
            link: "/session-export"
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
            category: "Individual Support",
            icon: <Heart className="w-6 h-6" />,
            items: [
                "24/7 psychological support and guidance",
                "Mood tracking and emotional wellbeing monitoring",
                "Crisis intervention and emergency resources",
                "Personalized therapy goals and progress tracking",
            ],
        },
        {
            category: "Professional Tools",
            icon: <UserCheck className="w-6 h-6" />,
            items: [
                "Comprehensive session analytics and insights",
                "Evidence-based therapeutic resource library",
                "Risk assessment and intervention protocols",
                "Progress reporting and outcome measurement",
            ],
        },
    ]

    return (
        <div className={`min-h-screen transition-all duration-500 ease-in-out ${
            theme === "dark"
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
                : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
        }`}>
            <HeaderCompo />
            
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="mb-8">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            MindMate
                        </h1>
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                            Advanced Psychological Support Platform
                        </h2>
                        <p className="text-lg lg:text-xl opacity-80 max-w-3xl mx-auto mb-8">
                            Experience comprehensive mental health support with AI-powered chat, crisis assessment, 
                            mood tracking, and evidence-based therapeutic resources — all in one secure platform.
                        </p>
                    </div>

                    {/* Quick Start */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Describe what you're feeling or what support you need..."
                                className={`flex-1 px-6 py-4 rounded-xl text-lg border-0 shadow-lg focus:ring-4 focus:outline-none transition-all ${
                                    theme === "dark"
                                        ? "bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500/30"
                                        : "bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500/20"
                                }`}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleQuickStart()}
                            />
                            <Button
                                onClick={handleQuickStart}
                                className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Start Support
                            </Button>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/dashboard">
                                <Button variant="outline" className="text-sm">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Dashboard
                                </Button>
                            </Link>
                            <Link to="/crisis-assessment">
                                <Button variant="outline" className="text-sm text-red-600 border-red-200 hover:bg-red-50">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Crisis Support
                                </Button>
                            </Link>
                            <Link to="/mood-tracking">
                                <Button variant="outline" className="text-sm">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Track Mood
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Comprehensive Mental Health Support
                        </h2>
                        <p className="text-lg opacity-80 max-w-3xl mx-auto">
                            Our platform combines cutting-edge AI technology with evidence-based therapeutic approaches 
                            to provide personalized, accessible mental health support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreFeatures.map((feature, index) => (
                            <Card 
                                key={index} 
                                className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${
                                    theme === "dark" 
                                        ? "bg-gray-800 border-gray-700 hover:bg-gray-750" 
                                        : "bg-white hover:shadow-xl"
                                }`}
                            >
                                <CardHeader className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-center mb-4">
                                        {feature.description}
                                    </CardDescription>
                                    <Link to={feature.link}>
                                        <Button variant="outline" className="w-full group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500">
                                            Explore
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Advanced Features */}
            <section className={`py-20 px-4 ${theme === "dark" ? "bg-gray-800/50" : "bg-blue-50/50"}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Advanced Features & Capabilities
                        </h2>
                        <p className="text-lg opacity-80 max-w-3xl mx-auto">
                            Powered by state-of-the-art AI and machine learning technologies for comprehensive psychological support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {advancedFeatures.map((feature, index) => (
                            <div 
                                key={index} 
                                className={`p-6 rounded-xl transition-all hover:scale-105 ${
                                    theme === "dark" 
                                        ? "bg-gray-800 border border-gray-700 hover:bg-gray-750" 
                                        : "bg-white hover:shadow-lg"
                                }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                        <p className="opacity-80 text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Designed for Everyone
                        </h2>
                        <p className="text-lg opacity-80 max-w-3xl mx-auto">
                            Whether you're seeking personal support or professional tools, MindMate adapts to your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {useCases.map((useCase, index) => (
                            <Card 
                                key={index} 
                                className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center text-2xl">
                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                                            {useCase.icon}
                                        </div>
                                        {useCase.category}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {useCase.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start">
                                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`py-20 px-4 ${theme === "dark" ? "bg-gray-800" : "bg-blue-600"} text-white`}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                        Start Your Mental Health Journey Today
                    </h2>
                    <p className="text-lg mb-8 opacity-90">
                        Join thousands of users who trust MindMate for comprehensive psychological support and guidance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dashboard">
                            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                                <BarChart3 className="w-5 h-5 mr-2" />
                                View Dashboard
                            </Button>
                        </Link>
                        <Link to="/chat-enhanced">
                            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Start Chatting
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
