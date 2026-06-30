import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { 
  getStoredToken, 
  getStoredUser, 
  setStoredToken, 
  setStoredUser, 
  removeStoredToken, 
  removeStoredUser 
} from '../utils/helpers';
import { LOADING_STATES } from '../utils/constants';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),
  loading: LOADING_STATES.IDLE,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };
      
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: LOADING_STATES.ERROR,
        error: action.payload,
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: LOADING_STATES.SUCCESS,
        error: null,
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: LOADING_STATES.IDLE,
        error: null,
      };
      
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        loading: LOADING_STATES.IDLE,
        error: null,
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        loading: LOADING_STATES.IDLE,
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check token validity on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getStoredToken();
      
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
        const response = await authAPI.verifyToken();
        
        if (response.success) {
          setStoredUser(response.data);
          dispatch({ 
            type: AUTH_ACTIONS.LOGIN_SUCCESS, 
            payload: { user: response.data } 
          });
        } else {
          // Token is invalid
          removeStoredToken();
          removeStoredUser();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        removeStoredToken();
        removeStoredUser();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        setStoredToken(token);
        setStoredUser(user);
        
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_SUCCESS, 
          payload: { user } 
        });
        
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        setStoredToken(token);
        setStoredUser(user);
        
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_SUCCESS, 
          payload: { user } 
        });
        
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear stored data regardless of API call result
      removeStoredToken();
      removeStoredUser();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = response.data;
        setStoredUser(updatedUser);
        
        dispatch({ 
          type: AUTH_ACTIONS.UPDATE_USER, 
          payload: updatedUser 
        });
        
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.SUCCESS });
        toast.success('Password changed successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings) => {
    try {
      const response = await authAPI.updateNotificationSettings(settings);
      
      if (response.success) {
        dispatch({ 
          type: AUTH_ACTIONS.UPDATE_USER, 
          payload: { notificationSettings: response.data.notificationSettings } 
        });
        
        toast.success('Notification settings updated!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete account function
  const deleteAccount = async (password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      const response = await authAPI.deleteAccount({ password });
      
      if (response.success) {
        removeStoredToken();
        removeStoredUser();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.success('Account deleted successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Google OAuth login (for future implementation)
  const loginWithGoogle = async (tokenId) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      // This would be implemented when Google OAuth is set up
      // const response = await authAPI.googleLogin(tokenId);
      
      // For now, just show a message
      toast.error('Google login not yet implemented');
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Google login not available' });
      
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
    }
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    updateNotificationSettings,
    deleteAccount,
    clearError,
    loginWithGoogle,
    
    // Computed values
    isLoading: state.loading === LOADING_STATES.LOADING,
    hasError: !!state.error,
    isLoggedIn: state.isAuthenticated && !!state.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for route protection
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading === LOADING_STATES.LOADING) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;