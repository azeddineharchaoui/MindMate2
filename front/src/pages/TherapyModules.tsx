"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Compass,
  Activity
} from "lucide-react"
import { getTherapyModules } from "@/lib/api"

interface TherapyModule {
  name: string;
  techniques: string[];
  description: string;
  prompt_addition?: string;
}

interface TherapyModulesResponse {
  modules: Record<string, TherapyModule>;
  default: string;
}

const TherapyModulesPage = () => {
  const { theme } = useTheme()
  const [modules, setModules] = useState<Record<string, TherapyModule>>({})
  const [defaultModule, setDefaultModule] = useState<string>("")
  const [activeModule, setActiveModule] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fallback modules for when API fails
  const fallbackModules = {
    modules: {
      "cbt": {
        name: "Cognitive Behavioral Therapy",
        techniques: ["Thought Records", "Behavioral Activation", "Cognitive Restructuring"],
        description: "A psychosocial intervention that aims to improve mental health by challenging and changing cognitive distortions."
      },
      "mindfulness": {
        name: "Mindfulness-Based Therapy",
        techniques: ["Body Scan", "Mindful Breathing", "Present Moment Awareness"],
        description: "Therapy that uses mindfulness practices to help individuals develop awareness and acceptance of present-moment experiences."
      },
      "dbt": {
        name: "Dialectical Behavior Therapy",
        techniques: ["Distress Tolerance", "Emotional Regulation", "Interpersonal Effectiveness"],
        description: "A modified type of cognitive behavioral therapy that focuses on managing emotions and improving relationships."
      }
    },
    default: "cbt"
  };

  useEffect(() => {
    loadTherapyModules()
  }, [])
  
  const loadTherapyModules = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching therapy modules...');
      
      try {
        const response = await getTherapyModules();
        console.log('Therapy modules response:', response);
        
        if (response && response.modules) {
          setModules(response.modules);
          setDefaultModule(response.default || Object.keys(response.modules)[0] || "");
          setActiveModule(response.default || Object.keys(response.modules)[0] || "");
        } else {
          console.log('Using fallback therapy modules (empty response)');
          setModules(fallbackModules.modules);
          setDefaultModule(fallbackModules.default);
          setActiveModule(fallbackModules.default);
        }
      } catch (apiError) {
        console.error('API error fetching therapy modules:', apiError);
        console.log('Using fallback therapy modules (API error)');
        setModules(fallbackModules.modules);
        setDefaultModule(fallbackModules.default);
        setActiveModule(fallbackModules.default);
      }
    } catch (err: any) {
      console.error('Error loading therapy modules:', err);
      setError(err.message || "Failed to load therapy modules")
      
      // Fallback modules for testing
      const localFallbackModules = {
        "cbt": {
          "name": "Cognitive Behavioral Therapy",
          "techniques": ["thought_records", "behavioral_activation", "cognitive_restructuring"],
          "description": "Identify and change negative thought patterns",
          "prompt_addition": "CBT APPROACH: Help identify cognitive distortions and use Socratic questioning"
        },
        "mindfulness": {
          "name": "Mindfulness-Based Therapy",
          "techniques": ["breathing_exercises", "body_scan", "present_moment_awareness"],
          "description": "Cultivate present-moment awareness",
          "prompt_addition": "MINDFULNESS APPROACH: Guide attention to present-moment experience"
        }
      };
      
      setModules(localFallbackModules);
      setDefaultModule("cbt");
      setActiveModule("cbt");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
    }`}>
      <HeaderCompo />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <Brain className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Therapy Approaches</h1>
          <p className="text-lg opacity-80 max-w-3xl mx-auto">
            Explore different therapeutic approaches used in MindMate to help address your specific needs
          </p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading therapeutic approaches...</p>
            </div>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-lg flex items-center gap-3 ${theme === "dark" ? "bg-red-900/50 text-red-200" : "bg-red-50 text-red-800"}`}>
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Modules Navigation */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {Object.keys(modules).map(moduleKey => (
                <Button
                  key={moduleKey}
                  variant={moduleKey === activeModule ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    moduleKey === activeModule
                      ? theme === "dark" 
                        ? "bg-blue-600" 
                        : "bg-blue-500"
                      : ""
                  }`}
                  onClick={() => setActiveModule(moduleKey)}
                >
                  {moduleKey === defaultModule && <CheckCircle className="h-4 w-4" />}
                  {modules[moduleKey].name.split(" ")[0]}
                </Button>
              ))}
            </div>
            
            {/* Active Module Content */}
            {activeModule && modules[activeModule] && (
              <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl">
                        {modules[activeModule].name}
                        {activeModule === defaultModule && (
                          <Badge className="ml-2 bg-blue-500 text-white">Default</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {modules[activeModule].description}
                      </CardDescription>
                    </div>
                    <div className={`p-3 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}>
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h3 className={`font-medium mb-3 ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>
                      Key Techniques
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modules[activeModule].techniques.map((technique, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg flex items-center gap-3 ${
                            theme === "dark" ? "bg-gray-700" : "bg-blue-50"
                          }`}
                        >
                          <Compass className={`h-5 w-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                          <span>{technique.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`font-medium mb-3 ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>
                      Approach Description
                    </h3>
                    <p className="leading-relaxed">
                      {modules[activeModule].prompt_addition?.replace('APPROACH: ', '') || 
                        "This approach focuses on helping you understand and change the patterns of thinking and behavior that may be contributing to your difficulties."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TherapyModulesPage
