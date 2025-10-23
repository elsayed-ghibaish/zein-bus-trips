import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApolloProvider } from "@apollo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./utils/auth";
import { client } from "./utils/apollo-client";
import { useEffect } from "react";
import { usePushNotifications } from "./hooks/use-push-notifications";
import { Capacitor } from '@capacitor/core';

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import TripsPage from "./pages/TripsPage";
import TripDetails from "./pages/TripDetails";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Push notification wrapper component
const PushNotificationInitializer = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const { registerForPushNotifications } = usePushNotifications();
  
  useEffect(() => {
    if (isAuthenticated) {
      const setupNotifications = async () => {
        try {
          await registerForPushNotifications();
          console.log('Push notifications initialized');
        } catch (error) {
          console.error('Failed to initialize push notifications:', error);
        }
      };
      
      setupNotifications();
    }
  }, [isAuthenticated, registerForPushNotifications]);
  
  return <>{children}</>;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Auth route component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <ApolloProvider client={client}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PushNotificationInitializer>
            <Routes>
              {/* Auth routes */}
              <Route path="/" element={<AuthRoute><LoginPage /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
              <Route path="/trips/:tripId" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
              <Route path="/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PushNotificationInitializer>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ApolloProvider>
);

export default App;
