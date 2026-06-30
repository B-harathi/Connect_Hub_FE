import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';

// Components
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChatContainer from './components/chat/ChatContainer';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Hooks
import { useAuth } from './contexts/AuthContext';

// Utils
import { applyTheme, getStoredTheme, getSystemTheme } from './utils/helpers';
import { ROUTES } from './utils/constants';

// Import styles
import './styles/globals.css';

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

// Main App Router Component
const AppRouter = () => {
  return (
    <Router>
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
        <Route 
          path={ROUTES.PROFILE} 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.SETTINGS} 
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.CHAT} replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={ROUTES.CHAT} replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component
const App = () => {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = getStoredTheme();
    const theme = savedTheme === 'system' ? getSystemTheme() : savedTheme;
    applyTheme(theme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (getStoredTheme() === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>
              <AppRouter />
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                  // Define default options
                  className: '',
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '14px',
                    maxWidth: '500px',
                  },
                  
                  // Success
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#10b981',
                    },
                  },
                  
                  // Error
                  error: {
                    duration: 5000,
                    style: {
                      background: '#ef4444',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#ef4444',
                    },
                  },
                  
                  // Loading
                  loading: {
                    duration: Infinity,
                    style: {
                      background: '#6366f1',
                    },
                  },
                }}
              />
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </div>
    </ErrorBoundary>
  );
};

export default App;