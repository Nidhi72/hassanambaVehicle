import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useState, useEffect, ReactNode, useCallback } from "react";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Booking from "./pages/Booking/Booking";
import Media from "./pages/Media/Media";
import Users from "./pages/Users/Users";
import AddUser from "./pages/Users/AddUser";
import EditUser from "./pages/Users/EditUser";
import TicketCounter from "./pages/TicketCounter/TicketCounter";
import AddTicketCounter from "./pages/TicketCounter/AddTicketCounter";
import EditTicketCounter from "./pages/TicketCounter/EditTicketCounter";
import DonationBooking from "./pages/Booking/Donation";
import AddMediaPage from "./pages/Media/AddMedia";
import EditMediaPage from "./pages/Media/EditMedia";
import Banners from './pages/Banners/Banner';
import AddBannerPage from "./pages/Banners/AddBanner";
import EditBanner from "./pages/Banners/EditBanner";
import Notifications from "./pages/Notifications/Notifications";
import AddNotification from "./pages/Notifications/AddNotification";
import EditNotification from "./pages/Notifications/EditNotification";
import Login from "./pages/AuthPages/Login";
import Facilities from "./pages/Facilities/Facilities";
import AddFacilityPage from "./pages/Facilities/AddFacilities";
import EditFacility from "./pages/Facilities/EditFacilities";
import QueueRoutes from "./pages/Queues/QueueRoute";
import AddQueueRoutePage from "./pages/Queues/AddQueue";
import EditQueueRoute from "./pages/Queues/EditQueue";
// Type definitions for route components
interface RouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

// Protected Route Component
const ProtectedRoute: React.FC<RouteProps> = ({ children, isAuthenticated }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to home if already authenticated)
const PublicRoute: React.FC<RouteProps> = ({ children, isAuthenticated }) => {
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default function App(): React.ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);

  // Session duration constants
  const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
  const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  // Logout function
  const logout = useCallback((): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActivity');
    setIsAuthenticated(false);
    setShowSessionWarning(false);
  }, []);

  // Update last activity time
  const updateLastActivity = useCallback((): void => {
    if (isAuthenticated) {
      localStorage.setItem('lastActivity', new Date().getTime().toString());
    }
  }, [isAuthenticated]);

  // Check if session is still valid
  const checkSessionValidity = useCallback((): boolean => {
    const token = localStorage.getItem('authToken');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (!token || !lastActivity) return false;
    
    const currentTime = new Date().getTime();
    const lastActivityTime = parseInt(lastActivity);
    
    return (currentTime - lastActivityTime) < SESSION_DURATION;
  }, [SESSION_DURATION]);

  // Handle session warning and expiry
  const handleSessionCheck = useCallback((): void => {
    if (!isAuthenticated) return;
    
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return;
    
    const currentTime = new Date().getTime();
    const lastActivityTime = parseInt(lastActivity);
    const timeElapsed = currentTime - lastActivityTime;
    const timeRemaining = SESSION_DURATION - timeElapsed;
    
    if (timeRemaining <= 0) {
      // Session expired
      logout();
      alert('Your session has expired. Please login again.');
    } else if (timeRemaining <= WARNING_TIME && !showSessionWarning) {
      // Show warning
      setShowSessionWarning(true);
      const minutesLeft = Math.ceil(timeRemaining / (60 * 1000));
      
      if (window.confirm(`Your session will expire in ${minutesLeft} minutes. Do you want to extend it?`)) {
        updateLastActivity();
        setShowSessionWarning(false);
      } else {
        // User chose not to extend, logout after warning time
        setTimeout(() => {
          logout();
          alert('Session expired due to inactivity.');
        }, timeRemaining);
      }
    }
  }, [isAuthenticated, SESSION_DURATION, WARNING_TIME, showSessionWarning, logout, updateLastActivity]);

  // Set up activity listeners
  useEffect(() => {
    if (isAuthenticated) {
      ACTIVITY_EVENTS.forEach(event => {
        document.addEventListener(event, updateLastActivity, true);
      });
    }

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, updateLastActivity, true);
      });
    };
  }, [isAuthenticated, updateLastActivity]);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = (): void => {
      if (checkSessionValidity()) {
        setIsAuthenticated(true);
        updateLastActivity();
      } else {
        logout();
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [checkSessionValidity, updateLastActivity, logout]);

  // Set up periodic session checks
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;

    if (isAuthenticated) {
      // Check session every minute
      sessionCheckInterval = setInterval(handleSessionCheck, 60 * 1000);
    }

    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [isAuthenticated, handleSessionCheck]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>Loading...</div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Login Route - Only accessible when not authenticated */}
          <Route 
            path="/login" 
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <Login setIsAuthenticated={setIsAuthenticated} />
              </PublicRoute>
            } 
          />

          {/* Protected Routes - Only accessible when authenticated */}
          <Route 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<Home />} />

            {/* Others Page */}






            {/* Main Features */}
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/:filterType" element={<Booking />} />
            <Route path="/booking/donation" element={<DonationBooking />} />
            <Route path="/users" element={<Users />} />
            <Route path="/adduser" element={<AddUser />} />
            <Route path="/edituser/:id" element={<EditUser />} />
            <Route path="/media" element={<Media />} />
            <Route path="/add-media" element={<AddMediaPage />} />
            <Route path="/edit-media/:id" element={<EditMediaPage />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/add-banner" element={<AddBannerPage />} />
            <Route path="/edit-banner/:id" element={<EditBanner />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/add-notifications" element={<AddNotification />} />
            <Route path="/edit-notification/:id" element={<EditNotification />} />
            <Route path="/ticket-counter" element={<TicketCounter />} />
            <Route path="/add-ticket-counter" element={<AddTicketCounter />} />
            <Route path="/edit-ticket-counter/:id" element={<EditTicketCounter />} />
            <Route path="/facilities" element={<Facilities/>}/>
            <Route path="/add-facility" element={<AddFacilityPage/>}/>
            <Route path="/edit-facility/:id" element={<EditFacility/>}/>
            <Route path="/queue-routes" element={<QueueRoutes/>}/>
            <Route path="/add-queue" element={<AddQueueRoutePage/>}/>
            <Route path="/edit-queue/:id" element={<EditQueueRoute/>}/>




          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}