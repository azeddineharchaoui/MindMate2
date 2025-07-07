"use client"

import type React from "react"
import { useState } from "react"
import {
    Stethoscope,
    Check,
    X,
    Heart,
    Brain,
    Shield,
    FileText,
    Zap,
    Star,
    ArrowRight,
    Activity,
    Headphones,
} from "lucide-react"
import { useTheme } from "@/components/ThemeContext"
import { Link } from "react-router-dom"
import HeaderCompo from "@/pages/components/Header";
import FooterCompo from "@/pages/components/Footer";

const ServicesPage: React.FC = () => {
    const { theme } = useTheme()
    const [isAnnual, setIsAnnual] = useState(false)

    const services = [
        {
            icon: <Stethoscope className="w-8 h-8" />,
            title: "AI Medical Consultations",
            description: "Get professional medical assessments and diagnoses from our advanced AI physician.",
        },
        {
            icon: <Brain className="w-8 h-8" />,
            title: "Clinical Analysis",
            description: "Systematic symptom analysis with differential diagnosis using multiple AI models.",
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Treatment Plans",
            description: "Receive specific medication recommendations with proper dosages and instructions.",
        },
        {
            icon: <Activity className="w-8 h-8" />,
            title: "Health Monitoring",
            description: "Continuous health tracking with personalized recommendations and follow-up care.",
        },
    ]

    const plans = [
        {
            name: "Free Plan",
            price: "0",
            period: "Forever",
            description: "Perfect for basic health consultations and getting started with AI medical advice.",
            popular: false,
            features: [
                { name: "5 AI Consultations per month", included: true },
                { name: "Basic symptom analysis", included: true },
                { name: "General health recommendations", included: true },
                { name: "Access to health library", included: true },
                { name: "Email support", included: true },
                { name: "Advanced diagnostic tools", included: false },
                { name: "Unlimited consultations", included: false },
                { name: "Priority support", included: false },
                { name: "Detailed treatment plans", included: false },
                { name: "Health history tracking", included: false },
                { name: "Multiple AI model access", included: false },
                { name: "Prescription management", included: false },
            ],
            buttonText: "Get Started Free",
            buttonLink: "/register",
        },
        {
            name: "Premium Plan",
            price: isAnnual ? "150" : "15",
            period: isAnnual ? "per year" : "per month",
            description: "Complete medical consultation experience with unlimited access and advanced features.",
            popular: true,
            features: [
                { name: "Unlimited AI Consultations", included: true },
                { name: "Advanced symptom analysis", included: true },
                { name: "Detailed treatment plans", included: true },
                { name: "Multiple AI model access", included: true },
                { name: "Priority 24/7 support", included: true },
                { name: "Health history tracking", included: true },
                { name: "Prescription management", included: true },
                { name: "Lab result analysis", included: true },
                { name: "Emergency consultation", included: true },
                { name: "Family health profiles", included: true },
                { name: "Export medical reports", included: true },
                { name: "Telemedicine integration", included: true },
            ],
            buttonText: "Start Premium",
            buttonLink: "/register",
        },
    ]

    const stats = [
        { number: "50K+", label: "Consultations Completed" },
        { number: "98%", label: "Accuracy Rate" },
        { number: "24/7", label: "Available Support" },
        { number: "3", label: "AI Models" },
    ]

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${
                theme === "dark"
                    ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white"
                    : "bg-gradient-to-br from-white via-blue-50 to-white text-gray-900"
            }`}
        >
            <HeaderCompo />

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 ${
                            theme === "dark"
                                ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                    >
                        <Heart className="w-4 h-4 mr-2" />
                        Professional Medical Services
                    </div>

                    <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Your AI{" "}
                        <span
                            className={`${
                                theme === "dark"
                                    ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                                    : "bg-gradient-to-r from-blue-600 to-blue-500"
                            } bg-clip-text text-transparent`}
                        >
              Medical
            </span>{" "}
                        Assistant
                    </h1>

                    <p
                        className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                        Get professional medical consultations, diagnoses, and treatment recommendations powered by advanced AI
                        technology.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div
                                    className={`text-3xl md:text-4xl font-bold mb-2 ${
                                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                                    }`}
                                >
                                    {stat.number}
                                </div>
                                <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className={`py-20 px-4 sm:px-6 lg:px-8 ${theme === "dark" ? "bg-gray-800/30" : "bg-gray-50"}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Our Services
                        </h2>
                        <p className={`text-xl max-w-3xl mx-auto ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                            Comprehensive AI-powered medical services designed to provide you with the best healthcare experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={`p-8 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 ${
                                    theme === "dark"
                                        ? "bg-gray-800/50 border border-gray-700 hover:border-blue-500"
                                        : "bg-white border border-gray-200 hover:border-blue-300 shadow-lg"
                                }`}
                            >
                                <div
                                    className={`inline-flex p-3 rounded-xl mb-6 ${
                                        theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                                    }`}
                                >
                                    {service.icon}
                                </div>
                                <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    {service.title}
                                </h3>
                                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Choose Your Plan
                        </h2>
                        <p className={`text-xl max-w-3xl mx-auto mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                            Start with our free plan or upgrade to premium for unlimited access to all features.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center mb-12">
                            <span className={`mr-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    isAnnual
                                        ? theme === "dark"
                                            ? "bg-blue-600"
                                            : "bg-blue-500"
                                        : theme === "dark"
                                            ? "bg-gray-600"
                                            : "bg-gray-300"
                                }`}
                            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isAnnual ? "translate-x-6" : "translate-x-1"
                    }`}
                />
                            </button>
                            <span className={`ml-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Annual
                <span className={`ml-1 text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                  (Save 17%)
                </span>
              </span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative p-8 rounded-2xl transition-all duration-300 ${
                                    plan.popular
                                        ? theme === "dark"
                                            ? "bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-2 border-blue-500 shadow-2xl shadow-blue-500/25"
                                            : "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 shadow-2xl shadow-blue-500/25"
                                        : theme === "dark"
                                            ? "bg-gray-800/50 border border-gray-700"
                                            : "bg-white border border-gray-200 shadow-lg"
                                } hover:transform hover:scale-105`}
                            >
                                {plan.popular && (
                                    <div
                                        className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium ${
                                            theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                                        }`}
                                    >
                                        <Star className="w-4 h-4 inline mr-1" />
                                        Most Popular
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="mb-4">
                    <span className={`text-5xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                      ${plan.price}
                    </span>
                                        <span className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      /{plan.period}
                    </span>
                                    </div>
                                    <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{plan.description}</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center">
                                            {feature.included ? (
                                                <Check className={`w-5 h-5 mr-3 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
                                            ) : (
                                                <X className={`w-5 h-5 mr-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                                            )}
                                            <span
                                                className={`${
                                                    feature.included
                                                        ? theme === "dark"
                                                            ? "text-gray-300"
                                                            : "text-gray-700"
                                                        : theme === "dark"
                                                            ? "text-gray-500"
                                                            : "text-gray-400"
                                                }`}
                                            >
                        {feature.name}
                      </span>
                                        </div>
                                    ))}
                                </div>

                                <Link to={plan.buttonLink}>
                                    <button
                                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center group ${
                                            plan.popular
                                                ? theme === "dark"
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                                                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                                : theme === "dark"
                                                    ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                                                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                                        }`}
                                    >
                                        {plan.buttonText}
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Comparison */}
            <section className={`py-20 px-4 sm:px-6 lg:px-8 ${theme === "dark" ? "bg-gray-800/30" : "bg-gray-50"}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Why Choose MediMate?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Shield className="w-8 h-8" />,
                                title: "HIPAA Compliant",
                                description: "Your medical data is secure and private with enterprise-grade encryption.",
                            },
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: "Instant Results",
                                description: "Get medical assessments in 2-5 seconds with our advanced AI models.",
                            },
                            {
                                icon: <Headphones className="w-8 h-8" />,
                                title: "24/7 Support",
                                description: "Round-the-clock medical consultation and customer support available.",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`text-center p-8 rounded-2xl ${
                                    theme === "dark"
                                        ? "bg-gray-800/50 border border-gray-700"
                                        : "bg-white border border-gray-200 shadow-lg"
                                }`}
                            >
                                <div
                                    className={`inline-flex p-4 rounded-full mb-6 ${
                                        theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                                    }`}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    {feature.title}
                                </h3>
                                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Ready to Start Your Health Journey?
                    </h2>
                    <p className={`text-xl mb-12 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Join thousands of users who trust MediMate for their medical consultations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button
                                className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                                    theme === "dark"
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                }`}
                            >
                                Start Free Trial
                            </button>
                        </Link>
                        <Link to="/aboutus">
                            <button
                                className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border-2 ${
                                    theme === "dark"
                                        ? "border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900"
                                        : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                                }`}
                            >
                                Learn More
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
            <FooterCompo/>

        </div>
    )
}

export default ServicesPage
