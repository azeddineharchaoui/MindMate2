// api.ts
"use client"

import axios, { AxiosResponse, AxiosRequestConfig } from "axios"

// Configure your backend URL here
// For local development: "http://localhost:5000"
// For hosted backend: use the ngrok URL from the backend
const isDev = import.meta.env.DEV;
// Always use explicit URLs instead of empty string to avoid CORS issues
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://60b8eae95df1.ngrok-free.app";

// Configure Axios defaults for better CORS handling
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for CORS headers
api.interceptors.request.use((config) => {
  // Ensure headers are defined
  config.headers = config.headers || {};
  
  // Add cache control headers
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';
  
  // For FormData requests, let the browser set the Content-Type
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML instead of JSON
    const contentType = response.headers['content-type'] || '';
    
    // Special handling for HTML responses which are likely ngrok authorization pages
    if (contentType.includes('text/html') && 
        !contentType.includes('application/json') && 
        response.data && 
        typeof response.data === 'string' && 
        (response.data.includes('ngrok') || response.data.includes('tunnel'))) {
      
      console.warn('Received HTML response from API - likely ngrok authorization page');
      
      // Update ngrok auth state
      setNgrokAuthState(false);
      
      // For API endpoints, we can create a modified error response
      if (response.config.url?.includes('/api/')) {
        // Create a proper error with custom code
        const error = new Error('Ngrok authorization required');
        return Promise.reject(Object.assign(error, {
          response: {
            status: 499, // Custom status code for ngrok auth required
            data: {
              error: 'ngrok_auth_required',
              message: 'Ngrok tunnel requires authorization. Please visit the ngrok URL directly in a new tab to authorize.',
              ngrokUrl: API_BASE_URL
            }
          },
          isNgrokAuthError: true
        }));
      }
    }
    
    // Mark successful JSON responses
    if (contentType.includes('application/json')) {
      localStorage.setItem('mindmate_api_success_time', Date.now().toString());
      setNgrokAuthState(true);
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized request:', error);
    } else if (error.response?.status === 400) {
      // Handle bad request
      console.error('Bad request:', error);
    }
    return Promise.reject(error);
  }
);

// Track ngrok tunnel authorization state using localStorage for persistence across page loads
// Global var to track ngrok authorization state
let ngrokAuthorized: boolean;

const getNgrokAuthState = (): boolean => {
  const state = localStorage.getItem('mindmate_ngrok_authorized');
  // Also check if we have a successful API request timestamp
  const lastSuccessTime = parseInt(localStorage.getItem('mindmate_api_success_time') || '0');
  const now = Date.now();
  
  // If we've had a successful API call in the last 30 minutes, consider ngrok authorized
  if (lastSuccessTime > 0 && now - lastSuccessTime < 30 * 60 * 1000) {
    return true;
  }
  
  return state === 'true';
};

const setNgrokAuthState = (state: boolean): void => {
  localStorage.setItem('mindmate_ngrok_authorized', state ? 'true' : 'false');
  localStorage.setItem('mindmate_ngrok_auth_time', Date.now().toString());
  
  // If setting to true, also set a success timestamp
  if (state) {
    localStorage.setItem('mindmate_api_success_time', Date.now().toString());
  }
  
  ngrokAuthorized = state;
};

// Initialize the global variable
ngrokAuthorized = getNgrokAuthState();

// Record a successful API call to indicate ngrok is authorized
const recordSuccessfulApiCall = (): void => {
  localStorage.setItem('mindmate_api_success_time', Date.now().toString());
  
  // Also mark ngrok as authorized if we're using ngrok
  if (API_BASE_URL.includes('ngrok')) {
    setNgrokAuthState(true);
  }
};

ngrokAuthorized = getNgrokAuthState();
let ngrokAuthorizing = false;
let lastNgrokAuthAttempt = parseInt(localStorage.getItem('mindmate_ngrok_auth_time') || '0');

// Helper function to authorize ngrok tunnel
export const authorizeNgrok = async (): Promise<boolean> => {
  // Avoid multiple simultaneous auth attempts
  if (ngrokAuthorizing) {
    console.log("Ngrok authorization already in progress, skipping");
    return false;
  }
  
  // Don't try to authorize too frequently
  const now = Date.now();
  if (now - lastNgrokAuthAttempt < 5000) {
    console.log("Skipping ngrok auth - too soon since last attempt");
    return false;
  }
  
  // Only needed for ngrok URLs
  if (!API_BASE_URL.includes('ngrok')) {
    console.log("Not a ngrok URL, no authorization needed");
    return true;
  }

  // Check if we have a pre-authorization flag set by the script
  const preAuthorized = localStorage.getItem('mindmate_no_iframe_auth') === 'true';
  if (preAuthorized) {
    console.log("Using pre-authorized ngrok configuration");
    // Make sure we have the auth time and success time set
    if (!localStorage.getItem('mindmate_ngrok_auth_time')) {
      localStorage.setItem('mindmate_ngrok_auth_time', now.toString());
    }
    if (!localStorage.getItem('mindmate_api_success_time')) {
      localStorage.setItem('mindmate_api_success_time', now.toString());
    }
    setNgrokAuthState(true);
    return true;
  }
  
  // Get the latest state from storage
  ngrokAuthorized = getNgrokAuthState();
  
  // If we've had a successful API call in the last 10 minutes, consider ngrok authorized
  const lastSuccessTime = parseInt(localStorage.getItem('mindmate_api_success_time') || '0');
  if (lastSuccessTime > 0 && now - lastSuccessTime < 10 * 60 * 1000) {
    console.log(`Last successful API call was ${Math.round((now - lastSuccessTime)/1000)} seconds ago - ngrok considered authorized`);
    setNgrokAuthState(true);
    return true;
  }
  
  // Already authorized (and not expired)
  if (ngrokAuthorized) {
    const authTime = parseInt(localStorage.getItem('mindmate_ngrok_auth_time') || '0');
    const authAge = now - authTime;
    
    if (authAge < 15 * 60 * 1000) { // 15 minutes
      console.log(`Using existing ngrok authorization (${Math.round(authAge/1000/60)} minutes old)`);
      return true;
    } else {
      console.log(`Ngrok authorization expired (${Math.round(authAge/1000/60)} minutes old), reauthorizing`);
    }
  }
  
  try {
    ngrokAuthorizing = true;
    lastNgrokAuthAttempt = now;
    console.log("Attempting to pre-authorize ngrok tunnel...");
    
    // Extract the ngrok domain from the URL for direct access
    const ngrokUrlMatch = API_BASE_URL.match(/https?:\/\/([^\/]+)/);
    const ngrokDomain = ngrokUrlMatch ? ngrokUrlMatch[1] : null;
    
    if (!ngrokDomain) {
      console.error("Could not extract ngrok domain from URL");
      return false;
    }
    
    // Store the domain for manual authorization
    localStorage.setItem('mindmate_ngrok_domain', ngrokDomain);
    
    // Show manual authorization instructions using a modal dialog
    const manualAuthResult = await showManualAuthDialog(ngrokDomain);
    
    if (manualAuthResult) {
      console.log("User confirmed manual authorization, testing connection...");
      
      // Test if the authorization worked by making a simple API call
      const testResponse = await fetch(`${API_BASE_URL}/api/status?test=true&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        mode: 'cors'
      });
      
      // Check if we got a valid response
      if (testResponse.ok) {
        try {
          const contentType = testResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            // Successfully got a JSON response, mark as authorized
            console.log("Manual authorization successful!");
            setNgrokAuthState(true);
            recordSuccessfulApiCall();
            return true;
          }
        } catch (e) {
          console.warn("Error parsing test response:", e);
        }
      }
      
      console.warn("Manual authorization check failed, but continuing with user confirmation");
      // Even if our test failed, trust the user that they authorized it
      setNgrokAuthState(true);
      return true;
    }
    
    console.warn("Manual authorization cancelled or failed");
    return false;
  } catch (err) {
    console.warn("Failed to pre-authorize ngrok:", err);
    ngrokAuthorizing = false;
    return false;
  } finally {
    ngrokAuthorizing = false;
  }
};

// Helper function to show a dialog for manual ngrok authorization
const showManualAuthDialog = async (ngrokDomain: string): Promise<boolean> => {
  // Check if we already have an auth dialog element
  let dialogContainer = document.getElementById('ngrok-auth-dialog-container');
  
  if (!dialogContainer) {
    // Create dialog container
    dialogContainer = document.createElement('div');
    dialogContainer.id = 'ngrok-auth-dialog-container';
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.top = '0';
    dialogContainer.style.left = '0';
    dialogContainer.style.right = '0';
    dialogContainer.style.bottom = '0';
    dialogContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
    dialogContainer.style.display = 'flex';
    dialogContainer.style.alignItems = 'center';
    dialogContainer.style.justifyContent = 'center';
    dialogContainer.style.zIndex = '10000';
    dialogContainer.style.fontFamily = 'Arial, sans-serif';
    
    const dialogBox = document.createElement('div');
    dialogBox.style.backgroundColor = '#fff';
    dialogBox.style.borderRadius = '8px';
    dialogBox.style.padding = '20px';
    dialogBox.style.maxWidth = '500px';
    dialogBox.style.width = '90%';
    dialogBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    
    const title = document.createElement('h2');
    title.textContent = 'Ngrok Authorization Required';
    title.style.color = '#333';
    title.style.marginTop = '0';
    
    const message = document.createElement('p');
    message.innerHTML = `
      The MindMate backend is running behind an ngrok tunnel that requires authorization.<br><br>
      <b>Please follow these steps:</b><br>
      1. <a href="https://${ngrokDomain}" target="_blank" style="color: #4a90e2; font-weight: bold;">Click here to open ngrok in a new tab</a><br>
      2. Click the "Visit Site" button on the ngrok page<br>
      3. Return to this tab and click "I've Authorized" below
    `;
    message.style.lineHeight = '1.5';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.gap = '10px';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.border = '1px solid #ddd';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.backgroundColor = '#f5f5f5';
    cancelButton.style.cursor = 'pointer';
    
    const confirmButton = document.createElement('button');
    confirmButton.textContent = "I've Authorized";
    confirmButton.style.padding = '8px 16px';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '4px';
    confirmButton.style.backgroundColor = '#4a90e2';
    confirmButton.style.color = '#fff';
    confirmButton.style.cursor = 'pointer';
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    
    dialogBox.appendChild(title);
    dialogBox.appendChild(message);
    dialogBox.appendChild(buttonContainer);
    
    dialogContainer.appendChild(dialogBox);
    document.body.appendChild(dialogContainer);
    
    // Create a promise that resolves when the user takes action
    return new Promise<boolean>((resolve) => {
      cancelButton.onclick = () => {
        // remove dialog if present
        dialogContainer?.remove();
        resolve(false);
      };
      
      confirmButton.onclick = () => {
        // remove dialog if present
        dialogContainer?.remove();
        resolve(true);
      };
    });
  } else {
    // Dialog already exists, return a resolved promise
    return Promise.resolve(false);
  }
};
// Check if backend is available
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    // First, check if we've had a successful API call in the last 5 minutes
    const lastSuccessTime = parseInt(localStorage.getItem('mindmate_api_success_time') || '0');
    const now = Date.now();
    
    if (lastSuccessTime > 0 && now - lastSuccessTime < 5 * 60 * 1000) { // 5 minutes
      console.log(`Last successful API call was ${Math.round((now - lastSuccessTime)/1000)} seconds ago - API considered connected`);
      return true;
    }
    
    // If this is a ngrok URL, check if we're already authorized
    if (API_BASE_URL.includes('ngrok')) {
      const isAuthorized = getNgrokAuthState();
      const authTime = parseInt(localStorage.getItem('mindmate_ngrok_auth_time') || '0');
      const authAge = now - authTime;
      
      // If we're not authorized or auth is old, try to authorize first
      if (!isAuthorized || authAge > 5 * 60 * 1000) { // 5 minutes
        console.log("Authorizing ngrok before API connection check");
        const authResult = await authorizeNgrok();
        
        if (!authResult) {
          console.warn("Failed to authorize ngrok, API connection will likely fail");
          // Continue anyway to give it a chance
        }
      }
    }
    
    // Set up a timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout further
    
    // First try with fetch and no-cors mode to warm up the connection
    try {
      await fetch(`${API_BASE_URL}/api/status?warm=true&t=${Date.now()}`, { 
        method: 'GET', 
        mode: 'no-cors',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      // Wait a bit for the connection to be established
      await new Promise(r => setTimeout(r, 800)); // Longer wait for better reliability
    } catch (e) {
      // Ignore errors from no-cors mode
      console.log("No-cors pre-warming attempt complete");
    }

    // Now use the actual CORS request with the proper headers and cache busting
    const cacheBuster = Date.now();
    let retries = 0;
    const maxRetries = 2;
    let response;
    
    while (retries <= maxRetries) {
      try {
        console.log(`API connection check attempt ${retries + 1}/${maxRetries + 1}`);
        response = await fetch(`${API_BASE_URL}/api/status?check=true&t=${cacheBuster}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Accept': 'application/json'
          },
          signal: controller.signal,
          mode: 'cors'
        });
        
        // If we got a response, break out of retry loop
        break;
      } catch (e) {
        if (retries >= maxRetries) {
          throw e; // Rethrow on final attempt
        }
        retries++;
        // Wait before retry
        await new Promise(r => setTimeout(r, 1000));
      }    }

    clearTimeout(timeoutId);
    
    // Check if we got a valid response
    if (!response) {
      console.warn("API connection check failed - no response received");
      return false;
    }
    
    // For better validation, check both content type and content
    const contentType = response.headers.get('content-type');
    const isJsonContentType = contentType && contentType.includes('application/json');
    
    if (!isJsonContentType) {
      console.warn("API returned non-JSON content type:", contentType);
      // Even if content-type is wrong, still try to parse the body
      // as some servers might send incorrect content types
    }
    
    // Try to parse response body
    try {
      // Get the response text first to check for HTML
      const responseText = await response.clone().text();
      
      // Check if response contains HTML markers
      if (responseText.includes('<!DOCTYPE html>') || 
          responseText.includes('<html') || 
          (responseText.includes('ngrok') && responseText.includes('tunnel'))) {
        console.warn("API returned HTML content instead of JSON");
        return false;
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.warn("API response is not valid JSON:", parseError);
        return false;
      }
      
      // If the response contains ngrok auth required, we're not properly connected
      if (data && data.ngrok_auth_required === true) {
        console.warn("API returns ngrok auth required response");
        return false;
      }
      
      // Update ngrok auth state and record successful API call
      if (response.status === 200 && data && data.is_valid_json === true) {
        recordSuccessfulApiCall();
        return true;
      }
      
      // JSON parsed but might not be a proper API response
      return response.status === 200;
    } catch (e) {
      // Not JSON, might be HTML or other content
      console.warn("API connection check returned non-JSON response:", e);
      return false;
    }
  } catch (error) {
    console.warn("API connection check failed:", error);
    return false;
  }
};

// Cache object to store responses
const responseCache: Record<string, {data: any, timestamp: number}> = {};

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindmate_token');
  if (token) {
    // Add Bearer token to Authorization header
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error("API Request error:", error);
  return Promise.reject(error);
});

// Define an interface for our enhanced Axios response
interface EnhancedAxiosResponse<T = any> extends Omit<AxiosResponse<T>, 'config'> {
  config: AxiosRequestConfig;
  fromCache?: boolean;
  cacheTimestamp?: number;
}

// Add response interceptor for better error logging and CORS handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if we got HTML instead of JSON OR if we got a JSON response indicating ngrok auth needed
    const isHtmlResponse = response.status === 200 && 
        typeof response.data === 'string' &&
        (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html'));
        
    const isNgrokAuthResponse = response.data && 
        typeof response.data === 'object' && 
        response.data.ngrok_auth_required === true;
    
    if (isHtmlResponse || isNgrokAuthResponse) {
      const url = response.config.url || '';
      
      if (isHtmlResponse) {
        console.warn(`Received HTML instead of JSON for ${url}, likely ngrok confirmation page`);
      } else if (isNgrokAuthResponse) {
        console.warn(`Received ngrok auth required response from server for ${url}`);
      }
      
      // Mark ngrok as not authorized
      setNgrokAuthState(false);
      
      // Try to authorize ngrok tunnel for future requests
      if (API_BASE_URL.includes('ngrok')) {
        // Don't wait for this to complete - just initiate it
        authorizeNgrok().catch(err => console.warn('Ngrok authorization failed in interceptor:', err));
      }
      
      // Check if we have cached data for this URL
      const cachedResponse = responseCache[url];
      if (cachedResponse && Date.now() - cachedResponse.timestamp < 3600000) { // 1 hour cache
        console.log(`Returning cached data for ${url} due to HTML/ngrok auth response`);
        
        // Modify the response object to use cached data
        response.data = cachedResponse.data;
        
        // Add flags to indicate this is from cache
        (response as any).fromCache = true;
        (response as any).cacheTimestamp = cachedResponse.timestamp;
        (response as any).wasHtmlResponse = isHtmlResponse;
        (response as any).wasNgrokAuthResponse = isNgrokAuthResponse;
      }
    }
    
    // Cache successful GET responses for fallback
    if (response.config.method?.toLowerCase() === 'get') {
      const url = response.config.url || '';
      
      // Only cache if it's a valid JSON response (not HTML or ngrok auth required)
      const isHtmlResponse = typeof response.data === 'string' && 
          (response.data.includes('<html') || response.data.includes('<!DOCTYPE'));
      
      const isNgrokAuthResponse = response.data && 
          typeof response.data === 'object' && 
          response.data.ngrok_auth_required === true;
      
      // Cache only valid responses
      if (!isHtmlResponse && !isNgrokAuthResponse) {
        responseCache[url] = {
          data: response.data,
          timestamp: Date.now()
        };
        
        // Update ngrok auth state if this was a successful API call through ngrok
        if (API_BASE_URL.includes('ngrok') && !isHtmlResponse && !isNgrokAuthResponse) {
          setNgrokAuthState(true);
        }
        
        // Store the cache time in localStorage for specific endpoints
        try {
          if (url.includes('/api/user/profile')) {
            localStorage.setItem('mindmate_profile_cache_time', Date.now().toString());
          } else if (url.includes('/api/therapy/modules')) {
            localStorage.setItem('mindmate_modules_cache_time', Date.now().toString());
          }
        } catch (e) {
          console.warn("Could not store cache timestamp:", e);
        }
      }
    }
    
    return response;
  },
  error => {
    // Log detailed error info to help with debugging
    if (error.response) {
      // Server responded with an error status
      console.error("API Response error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
      
      // Check if response contains HTML (likely ngrok error page or non-JSON)
      const contentType = error.response.headers?.['content-type'] || '';
      if (contentType.includes('text/html') || 
          (typeof error.response.data === 'string' && 
           (error.response.data.includes('<!DOCTYPE html>') || error.response.data.includes('<html')))) {
        console.warn("Received HTML response instead of JSON. Likely an ngrok error page.");
        
        // Check if we have cached data for this URL
        const url = error.config?.url || '';
        const cachedResponse = responseCache[url];
        
        if (cachedResponse && Date.now() - cachedResponse.timestamp < 3600000) { // 1 hour cache
          console.log("Using cached data for", url);
          // Return cached data with a flag indicating it's from cache
          const enhancedResponse: EnhancedAxiosResponse = {
            ...error.response,
            data: cachedResponse.data,
            status: 200,
            fromCache: true,
            cacheTimestamp: cachedResponse.timestamp
          };
          return Promise.resolve(enhancedResponse);
        }
      }
    } else if (error.request) {
      // Request was made but no response received - could be CORS or network
      console.error("API Request made but no response:", {
        message: error.message,
        url: error.config?.url,
        request: error.request
      });
      
      // Check if we have cached data for this URL
      const url = error.config?.url || '';
      const cachedResponse = responseCache[url];
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < 3600000) { // 1 hour cache
        console.log("Using cached data for", url, "due to network error");
        // Return cached data with a flag indicating it's from cache
        const enhancedResponse: EnhancedAxiosResponse = {
          data: cachedResponse.data,
          status: 200,
          statusText: 'OK (from cache)',
          headers: {},
          config: error.config || {},
          fromCache: true,
          cacheTimestamp: cachedResponse.timestamp
        };
        return Promise.resolve(enhancedResponse);
      }
      
      // Check for CORS errors (not always detectable precisely)
      if (error.message && error.message.includes("Network Error")) {
        console.warn("Possible CORS error detected. Make sure the API server allows requests from this origin.");
      }
    } else {
      // Something happened in setting up the request
      console.error("API Request setup error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export interface BackendStatus {
  status: string
  model: string
  whisper_loaded: boolean
  features: {
    mood_tracking: boolean
    crisis_detection: boolean
    goal_tracking: boolean
    personalization: boolean
  }
}

// Enhanced interfaces for new API endpoints
export interface UserProfile {
  user_id: string
  therapy_preferences: {
    preferred_approach: string
    communication_style: string
    goals: string[]
  }
  session_stats: {
    total_sessions: number
    last_session: string
    mood_improvements: number
  }
  mood_trends: {
    trend: string
    average_mood: number
    insights: string[]
  }
}

export interface CrisisAssessment {
  risk_assessment: {
    risk_level: string
    confidence_score: number
    risk_factors: string[]
    recommendations: string[]
  }
  detected_symptoms: {
    symptoms: string[]
    dominant_emotion: string
    emotional_intensity: string
  }
  recommended_actions: string[]
  crisis_resources: any[]
  immediate_interventions: Array<{
    technique: string
    description: string
  }>
}

export interface SymptomAnalysis {
  analysis: {
    symptoms: string[]
    dominant_emotion: string
    emotional_intensity: string
    risk_factors: string[]
  }
  therapeutic_recommendations: any[]
  suggested_approaches: Array<{
    approach: string
    rationale: string
  }>
  monitoring_suggestions: string[]
}

export interface SessionData {
  session_id: string
  user_id: string
  created_at: string
}

export interface MoodEntry {
  user_id: string
  mood_score: number
  emotions: string[]
  notes: string
}

export interface ResourceSearch {
  query: string
  category?: string
  limit?: number
}

export interface KnowledgeResource {
  content: string
  category: string
  type: string
  source: string
}

export interface TherapyModules {
  modules: Record<string, any>
  default: string
}

// Keep a simple request type for clarity
export interface ChatRequest {
  message?: string
  audioFile?: Blob
  user_id?: string
  session_id?: string
  // History format matches backend: [ [user, ai], [user, ai] ]
  history?: [string, string][] 
  patient_type?: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: () => void
  onError: (error: string) => void
}

export interface ExportRequest {
  history: [string, string][]
  patient_type: string
  is_emergency: boolean
}

export async function checkBackendStatus(): Promise<BackendStatus> {
  // Define fallback status
  const fallbackStatus: BackendStatus = {
    status: "offline",
    model: "fallback",
    whisper_loaded: false,
    features: {
      mood_tracking: true,
      crisis_detection: true,
      goal_tracking: true,
      personalization: true
    }
  };
  
  try {
    // Try to authorize ngrok first if needed
    if (API_BASE_URL.includes('ngrok')) {
      await authorizeNgrok();
    }
    
    // Check if we have cached status
    const cachedStatus = localStorage.getItem('mindmate_status_cache');
    let cachedStatusData: BackendStatus | null = null;
    
    if (cachedStatus) {
      try {
        cachedStatusData = JSON.parse(cachedStatus);
      } catch (e) {
        console.warn("Failed to parse cached status:", e);
      }
    }
    
    // Make API call
    const response = await api.get("/api/status", { timeout: 5000 });
    
    // Check if we're getting HTML content (likely ngrok)
    if (typeof response.data === 'string' && 
        (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html'))) {
      console.warn('Received HTML instead of JSON from backend status endpoint, likely ngrok confirmation page');
      
      // Try to authorize the ngrok tunnel again
      authorizeNgrok().catch(err => console.warn("Ngrok auth failed:", err));
      
      // Return cached status if available
      if (cachedStatusData) {
        return cachedStatusData;
      }
      
      // Return fallback status with ngrok-specific status
      return {
        ...fallbackStatus,
        status: "waiting_for_confirmation"
      };
    }
    
    // Cache the valid status response
    localStorage.setItem('mindmate_status_cache', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Error fetching backend status:', error);
    
    // Try to get cached status if available
    const cachedStatus = localStorage.getItem('mindmate_status_cache');
    if (cachedStatus) {
      try {
        return JSON.parse(cachedStatus);
      } catch (e) {
        console.warn("Failed to parse cached status:", e);
      }
    }
    
    // Return fallback on error
    return {
      status: "error",
      model: "fallback",
      whisper_loaded: false,
      features: {
        mood_tracking: true,
        crisis_detection: true,
        goal_tracking: true,
        personalization: true
      }
    };
  }
}

// ** Rewritten for streaming with Fetch API **
export async function streamChatCompletion(
    request: ChatRequest,
    callbacks: StreamCallbacks
): Promise<void> {
  // Determine if we're sending FormData or JSON
  const hasFiles = request.audioFile !== undefined;
  let body;
  let headers = {};
  
  if (hasFiles) {
    // Use FormData when we have files
    body = new FormData();
    if (request.message) {
      body.append("message", request.message);
    }
    if (request.audioFile) {
      body.append("audio_file", request.audioFile, "audio.wav");
    }
    if (request.user_id) {
      body.append("user_id", request.user_id);
    }
    if (request.session_id) {
      body.append("session_id", request.session_id);
    }
  } else {
    // Use JSON when we only have text data
    body = JSON.stringify({
      message: request.message,
      user_id: request.user_id,
      session_id: request.session_id,
      history: request.history
    });
    headers = {
      'Content-Type': 'application/json'
    };
  }

  const url = API_BASE_URL ? `${API_BASE_URL}/api/chat` : '/api/chat';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    // Start reading the stream
    let receivedMetadata = false;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        callbacks.onComplete();
        break;
      }

      // Convert bytes to text
      const text = new TextDecoder().decode(value);
      
      // Handle different line formats in the response
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          // Try to parse as JSON
          if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
            const jsonData = JSON.parse(line);
            
            // Check if it's a token object
            if (jsonData.token !== undefined) {
              // If we get an empty token with metadata, we've reached the end of content
              if (jsonData.token === '' && jsonData.metadata) {
                receivedMetadata = true;
                // Skip sending the empty token and metadata
                continue;
              }
              
              // Otherwise, send the token text to the client
              if (jsonData.token.trim() !== '') {
                callbacks.onToken(jsonData.token);
              }
            } else if (jsonData.metadata) {
              // If it's only metadata, skip it
              continue;
            } else {
              // Some other JSON object, pass it through as a string
              callbacks.onToken(JSON.stringify(jsonData));
            }
          } else {
            // Not JSON, just send as raw text if not empty
            if (line.trim() !== '') {
              callbacks.onToken(line);
            }
          }
        } catch (e) {
          // If parsing fails, just send the raw line
          if (line.trim() !== '') {
            callbacks.onToken(line);
          }
        }
      }
      
      // If we received the metadata, we're done
      if (receivedMetadata) {
        callbacks.onComplete();
        break;
      }
    }
  } catch (e) {
    console.error("Chat streaming error:", e);
    const err = e as Error;
    callbacks.onError(err.message || "An error occurred during chat streaming");
  }
}


export async function exportToPDF(request: ExportRequest): Promise<void> {
  try {
    const response = await api.post("/api/export/report", request, {
      responseType: "blob",
    })

    const blob = new Blob([response.data], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "")
    link.download = `MindMate_Consultation_${date}.pdf`

    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

  } catch (error: any) {
    // Try to parse the error blob
    if (error.response?.data instanceof Blob) {
      const errText = await error.response.data.text()
      try {
        const errJson = JSON.parse(errText)
        throw new Error(errJson.error || "Failed to export PDF")
      } catch {
        throw new Error("An unknown error occurred during PDF export.")
      }
    }
    throw new Error(error.response?.data?.error || "Failed to export PDF")
  }
}

// ========================
// NEW ENHANCED API FUNCTIONS
// ========================

// User Profile Management
export async function getUserProfile(userId?: string): Promise<UserProfile> {
  // Get token first to check if we're authenticated
  const token = localStorage.getItem('mindmate_token');
  if (!token) {
    console.warn("No auth token available for getUserProfile");
    // If no token, return fallback immediately without hitting the API
    return createFallbackUserProfile(userId || "guest");
  }
  
  // Check if we already have a cached profile before making the API call
  try {
    const cachedProfile = localStorage.getItem('mindmate_profile_cache');
    if (cachedProfile) {
      const profile = JSON.parse(cachedProfile);
      const cacheTime = localStorage.getItem('mindmate_profile_cache_time');
      const cacheAge = cacheTime ? (Date.now() - parseInt(cacheTime)) / 1000 : 999999;
      
      // Use cache if it exists and is less than 5 minutes old (during initial loading)
      if (cacheAge < 300 && profile?.user_id) {
        console.log(`Using cached profile (${cacheAge.toFixed(1)}s old) for initial rendering`);
        
        // Attempt to fetch a fresh profile in the background
        setTimeout(() => {
          fetchFreshUserProfile(userId).catch(e => {
            console.warn("Background profile refresh failed:", e);
          });
        }, 1000);
        
        return profile;
      }
    }
  } catch (e) {
    console.warn("Error reading profile cache:", e);
  }
  
  // Try to fetch a fresh profile
  return fetchFreshUserProfile(userId);
}

// Helper function to fetch fresh profile with error handling
async function fetchFreshUserProfile(userId?: string): Promise<UserProfile> {
  const token = localStorage.getItem('mindmate_token');
  if (!token) {
    console.warn("No auth token for fetchFreshUserProfile, using fallback");
    return createFallbackUserProfile(userId || "guest");
  }
  
  const params = userId ? { user_id: userId } : {};
  
  try {
    // Attempt to pre-authorize ngrok if needed
    if (API_BASE_URL.includes('ngrok') && !getNgrokAuthState()) {
      console.log("Pre-authorizing ngrok before profile fetch");
      await authorizeNgrok();
    }
    
    // First check if API is reachable to avoid long timeouts
    const isApiAvailable = await checkApiConnection();
    if (!isApiAvailable) {
      console.warn("API appears to be down, using cached profile if available");
      const cachedProfile = localStorage.getItem('mindmate_profile_cache');
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile);
          console.log("Using cached profile due to API being unreachable");
          return parsed;
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }
      console.warn("No valid cached profile, falling back to local profile");
      return createFallbackUserProfile(userId || "guest");
    }
    
    // Add explicit Authorization header to ensure token is sent properly
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',  // Explicitly request JSON response
      'Content-Type': 'application/json'
    };
    
    // Set a shorter timeout for profile fetch
    const response = await api.get("/api/user/profile", { 
      params,
      headers,
      timeout: 5000 // 5 seconds timeout for profile fetch
    });
    
    // First, check if we received an HTML response (common with ngrok)
    if (typeof response.data === 'string' && 
        (response.data.includes("<html") || response.data.includes("<!DOCTYPE"))) {
      console.error("Received HTML response instead of JSON for user profile. Likely ngrok tunnel page or misconfigured CORS.");
      
      // Try to authorize ngrok for next time
      if (API_BASE_URL.includes('ngrok')) {
        try {
          console.log("Attempting ngrok pre-authorization...");
          await authorizeNgrok();
          
          // Try one more time immediately after authorization
          try {
            console.log("Retrying profile fetch after ngrok authorization");
            const retryResponse = await api.get("/api/user/profile", { 
              params,
              headers,
              timeout: 5000,
              validateStatus: (status) => status === 200 // Only accept 200 responses
            });
            
            // If we got a valid response this time, verify it's not HTML and has user_id
            if (retryResponse.data && 
                typeof retryResponse.data === 'object' && 
                retryResponse.data.user_id) {
              console.log("Successfully retrieved user profile after ngrok auth");
              // Cache this successful response
              localStorage.setItem('mindmate_profile_cache', JSON.stringify(retryResponse.data));
              localStorage.setItem('mindmate_profile_cache_time', Date.now().toString());
              return retryResponse.data;
            } else {
              console.warn("Retry after ngrok auth returned invalid data:", 
                typeof retryResponse.data === 'string' ? "HTML/String response" : "Missing user_id");
            }
          } catch (retryErr) {
            console.warn("Retry fetch after ngrok auth failed:", retryErr);
          }
        } catch (authErr) {
          console.warn("Ngrok authorization failed:", authErr);
        }
      }
      
      // Use cached profile if available
      const cachedProfile = localStorage.getItem('mindmate_profile_cache');
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          const cacheTime = localStorage.getItem('mindmate_profile_cache_time');
          const cacheAge = cacheTime ? (Date.now() - parseInt(cacheTime)) / 1000 : 999999;
          console.log(`Using cached profile (${cacheAge.toFixed(1)}s old) due to HTML response`);
          return parsedProfile;
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }
      
      // No cached profile or invalid cache, return a fallback without throwing error
      console.log("No valid cached profile, using fallback profile");
      return createFallbackUserProfile(userId || "guest");
    }
    
    // Check if we received fromCache response from our interceptor
    // Type assertion to access the optional fromCache property
    const enhancedResponse = response as AxiosResponse & { fromCache?: boolean };
    if (enhancedResponse.fromCache) {
      console.log("Using cached profile from response interceptor");
    }
    
    // Check if we got a valid response with expected structure
    if (response.data && typeof response.data === 'object') {
      // Validate that we have the expected structure
      if (response.data.user_id) {
        console.log("Valid user profile received:", userId);
        
        // Cache the valid profile for offline use
        try {
          localStorage.setItem('mindmate_profile_cache', JSON.stringify(response.data));
        } catch (e) {
          console.warn("Failed to cache profile to localStorage:", e);
        }
        
        // Ensure mood_trends exists with required properties
        if (!response.data.mood_trends) {
          console.warn("No mood_trends in profile, creating default");
          response.data.mood_trends = {
            trend: "stable",
            average_mood: 5.0,
            insights: []
          };
        } else {
          // Ensure average_mood is a number
          if (typeof response.data.mood_trends.average_mood !== 'number') {
            console.warn("Missing or invalid average_mood in profile.mood_trends", response.data.mood_trends);
            response.data.mood_trends.average_mood = 5.0;
          }
          
          // Ensure insights is an array
          if (!response.data.mood_trends.insights || !Array.isArray(response.data.mood_trends.insights)) {
            console.warn("Missing or invalid insights array in profile.mood_trends");
            response.data.mood_trends.insights = [];
          }
          
          // Ensure trend is a string
          if (typeof response.data.mood_trends.trend !== 'string') {
            console.warn("Missing or invalid trend in profile.mood_trends");
            response.data.mood_trends.trend = "stable";
          }
        }
        
        return response.data;
      } else {
        // If we're here, the response has an object but not the expected user_id
        console.error("Invalid user profile response format (missing user_id):", response.data);
        throw new Error("Invalid response format: missing user_id");
      }
    } else {
      console.error("Invalid response data type:", typeof response.data);
      throw new Error("Invalid response data type");
    }
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    
    // Special handling for 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.error("Authentication error (401) when fetching profile");
      localStorage.removeItem('mindmate_token'); // Clear invalid token
      throw new Error("Authentication failed. Please log in again.");
    }
    
    // Try to get cached profile first
    try {
      const cachedProfile = localStorage.getItem('mindmate_profile_cache');
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        console.log("Using cached profile from localStorage");
        return profile;
      }
    } catch (e) {
      console.error("Error reading cached profile:", e);
    }
    
    console.log("Returning fallback profile for user:", userId || "guest");
    // Return a fallback profile if no cache
    return createFallbackUserProfile(userId || "guest");
  }
}

// Helper function to create a consistent fallback profile
function createFallbackUserProfile(userId: string): UserProfile {
  console.log(`Creating fallback profile for user ${userId}`);
  
  // Check for stored preferences first
  let storedPreferences: any = null;
  try {
    const prefData = localStorage.getItem('mindmate_profile_preferences');
    if (prefData) {
      storedPreferences = JSON.parse(prefData);
      console.log('Found stored preferences for profile');
    }
  } catch (e) {
    console.error("Error reading stored preferences:", e);
  }
  
  // Get stored mood data if available
  let storedMoods: any[] = [];
  try {
    const storedData = localStorage.getItem(`mindmate_mood_${userId}`);
    if (storedData) {
      storedMoods = JSON.parse(storedData);
      console.log(`Found ${storedMoods.length} stored mood entries for ${userId}`);
    }
  } catch (e) {
    console.error("Error reading stored mood data:", e);
  }
  
  // Calculate average mood if we have stored entries
  let averageMood = 5.0;
  if (storedMoods.length > 0) {
    const sum = storedMoods.reduce((acc, curr) => acc + (curr.mood_score || 5), 0);
    averageMood = parseFloat((sum / storedMoods.length).toFixed(1));
  }
  
  // Generate appropriate insights based on data availability
  const insights = storedMoods.length > 0
    ? [
        "Based on local data only",
        `You've tracked your mood ${storedMoods.length} time(s)`,
        "Connect to the internet for more personalized insights"
      ]
    : [
        "Using offline fallback data",
        "Start tracking your mood to see patterns",
        "Connect to the internet for personalized insights"
      ];
  
  // Check if we have a cached profile to use as base
  try {
    const cachedProfileData = localStorage.getItem('mindmate_profile_cache');
    if (cachedProfileData) {
      const cachedProfile = JSON.parse(cachedProfileData);
      console.log('Using cached profile as base for fallback');
      
      // Return cached profile with updated mood data
      return {
        ...cachedProfile,
        user_id: userId, // Ensure we use the current user ID
        mood_trends: {
          trend: storedMoods.length > 2 ? "stable" : "not_enough_data",
          average_mood: averageMood,
          insights: insights
        }
      };
    }
  } catch (e) {
    console.error("Error reading cached profile:", e);
  }
  
  // If no cached profile exists, create a new one
  return {
    user_id: userId,
    therapy_preferences: storedPreferences?.therapy_preferences || {
      preferred_approach: "cbt",
      communication_style: "supportive",
      goals: ["Manage stress", "Improve mood"]
    },
    session_stats: {
      total_sessions: 0,
      last_session: new Date().toISOString(),
      mood_improvements: 0
    },
    mood_trends: {
      trend: storedMoods.length > 2 ? "stable" : "not_enough_data",
      average_mood: averageMood,
      insights: insights
    }
  };
}

export async function updateUserProfile(userId: string, profileUpdates: any): Promise<{ status: string; user_id: string }> {
  try {
    console.log("Updating user profile for:", userId);
    console.log("Profile updates:", profileUpdates);
    
    // Verify token before attempting to make the request
    const token = localStorage.getItem('mindmate_token');
    if (!token) {
      console.error("No authentication token found in localStorage");
      throw new Error("Authentication failed. Please log in again.");
    }
    
    // Make the API request with explicit authentication header
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Send only profile_updates without user_id since it's now extracted from the token in the backend
    const response = await api.post("/api/user/profile", {
      profile_updates: profileUpdates
    }, { headers });
    
    // Check for HTML response (common with ngrok errors)
    if (typeof response.data === 'string' && 
        (response.data.includes("<html") || response.data.includes("<!DOCTYPE"))) {
      console.error("Received HTML response instead of JSON when updating profile");
      
      // Try to authorize ngrok for future requests
      if (API_BASE_URL.includes('ngrok')) {
        authorizeNgrok().catch(err => console.warn("Ngrok authorization failed:", err));
      }
      
      // Cache profile updates locally so they're not lost
      try {
        // Get existing profile from cache
        const cachedProfile = localStorage.getItem('mindmate_profile_cache');
        if (cachedProfile) {
          const profileData = JSON.parse(cachedProfile);
          
          // Merge updates into cached profile
          const updatedProfile = {
            ...profileData,
            ...profileUpdates
          };
          
          // Save back to cache
          localStorage.setItem('mindmate_profile_cache', JSON.stringify(updatedProfile));
          console.log("Saved profile updates to local cache due to HTML response");
        }
      } catch (e) {
        console.error("Failed to update cached profile:", e);
      }
      
      // Return a fake success response
      return {
        status: "cached_update",
        user_id: userId
      };
    }
    
    console.log("Profile update successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    
    // Check for authentication errors (401)
    if (error.response?.status === 401) {
      console.error("Authentication failed (401 Unauthorized)");
      
      // Store pending updates to retry after login
      try {
        localStorage.setItem(`mindmate_pending_profile_${userId}`, JSON.stringify(profileUpdates));
      } catch (e) {
        console.warn("Failed to store pending profile updates:", e);
      }
      
      throw new Error("Authentication failed. Please log in again.");
    }
    
    // Handle other types of errors
    const errorMessage = error.response?.data?.error 
      || error.message 
      || "Failed to update profile";
      
    throw new Error(errorMessage);
  }
}

// Mood Tracking
export async function trackMood(moodData: MoodEntry): Promise<any> {
  // First, store the mood data locally as a backup
  try {
    const userId = moodData.user_id;
    const timestamp = new Date().toISOString();
    const entry = {
      ...moodData,
      timestamp,
    };
    
    // Get existing entries from localStorage
    let entries = [];
    const storedData = localStorage.getItem(`mindmate_mood_${userId}`);
    if (storedData) {
      entries = JSON.parse(storedData);
    }
    
    // Add new entry and save back to localStorage
    entries.push(entry);
    localStorage.setItem(`mindmate_mood_${userId}`, JSON.stringify(entries));
    console.log(`Stored mood entry locally. Total entries: ${entries.length}`);
    
    // Now try to send to backend
    try {
      console.log("Sending mood data to backend:", moodData);
      const response = await api.post("/api/mood/track", moodData);
      
      // Check if we got a valid response
      if (response.data && typeof response.data === 'object') {
        console.log("Mood tracking successful:", response.data);
        return {
          ...response.data,
          local_backup: true,
          entries_count: entries.length
        };
      }
      
      // Handle HTML responses or other invalid formats
      if (typeof response.data === 'string' && response.data.includes("<html")) {
        console.error("Received HTML response instead of JSON for mood tracking");
        throw new Error("Invalid response format (HTML received)");
      }
      
      return response.data;
    } catch (error) {
      console.error("Error tracking mood on backend:", error);
      
      // Return a response indicating local-only storage
      return {
        status: "local_only",
        message: "Your mood entry was saved locally. It will sync when connection is restored.",
        timestamp,
        entries_count: entries.length
      };
    }
  } catch (localError) {
    console.error("Error storing mood locally:", localError);
    throw new Error("Failed to save mood data even locally: " + (localError as Error).message);
  }
}

// Goal Tracking
export async function trackGoal(userId: string, goalName: string, progress: number): Promise<any> {
  const response = await api.post("/api/goal/track", {
    user_id: userId,
    goal: goalName,
    progress
  })
  return response.data
}

// Crisis Assessment
export async function assessCrisis(message: string, userId?: string, conversationHistory: string[] = []): Promise<CrisisAssessment> {
  const response = await api.post("/api/crisis/assess", {
    message,
    user_id: userId,
    conversation_history: conversationHistory
  })
  return response.data
}

// Symptom Analysis
export async function analyzeSymptoms(message: string, conversationHistory: string[] = []): Promise<SymptomAnalysis> {
  // Note: Using /api/crisis/assess with a custom analysis flag since the symptom analysis endpoint
  // is not directly available in the backend but handled as part of the crisis assessment
  const response = await api.post("/api/crisis/assess", {
    message,
    conversation_history: conversationHistory,
    analysis_only: true
  })
  return response.data
}

// Session Management
export async function createSession(userId: string): Promise<SessionData> {
  const response = await api.post("/api/session/create", { user_id: userId })
  return response.data
}

export async function endSession(sessionId: string): Promise<{ status: string; session_id: string }> {
  const response = await api.post("/api/session/end", { session_id: sessionId })
  return response.data
}

// Resource Search
export async function searchResources(searchData: ResourceSearch): Promise<{ resources: any[]; total: number }> {
  const response = await api.post("/api/resources/search", searchData)
  return response.data
}

// Knowledge Base Management
export async function addKnowledgeResource(resource: KnowledgeResource): Promise<any> {
  const response = await api.post("/api/knowledge/add", resource)
  return response.data
}

// Helper function for therapy modules background fetch
async function fetchTherapyModulesBackground(): Promise<void> {
  try {
    // Skip if we're not authorized with ngrok yet
    if (API_BASE_URL.includes('ngrok') && !getNgrokAuthState()) {
      console.log("Skipping background fetch until ngrok is authorized");
      return;
    }
    
    const response = await api.get("/api/therapy/modules");
    
    // Check for HTML response (ngrok confirmation page)
    if (typeof response.data === 'string' && 
        (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html'))) {
      console.warn('Received HTML instead of JSON for therapy modules in background fetch, likely ngrok confirmation page');
      // Mark as unauthorized
      setNgrokAuthState(false);
      // Try to authorize ngrok
      await authorizeNgrok();
      return;
    }
    
    // Check for ngrok auth required JSON response
    if (response.data && 
        typeof response.data === 'object' && 
        response.data.ngrok_auth_required === true) {
      console.warn('Received ngrok auth required response for therapy modules background fetch');
      // Mark as unauthorized
      setNgrokAuthState(false);
      // Try to authorize ngrok
      await authorizeNgrok();
      return;
    }
    
    // If we got valid data, update cache
    if (response.data && response.data.modules) {
      localStorage.setItem('mindmate_modules_cache', JSON.stringify(response.data));
      console.log('Updated therapy modules cache in background');
      // Record successful API call
      recordSuccessfulApiCall();
    }
  } catch (err) {
    console.warn('Background modules fetch failed:', err);
  }
}

// Therapy Modules
export async function getTherapyModules(): Promise<TherapyModules> {
  // Define our fallback data upfront
  const fallbackData: TherapyModules = {
    modules: {
      "cbt": {
        name: "Cognitive Behavioral Therapy",
        techniques: ["thought_records", "behavioral_activation", "cognitive_restructuring"],
        description: "Identify and change negative thought patterns"
      },
      "mindfulness": {
        name: "Mindfulness-Based Therapy",
        techniques: ["breathing_exercises", "body_scan", "present_moment_awareness"],
        description: "Cultivate present-moment awareness"
      },
      "dbt": {
        name: "Dialectical Behavior Therapy",
        techniques: ["distress_tolerance", "emotion_regulation", "interpersonal_effectiveness"],
        description: "Balance acceptance and change through skill-building"
      }
    },
    default: "cbt"
  };

  try {
    // Check if we need to authorize ngrok tunnel
    if (API_BASE_URL.includes('ngrok') && !getNgrokAuthState()) {
      console.log("Pre-authorizing ngrok before therapy modules fetch");
      try {
        // Try to authorize first before making API request
        await authorizeNgrok();
      } catch (e) {
        console.warn("Ngrok pre-authorization failed:", e);
      }
    }

    console.log("Fetching therapy modules...");
    
    // Check for cached modules first
    const cachedModules = localStorage.getItem('mindmate_modules_cache');
    if (cachedModules) {
      try {
        const modulesData = JSON.parse(cachedModules);
        console.log("Using cached therapy modules temporarily");
        
        // Schedule a background refresh of the modules after a short delay
        setTimeout(() => {
          // Use our defined background fetch function 
          fetchTherapyModulesBackground().catch((err: Error) => {
            console.warn("Error in background modules refresh:", err);
          });
        }, 2000); // Increased delay to reduce concurrent requests
        
        return modulesData;
      } catch (e) {
        console.error('Error parsing cached modules:', e);
      }
    }
    
    // If no cache or parsing failed, make the primary request
    const response = await api.get("/api/therapy/modules");
    
    // Check for HTML response (ngrok confirmation page)
    if (typeof response.data === 'string' && 
        (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html'))) {
      console.warn('Received HTML instead of JSON for therapy modules, likely ngrok confirmation page');
      
      // Try to pre-authorize the tunnel for next time
      try {
        console.log("Attempting ngrok pre-authorization for therapy modules...");
        await authorizeNgrok();
        
        // Try one more time after authorization
        try {
          console.log("Retrying therapy modules fetch after ngrok auth");
          const retryResponse = await api.get("/api/therapy/modules", {
            timeout: 5000,
            validateStatus: (status) => status === 200 // Only accept 200 responses
          });
          
          // If we got a valid response this time, verify it's not HTML and has modules property
          if (retryResponse.data && 
              typeof retryResponse.data === 'object' && 
              retryResponse.data.modules) {
            console.log("Successfully retrieved therapy modules after ngrok auth");
            // Cache this successful response
            localStorage.setItem('mindmate_modules_cache', JSON.stringify(retryResponse.data));
            // Record successful API call
            recordSuccessfulApiCall();
            return retryResponse.data;
          }
        } catch (retryErr) {
          console.warn("Retry modules fetch after ngrok auth failed:", retryErr);
        }
      } catch (err) {
        console.warn("Ngrok auth failed for therapy modules:", err);
      }
      
      // If we have cached data, use that instead
      if (cachedModules) {
        try {
          const parsedModules = JSON.parse(cachedModules);
          console.log("Using cached therapy modules due to HTML response");
          return parsedModules;
        } catch (e) {
          console.error('Error parsing cached modules after HTML response:', e);
        }
      }
      
      // If no cache or parsing failed, return fallback data
      console.log("Using fallback therapy modules data");
      return fallbackData;
    }
    
    // If we got a valid response, cache it
    if (response.data && response.data.modules) {
      localStorage.setItem('mindmate_modules_cache', JSON.stringify(response.data));
      // Record successful API call
      recordSuccessfulApiCall();
      return response.data;
    } else {
      console.warn("Received invalid modules data format:", response.data);
      return fallbackData;
    }
  } catch (error) {
    console.error("Error fetching therapy modules:", error);
    
    // Try to get from cache if available
    const cachedModules = localStorage.getItem('mindmate_modules_cache');
    if (cachedModules) {
      try {
        return JSON.parse(cachedModules);
      } catch (e) {
        console.error('Error parsing cached modules after fetch error:', e);
      }
    }
    
    // Return fallback data if everything else fails
    return fallbackData;
  }
}

// Enhanced Audio Transcription
export async function transcribeAudio(audioFile: Blob): Promise<any> {
  const formData = new FormData()
  formData.append("audio", audioFile)
  
  const response = await api.post("/api/transcribe", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// Export Comprehensive Report
export async function exportComprehensiveReport(userId: string, sessionId?: string): Promise<void> {
  try {
    console.log(`Attempting to export report for user: ${userId}, session: ${sessionId || 'none'}`);
    
    const response = await api.post("/api/export/report", {
      user_id: userId,
      session_id: sessionId
    }, {
      responseType: "blob",
      // Increased timeout for PDF generation
      timeout: 30000
    })

    console.log("Report generation successful, creating download...");
    
    // Check if the response is actually a PDF (or at least not an error)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      // This might be an error response in JSON format
      const reader = new FileReader();
      
      reader.onload = function() {
        try {
          const jsonError = JSON.parse(reader.result as string);
          console.error("Server returned JSON error:", jsonError);
          throw new Error(jsonError.error || "Server returned error response");
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          throw new Error("Invalid server response");
        }
      };
      
      reader.readAsText(response.data);
      return;
    }

    // Process the PDF blob
    const blob = new Blob([response.data], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "")
    link.download = `MindMate_Consultation_${date}.pdf`

    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log("Report downloaded successfully");
  } catch (error: any) {
    console.error("Export report error details:", error);
    
    // Try to extract more specific error information
    let errorMessage = "Failed to export comprehensive report";
    
    if (error.response) {
      if (error.response.data instanceof Blob) {
        try {
          // Try to read the blob as text
          const text = await error.response.data.text();
          try {
            const jsonError = JSON.parse(text);
            errorMessage = jsonError.error || errorMessage;
          } catch (parseError) {
            // If it's not JSON, use the text directly if it's not too long
            if (text.length < 100) {
              errorMessage = text;
            }
          }
        } catch (blobError) {
          console.error("Failed to read error blob:", blobError);
        }
      } else if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    }
    
    throw new Error(errorMessage);
  }
}

// ========================
// AUTH API FUNCTIONS
// ========================

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user_id?: string;
  error?: string;
  // Extended properties for better error handling
  errorType?: string;                 // Type of error: duplicate_user, network_error, server_error, etc.
  validation_errors?: string[];       // List of validation errors from the server
  retry?: boolean;                    // Whether the client should retry the operation
  retryAfter?: number;                // Suggested time to wait before retrying (seconds)
  fromCache?: boolean;                // Whether the response is from local cache
  temporary?: boolean;                // Whether the error is temporary
  message?: string;                   // Additional message from server
  profile_exists?: boolean;           // Whether user profile exists after login
  profile_created?: boolean;          // Whether user profile was created after registration
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  // Add a small random delay to prevent exact simultaneous registrations
  const randomDelay = Math.random() * 300; // 0-300ms
  await new Promise(resolve => setTimeout(resolve, randomDelay));
  
  try {
    console.log("Registering user with data:", JSON.stringify({
      username: data.username,
      email: data.email,
      password: "********" // Don't log actual password
    }));
    
    // Check API availability before attempting registration
    const isApiAvailable = await checkApiConnection();
    if (!isApiAvailable) {
      console.warn("API appears to be down, but will try registration anyway");
    }
    
    // Set a shorter timeout for registration specifically
    const response = await api.post("/api/auth/register", data, {
      timeout: 10000 // 10 seconds timeout for registration
    });
    
    console.log("Registration successful:", response.data);
    
    // Create a default profile cache for this user
    if (response.data.user_id) {
      try {
        const initialProfile = {
          user_id: response.data.user_id,
          therapy_preferences: {
            preferred_approach: "",
            communication_style: "",
            goals: []
          },
          session_stats: {
            total_sessions: 0,
            last_session: new Date().toISOString(),
            mood_improvements: 0
          },
          mood_trends: {
            trend: "not_enough_data",
            average_mood: 5.0,
            insights: ["Welcome to MindMate!", "Start tracking your mood to see trends"]
          }
        };
        localStorage.setItem('mindmate_profile_cache', JSON.stringify(initialProfile));
      } catch (cacheError) {
        console.error("Error creating profile cache after registration:", cacheError);
      }
    }
    
    return {
      success: true,
      user_id: response.data.user_id,
      ...response.data
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Check if we got a response from cache due to API issues
    if (error.fromCache) {
      console.warn("Using cached response for registration due to API issues");
      return {
        success: false,
        error: "API connection issue. Please check your internet connection.",
        fromCache: true,
        temporary: true
      };
    }
    
    // Handle different error types
    if (error.response) {
      // The server responded with an error status
      console.error("Server responded with error:", error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 409) {
        // 409 Conflict - User already exists
        return {
          success: false,
          error: error.response.data.error || "Username or email already exists",
          errorType: "duplicate_user"
        };
      } else if (error.response.status === 503) {
        // 503 Service Unavailable - Server temporarily unavailable
        return {
          success: false,
          error: error.response.data.error || "Service temporarily unavailable. Please try again later.",
          errorType: "temporary_unavailable",
          retry: true,
          retryAfter: error.response.data.retry_after || 5
        };
      } else if (error.response.status === 400) {
        // 400 Bad Request - Validation errors
        return {
          success: false,
          error: error.response.data.error || "Please check your information and try again",
          validation_errors: error.response.data.validation_errors,
          errorType: "validation_error"
        };
      }
      
      // Generic error with server response
      return {
        success: false,
        error: error.response.data.error || "Registration failed with server error",
        errorType: "server_error"
      };
    } else if (error.request) {
      // The request was made but no response was received (CORS issues often manifest here)
      console.error("No response received from server. Possible CORS issue.");
      return {
        success: false,
        error: "Network error. The server may be down or your internet connection may be unstable.",
        errorType: "network_error",
        retry: true
      };
    } else {
      // Something else caused the error
      return {
        success: false,
        error: error.message || "An unexpected error occurred during registration",
        errorType: "unknown_error"
      };
    }
  }
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  // Add a small random delay to prevent race conditions
  const randomDelay = Math.random() * 200; // 0-200ms
  await new Promise(resolve => setTimeout(resolve, randomDelay));
  
  try {
    console.log("Login attempt with username:", data.username);
    
    // Check API availability before attempting login
    const isApiAvailable = await checkApiConnection();
    if (!isApiAvailable) {
      console.warn("API appears to be down, but will try login anyway");
    }
    
    // Set a shorter timeout for login specifically
    const response = await api.post("/api/auth/login", data, {
      timeout: 8000 // 8 seconds timeout for login
    });
    
    console.log("Login successful");
    
    // Store the token for future authenticated requests
    if (response.data.token) {
      localStorage.setItem('mindmate_token', response.data.token);
    }
    if (response.data.user_id) {
      localStorage.setItem('mindmate_user_id', response.data.user_id);
    }
    
    // Store email for potential token refresh (don't store password in plain text)
    localStorage.setItem('mindmate_email', data.username);
    // Use a simple obfuscation for password (not truly secure, just to avoid plain text)
    try {
      const obfuscated = btoa(data.password);
      localStorage.setItem('mindmate_password_hash', obfuscated);
    } catch (e) {
      console.warn("Could not store obfuscated password for refresh token");
    }
    
    // Create a default profile cache for this user if one doesn't exist
    try {
      const existingCache = localStorage.getItem('mindmate_profile_cache');
      
      if (!existingCache || !JSON.parse(existingCache).user_id) {
        const initialProfile = {
          user_id: response.data.user_id || '',
          therapy_preferences: {
            preferred_approach: "",
            communication_style: "",
            goals: []
          },
          session_stats: {
            total_sessions: 0,
            last_session: new Date().toISOString(),
            mood_improvements: 0
          },
          mood_trends: {
            trend: "not_enough_data",
            average_mood: 5.0,
            insights: ["Welcome back to MindMate!", "Start tracking your mood to see trends"]
          }
        };
        localStorage.setItem('mindmate_profile_cache', JSON.stringify(initialProfile));
      }
    } catch (cacheError) {
      console.error("Error checking/creating profile cache after login:", cacheError);
    }
    
    return {
      success: true,
      token: response.data.token,
      user_id: response.data.user_id,
      profile_exists: response.data.profile_exists,
      ...response.data
    };
  } catch (error: any) {
    console.error("Login error:", error);
    
    // Check if we got a response from cache due to API issues
    if (error.fromCache) {
      console.warn("Using cached response for login due to API issues");
      return {
        success: false,
        error: "API connection issue. Please check your internet connection.",
        fromCache: true,
        temporary: true,
        errorType: "connection_issue"
      };
    }
    
    // Handle different error types
    if (error.response) {
      // The server responded with an error
      if (error.response.status === 401) {
        // 401 Unauthorized - Invalid credentials
        return {
          success: false,
          error: error.response.data.error || "Invalid username or password",
          errorType: "invalid_credentials"
        };
      } else if (error.response.status === 503) {
        // 503 Service Unavailable
        return {
          success: false,
          error: error.response.data.error || "Service temporarily unavailable",
          errorType: "service_unavailable",
          retry: true,
          retryAfter: error.response.data.retry_after || 5
        };
      }
      
      return {
        success: false,
        error: error.response.data.error || "Login failed with server error",
        errorType: "server_error"
      };
    } else if (error.request) {
      // No response received (possible CORS or network issue)
      console.error("No response received from server during login");
      
      // Check if we have token in localStorage (user was previously logged in)
      const existingToken = localStorage.getItem('mindmate_token');
      const existingUserId = localStorage.getItem('mindmate_user_id');
      
      if (existingToken && existingUserId) {
        console.log("Using existing token due to network error");
        return {
          success: true,
          token: existingToken,
          user_id: existingUserId,
          message: "Using existing session due to network issues",
          fromCache: true
        };
      }
      
      return {
        success: false,
        error: "Network error. The server may be down or your internet connection may be unstable.",
        errorType: "network_error",
        retry: true
      };
    } else {
      return {
        success: false,
        error: error.message || "An unknown error occurred during login",
        errorType: "unknown_error"
      };
    }
  }
}

export function logoutUser(): void {
  localStorage.removeItem('mindmate_token');
  localStorage.removeItem('mindmate_user_id');
   localStorage.removeItem('mindmate_email');
  localStorage.removeItem('mindmate_password');
}

// Helper function to refresh authentication token
// This is a placeholder - in a real app, this would make a request to refresh the token
async function refreshAuthToken(): Promise<string | null> {
  console.log("Attempting to refresh authentication token");
  
  // Try to get stored credentials if available
  const storedEmail = localStorage.getItem('mindmate_email');
  const storedPassword = localStorage.getItem('mindmate_password');
  
  if (storedEmail && storedPassword) {
    try {
      console.log("Found stored credentials, attempting re-authentication");
      const response = await api.post("/api/auth/login", {
        email: storedEmail,
        password: storedPassword
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('mindmate_token', response.data.token);
        console.log("Re-authentication successful");
        return response.data.token;
      }
    } catch (error) {
      console.error("Failed to refresh token with stored credentials:", error);
      // Clear invalid stored credentials      localStorage.removeItem('mindmate_password');
    }
  }
  
  // If we reach here, we couldn't refresh the token
  console.warn("Could not refresh authentication token automatically");
  return null;
}

// Global var to track ngrok authorization state
ngrokAuthorized = getNgrokAuthState();

// Export function to check if ngrok is authorized
export const checkNgrokAuth = async (): Promise<{
  authorized: boolean;
  message?: string;
  apiUrl: string;
}> => {
  try {
    // Try to fetch the special ngrok check endpoint
    const response = await api.get('/api/ngrok-check');
    
    // If successful, update authorization state
    setNgrokAuthState(true);
    return { 
      authorized: true, 
      apiUrl: API_BASE_URL 
    };
  } catch (error: any) {
    // If we get a special ngrok auth error, mark as unauthorized
    if (error.isNgrokAuthError || error.response?.data?.error === 'ngrok_auth_required') {
      setNgrokAuthState(false);
      
      return {
        authorized: false,
        message: `Ngrok tunnel requires authorization. Please open ${API_BASE_URL} in a new browser tab to authorize, then refresh this page.`,
        apiUrl: API_BASE_URL
      };
    }
    
    // For other errors, check if we were previously authorized
    return {
      authorized: ngrokAuthorized,
      apiUrl: API_BASE_URL,
      message: ngrokAuthorized ? undefined : 'Could not verify ngrok authorization status.'
    };
  }
};