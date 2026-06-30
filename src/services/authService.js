import { authAPI } from './api';
import { 
  setStoredToken, 
  setStoredUser, 
  removeStoredToken, 
  removeStoredUser,
  getStoredToken,
  getStoredUser 
} from '../utils/helpers';

class AuthService {
  constructor() {
    this.currentUser = getStoredUser();
    this.token = getStoredToken();
  }

  // Login user
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        setStoredToken(token);
        setStoredUser(user);
        
        this.currentUser = user;
        this.token = token;
        
        return { success: true, user, token };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        setStoredToken(token);
        setStoredUser(user);
        
        this.currentUser = user;
        this.token = token;
        
        return { success: true, user, token };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear stored data regardless of API call result
      removeStoredToken();
      removeStoredUser();
      
      this.currentUser = null;
      this.token = null;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.currentUser);
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = response.data;
        setStoredUser(updatedUser);
        this.currentUser = updatedUser;
        
        return { success: true, user: updatedUser };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password change failed' 
      };
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await authAPI.verifyToken();
      
      if (response.success) {
        const user = response.data;
        setStoredUser(user);
        this.currentUser = user;
        
        return { success: true, user };
      }
      
      // Token is invalid
      this.logout();
      return { success: false, error: 'Invalid token' };
    } catch (error) {
      this.logout();
      return { 
        success: false, 
        error: error.response?.data?.message || 'Token verification failed' 
      };
    }
  }

  // Delete account
  async deleteAccount(password) {
    try {
      const response = await authAPI.deleteAccount({ password });
      
      if (response.success) {
        this.logout();
        return { success: true };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Account deletion failed' 
      };
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await authAPI.updateNotificationSettings(settings);
      
      if (response.success) {
        const updatedSettings = response.data.notificationSettings;
        
        // Update stored user data
        const updatedUser = { 
          ...this.currentUser, 
          notificationSettings: updatedSettings 
        };
        setStoredUser(updatedUser);
        this.currentUser = updatedUser;
        
        return { success: true, settings: updatedSettings };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Settings update failed' 
      };
    }
  }

  // Google OAuth login
  async loginWithGoogle(tokenId) {
    try {
      // TODO: Implement Google OAuth API call
      throw new Error('Google OAuth not implemented yet');
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Google login failed' 
      };
    }
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Refresh token (for future implementation)
  async refreshToken() {
    try {
      // TODO: Implement refresh token logic
      throw new Error('Refresh token not implemented yet');
    } catch (error) {
      this.logout();
      return { success: false, error: 'Token refresh failed' };
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;