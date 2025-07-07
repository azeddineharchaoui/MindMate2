"use client"

import type React from "react"
import { Stethoscope, Shield, Brain, Lock, Server, Heart, CheckCircle, UserCheck } from "lucide-react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header";
import FooterCompo from "@/pages/components/Footer";
import {Link} from "react-router-dom";

const AboutUs: React.FC = () => {
  const { theme } = useTheme()

  const features = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Professional Medical Consultations",
      description: "Clinical assessments, treatment plans, diagnostic guidance, and follow-up care recommendations.",
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: "Dual AI Backend Support",
      description: "Ollama (Local) for privacy and OpenRouter (API) for easy access with auto-failover capability.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy & Security",
      description: "Local processing option, secure API, no data storage, and HIPAA-friendly configuration.",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Advanced AI Models",
      description: "Powered by Llama 3.2, Gemma 7B, and Gemini 2.0 for comprehensive medical analysis.",
    },
  ]

  const useCases = [
    {
      category: "For Patients",
      icon: <Heart className="w-6 h-6" />,
      items: [
        "Symptom Analysis & Preliminary Diagnosis",
        "Treatment Guidance & Medication Recommendations",
        "Health Education & Medical Understanding",
        "Emergency Assessment & Urgency Determination",
      ],
    },
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
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white"
          : "bg-gradient-to-br from-white via-blue-50 to-white text-gray-900"
      }`}
    >
      <HeaderCompo/>
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
            <Stethoscope className="w-4 h-4 mr-2" />
            AI-Powered Medical Consultation
          </div>

          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Meet{" "}
            <span
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                  : "bg-gradient-to-r from-blue-600 to-blue-500"
              } bg-clip-text text-transparent`}
            >
              MediMate
            </span>
          </h1>

          <p
            className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Your advanced AI medical consultation system providing professional medical assessments, diagnoses, and
            treatment recommendations through an intuitive interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              }`}
            >
              Start Consultation
            </button>
            <button
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border-2 ${
                theme === "dark"
                  ? "border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900"
                  : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Key Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Unlike basic health chatbots, MediMate acts as your personal AI physician with advanced capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
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

      {/* Use Cases */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${theme === "dark" ? "bg-gray-800/30" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Use Cases
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl ${
                  theme === "dark"
                    ? "bg-gray-800/50 border border-gray-700"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`p-3 rounded-xl mr-4 ${
                      theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {useCase.icon}
                  </div>
                  <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {useCase.category}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {useCase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckCircle
                        className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                          theme === "dark" ? "text-blue-400" : "text-blue-500"
                        }`}
                      />
                      <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Technical Specifications
            </h2>
          </div>

          <div
            className={`rounded-2xl p-8 ${
              theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200 shadow-lg"
            }`}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-3">
                  <span className={`font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {spec.label}
                  </span>
                  <span className={`${theme === "dark" ? "text-blue-400" : "text-blue-600"} font-medium`}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${theme === "dark" ? "bg-gray-800/30" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <Lock className={`w-16 h-16 mx-auto mb-6 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Security & Compliance
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Your privacy and data security are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Environment Variables - Secure API key management",
              "Local Processing - Complete data privacy option",
              "No Logging - Conversations are not stored",
              "HIPAA-Compliant - Healthcare-ready configuration",
            ].map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  theme === "dark"
                    ? "bg-gray-800/50 border border-gray-700"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
              >
                <CheckCircle
                  className={`w-8 h-8 mx-auto mb-4 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                />
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Ready to Experience MediMate?
          </h2>
          <p className={`text-xl mb-12 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Start your professional medical consultation today with our advanced AI physician.
          </p>
          <Link
              to={"/login"}
            className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
            }`}
          >
            Launch MediMate
          </Link>
        </div>
      </section>
      <FooterCompo/>
    </div>
  )
}

export default AboutUs
