import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';
import { getStoredToken, removeStoredToken } from '../utils/helpers';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (!response) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }

    const { status, data } = response;
    const message = data?.message || ERROR_MESSAGES.SERVER_ERROR;

    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        removeStoredToken();
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        break;
        
      case 403:
        toast.error(message);
        break;
        
      case 404:
        toast.error(message || 'Resource not found');
        break;
        
      case 422:
        // Validation errors
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            toast.error(err.message);
          });
        } else {
          toast.error(message);
        }
        break;
        
      case 429:
        toast.error(message || 'Too many requests. Please try again later.');
        break;
        
      case 500:
      default:
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
        break;
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Change password
  changePassword: (data) => api.put('/auth/password', data),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Verify token
  verifyToken: () => api.get('/auth/verify'),
  
  // Delete account
  deleteAccount: (data) => api.delete('/auth/account', { data }),
  
  // Update notification settings
  updateNotificationSettings: (settings) => api.put('/auth/notifications', settings),
};

// Users API
export const usersAPI = {
  // Search users
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  
  // Get user by ID
  getUserById: (userId) => api.get(`/users/${userId}`),
  
  // Get online users
  getOnlineUsers: () => api.get('/users/online'),
  
  // Friend management
  getFriends: () => api.get('/users/friends/list'),
  addFriend: (userId) => api.post(`/users/friends/${userId}`),
  removeFriend: (userId) => api.delete(`/users/friends/${userId}`),
  
  // Block management
  getBlockedUsers: () => api.get('/users/blocked/list'),
  blockUser: (userId) => api.post(`/users/blocked/${userId}`),
  unblockUser: (userId) => api.delete(`/users/blocked/${userId}`),
  
  // Update avatar
  updateAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get user stats
  getUserStats: () => api.get('/users/stats'),
};

// Chats API
export const chatsAPI = {
  // Get user chats
  getUserChats: (page = 1, limit = 20) => api.get(`/chats?page=${page}&limit=${limit}`),
  
  // Get chat by ID
  getChatById: (chatId) => api.get(`/chats/${chatId}`),
  
  // Create group chat
  createGroupChat: (formData) => api.post('/chats/group', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get or create private chat
  getOrCreatePrivateChat: (userId) => api.post(`/chats/private/${userId}`),
  
  // Update chat
  updateChat: (chatId, data) => api.put(`/chats/${chatId}`, data),
  
  // Delete chat
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
  
  // Leave chat
  leaveChat: (chatId) => api.post(`/chats/${chatId}/leave`),
  
  // Participant management
  addParticipant: (chatId, userId) => api.post(`/chats/${chatId}/participants`, { userId }),
  removeParticipant: (chatId, userId) => api.delete(`/chats/${chatId}/participants/${userId}`),
  
  // Admin management
  makeAdmin: (chatId, userId) => api.post(`/chats/${chatId}/admins/${userId}`),
  removeAdmin: (chatId, userId) => api.delete(`/chats/${chatId}/admins/${userId}`),
};

// Messages API
export const messagesAPI = {
  // Send message
  sendMessage: (data) => api.post('/messages', data),
  
  // Get chat messages
  getChatMessages: (chatId, page = 1, limit = 50) => 
    api.get(`/messages/chat/${chatId}?page=${page}&limit=${limit}`),
  
  // Get message by ID
  getMessageById: (messageId) => api.get(`/messages/${messageId}`),
  
  // Edit message
  editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
  
  // Delete message
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  
  // Mark message as read
  markMessageAsRead: (messageId) => api.post(`/messages/${messageId}/read`),
  
  // Mark all messages as read
  markAllMessagesAsRead: (chatId) => api.post(`/messages/chat/${chatId}/read-all`),
  
  // Add reaction
  addReaction: (messageId, emoji) => api.post(`/messages/${messageId}/reactions`, { emoji }),
  
  // Remove reaction
  removeReaction: (messageId) => api.delete(`/messages/${messageId}/reactions`),
  
  // Search messages
  searchMessages: (chatId, query, limit = 20) => 
    api.get(`/messages/chat/${chatId}/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  
  // Get unread count
  getUnreadCount: () => api.get('/messages/unread-count'),
  
  // Upload file and send as message
  uploadAndSendFile: (formData) => api.post('/messages/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// File upload helper
export const uploadFile = async (file, chatId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chatId', chatId);
  
  return messagesAPI.uploadAndSendFile(formData);
};

// Generic API helper functions
export const apiHelpers = {
  // Handle API errors
  handleError: (error) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR;
    toast.error(message);
    throw error;
  },
  
  // Check if error is due to network issues
  isNetworkError: (error) => {
    return !error.response && error.request;
  },
  
  // Check if error is due to authentication
  isAuthError: (error) => {
    return error.response?.status === 401;
  },
  
  // Retry API call with exponential backoff
  retryWithBackoff: async (apiCall, maxRetries = 3, baseDelay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries - 1) {
          throw lastError;
        }
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },
};

// Export the configured axios instance
export default api;