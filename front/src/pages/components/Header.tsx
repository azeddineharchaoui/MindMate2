import { Button } from "@/components/ui/button"
import { 
    Heart, 
    Phone, 
    Mail, 
    MapPin, 
    Facebook, 
    Twitter, 
    Instagram, 
    Linkedin,
    Menu,
    X,
    BarChart3,
    MessageCircle,
    Shield,
    Brain,
    BookOpen,
    User,
    Activity,
    Compass
} from 'lucide-react'
import { Link } from 'react-router-dom';
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeContext";
import { useState } from 'react';

export default function HeaderCompo() {
    const { theme } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

    return (
        <div className={`transition-all duration-500 ease-in-out ${
            theme === "dark"
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
                : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
        }`}>

            {/* Header */}
            <header className={`border-b shadow-sm ${
                theme === "dark" 
                    ? "bg-gray-800 border-gray-700" 
                    : "bg-white border-blue-100"
            }`}>
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-xl font-bold ${theme === "dark" ? "text-blue-300" : "text-blue-900"}`}>
                                    MindMate
                                </span>
                                <span className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                                    Psychological Support
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            <Link 
                                to="/dashboard" 
                                className={`hover:text-blue-600 font-medium transition-colors flex items-center gap-2 ${
                                    theme === "dark" ? "text-gray-300 hover:text-blue-400" : "text-gray-700"
                                }`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link 
                                to="/chat-enhanced" 
                                className={`hover:text-blue-600 font-medium transition-colors flex items-center gap-2 ${
                                    theme === "dark" ? "text-gray-300 hover:text-blue-400" : "text-gray-700"
                                }`}
                            >
                                <MessageCircle className="h-4 w-4" />
                                Chat
                            </Link>
                            <Link 
                                to="/mood-tracking" 
                                className={`hover:text-blue-600 font-medium transition-colors flex items-center gap-2 ${
                                    theme === "dark" ? "text-gray-300 hover:text-blue-400" : "text-gray-700"
                                }`}
                            >
                                <Activity className="h-4 w-4" />
                                Mood
                            </Link>
                            <Link 
                                to="/crisis-assessment" 
                                className={`hover:text-red-600 font-medium transition-colors flex items-center gap-2 ${
                                    theme === "dark" ? "text-gray-300 hover:text-red-400" : "text-gray-700"
                                }`}
                            >
                                <Shield className="h-4 w-4" />
                                Crisis
                            </Link>
                            <Link 
                                to="/resources" 
                                className={`hover:text-blue-600 font-medium transition-colors flex items-center gap-2 ${
                                    theme === "dark" ? "text-gray-300 hover:text-blue-400" : "text-gray-700"
                                }`}
                            >
                                <BookOpen className="h-4 w-4" />
                                Resources
                            </Link>
                            <Link 
                                to="/therapy-modules" 
                                className={`hover:text-blue-600 font-medium transition-colors flex items-center gap-2 ${
                                    theme === "dark" ? "text-gray-300 hover:text-blue-400" : "text-gray-700"
                                }`}
                            >
                                <Compass className="h-4 w-4" />
                                Therapy
                            </Link>
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center space-x-3">
                            <Link to="/user-profile">
                                <Button
                                    variant="outline"
                                    className={`border-blue-200 hover:bg-blue-50 ${
                                        theme === "dark" 
                                            ? "bg-gray-700 text-blue-300 border-gray-600 hover:bg-gray-600" 
                                            : "bg-white text-blue-600 hover:text-blue-700"
                                    }`}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Profile
                                </Button>
                            </Link>
                            <ThemeToggle />
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center space-x-2">
                            <ThemeToggle />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleMobileMenu}
                                className={theme === "dark" ? "border-gray-600" : ""}
                            >
                                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className={`md:hidden py-4 border-t ${
                            theme === "dark" ? "border-gray-700" : "border-gray-200"
                        }`}>
                            <nav className="flex flex-col space-y-3">
                                <Link 
                                    to="/dashboard" 
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        theme === "dark" 
                                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" 
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <Link 
                                    to="/chat-enhanced" 
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        theme === "dark" 
                                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" 
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Chat Support
                                </Link>
                                <Link 
                                    to="/mood-tracking" 
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        theme === "dark" 
                                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" 
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Activity className="h-4 w-4" />
                                    Mood Tracking
                                </Link>
                                <Link 
                                    to="/crisis-assessment" 
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        theme === "dark" 
                                            ? "text-gray-300 hover:bg-gray-700 hover:text-red-400" 
                                            : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Shield className="h-4 w-4" />
                                    Crisis Assessment
                                </Link>
                                <Link 
                                    to="/resources" 
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        theme === "dark" 
                                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" 
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Resources
                                </Link>
                                <Link 
                                    to="/user-profile" 
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        theme === "dark" 
                                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" 
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>
            </header>
        </div>
    )
}