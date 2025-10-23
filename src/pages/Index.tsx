import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/utils/auth';
import LoginPage from './LoginPage';

const Index = () => {
  const { isAuthenticated } = useAuthStore();
  
  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise, show login page
  return <LoginPage />;
};

export default Index;
