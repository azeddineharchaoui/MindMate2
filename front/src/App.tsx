import { Routes, Route } from 'react-router-dom';
import AboutUs from "@/pages/AboutUs";
import HomePage from "@/pages/Home";
import EnhancedHome from "@/pages/EnhancedHome";

import { ThemeProvider } from "./components/ThemeContext"
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css"
import AuthPage from "@/pages/AuthPage"
import ChatPage from "@/pages/Chat";
import EnhancedChat from "@/pages/EnhancedChat";
import ServicesPage from "@/pages/Services";
import ProfilePage from '@/pages/ProfilePage';
import UserProfile from '@/pages/UserProfile';
import MedicalRecordForm from '@/pages/components/MedicalRecordForm';
import Dashboard from '@/pages/Dashboard';
import CrisisAssessment from '@/pages/CrisisAssessment';
import MoodTracking from '@/pages/MoodTracking';
import ResourceSearch from '@/pages/ResourceSearch';
import TherapyModules from '@/pages/TherapyModules';
import TestPage from '@/pages/Test';
import AudioTranscription from '@/pages/AudioTranscription';
import SessionExport from '@/pages/SessionExport';

function App() {
    return (
        <ThemeProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<EnhancedHome />} />
                <Route path="/home-original" element={<HomePage />} />
                <Route path="/Aboutus" element={<AboutUs/>} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/test" element={<TestPage />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/chat-enhanced" element={<ProtectedRoute><EnhancedChat /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/crisis-assessment" element={<ProtectedRoute><CrisisAssessment /></ProtectedRoute>} />
                <Route path="/mood-tracking" element={<ProtectedRoute><MoodTracking /></ProtectedRoute>} />
                <Route path="/resources" element={<ProtectedRoute><ResourceSearch /></ProtectedRoute>} />
                <Route path="/therapy-modules" element={<ProtectedRoute><TherapyModules /></ProtectedRoute>} />
                <Route path="/audio-transcription" element={<ProtectedRoute><AudioTranscription /></ProtectedRoute>} />
                <Route path="/session-export" element={<ProtectedRoute><SessionExport /></ProtectedRoute>} />
                <Route path="/dossier-medical" element={<ProtectedRoute><MedicalRecordForm/></ProtectedRoute>} />
            </Routes>
        </ThemeProvider>

    );
}

export default App;