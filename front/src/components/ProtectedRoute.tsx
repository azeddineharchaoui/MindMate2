"use client"
/**
 * ProtectedRoute Component
 * 
 * Important: The backend uses secrets.token_urlsafe(48) for authentication tokens,
 * which produces a URL-safe base64 encoded string (not a JWT).
 * Token validation here checks for existence and minimum length rather than JWT format.
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that protects routes requiring authentication.
 * If user is not logged in (no token), redirects to login page.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('mindmate_token');
    const userId = localStorage.getItem('mindmate_user_id');
    
    // Basic validation - token must exist and user ID must exist
    const basicValidation = !!token && !!userId;
    
    // Check if the token is in a valid format
    // The backend uses secrets.token_urlsafe(48) which generates a URL-safe base64 string
    // So we just need to check if the token exists and has a reasonable length
    let hasValidFormat = false;
    if (token) {
      // URL-safe base64 tokens should be reasonably long
      hasValidFormat = token.length >= 32;
    }
    
    if (basicValidation && hasValidFormat) {
      // Store a timestamp for when we validated auth to avoid repeated checks
      localStorage.setItem('mindmate_auth_checked', Date.now().toString());
      setIsAuthenticated(true);
    } else {
      // If validation failed, clear any invalid tokens
      if (!hasValidFormat && token) {
        console.warn('Invalid token format detected (token too short), clearing authentication');
        localStorage.removeItem('mindmate_token');
      }
      setIsAuthenticated(false);
    }
  }, []);

  // Initial loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
