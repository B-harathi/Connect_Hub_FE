 
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/common/Loading';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChatContainer from './components/chat/ChatContainer';

// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  CHAT_WITH_ID: '/chat/:chatId',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  AUTH_CALLBACK: '/auth/callback',
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading === 'loading') {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading === 'loading') {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.CHAT} replace />;
  }
  
  return children;
};

// Auth Callback Component
const AuthCallback = () => {
  const { login } = useAuth();
  
  React.useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token and redirect
      localStorage.setItem('connecthub_token', token);
      window.location.href = '/chat';
    } else {
      // Redirect to login if no token
      window.location.href = '/login?error=auth_failed';
    }
  }, []);
  
  return <LoadingScreen message="Completing authentication..." />;
};

// Main Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path={ROUTES.LOGIN} 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path={ROUTES.REGISTER} 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Auth callback */}
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
      
      {/* Protected routes */}
      <Route 
        path={ROUTES.CHAT} 
        element={
          <ProtectedRoute>
            <Layout>
              <ChatContainer />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.CHAT_WITH_ID} 
        element={
          <ProtectedRoute>
            <Layout>
              <ChatContainer />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.CHAT} replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={ROUTES.CHAT} replace />} />
    </Routes>
  );
};

export default AppRoutes;