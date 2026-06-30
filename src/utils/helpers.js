import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { STORAGE_KEYS, REGEX_PATTERNS, FILE_UPLOAD } from './constants';

// Local Storage Helpers
export const getStoredToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setStoredToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const removeStoredToken = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getStoredUser = () => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

export const setStoredUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
};

export const removeStoredUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

export const getStoredTheme = () => {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
};

export const setStoredTheme = (theme) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

// Date and Time Helpers
export const formatMessageTime = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return 'Yesterday';
  } else {
    return format(messageDate, 'MMM dd');
  }
};

export const formatChatTime = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return 'Yesterday';
  } else {
    return format(messageDate, 'dd/MM/yy');
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return '';
  }
};

export const getTimeAgo = (date) => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return format(past, 'MMM dd, yyyy');
  }
};

// String Helpers
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateAvatarUrl = (name, size = 40) => {
  if (!name) return '';
  
  const initials = getInitials(name);
  const colors = [
    '1abc9c', '2ecc71', '3498db', '9b59b6', 'e74c3c',
    'f39c12', 'e67e22', '95a5a6', '34495e', '16a085'
  ];
  
  const colorIndex = name.length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=fff&size=${size}`;
};

// Validation Helpers
export const validateEmail = (email) => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// File Helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file, maxSize = FILE_UPLOAD.MAX_SIZE) => {
  return file.size <= maxSize;
};

export const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📋';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗂️';
  return '📎';
};

// Chat Helpers
export const getChatDisplayName = (chat, currentUser) => {
  if (chat.chatType === 'group') {
    return chat.chatName || 'Group Chat';
  } else {
    const otherParticipant = chat.participants?.find(
      p => p._id !== currentUser?._id
    );
    return otherParticipant?.name || 'Unknown User';
  }
};

export const getChatDisplayAvatar = (chat, currentUser) => {
  if (chat.chatType === 'group') {
    return chat.chatImage || null;
  } else {
    const otherParticipant = chat.participants?.find(
      p => p._id !== currentUser?._id
    );
    return otherParticipant?.avatar || generateAvatarUrl(otherParticipant?.name);
  }
};

export const getLastMessagePreview = (message) => {
  if (!message) return 'No messages yet';
  
  switch (message.messageType) {
    case 'text':
      return truncateText(message.content, 50);
    case 'image':
      return '📷 Photo';
    case 'file':
      return '📎 File';
    case 'voice':
      return '🎵 Voice message';
    default:
      return 'Message';
  }
};

// User Status Helpers
export const isUserOnline = (user) => {
  if (!user) return false;
  
  // Consider user online if they were active in the last 5 minutes
  const lastActive = new Date(user.lastActive);
  const now = new Date();
  const diffInMinutes = (now - lastActive) / (1000 * 60);
  
  return user.isOnline && diffInMinutes <= 5;
};

export const getUserStatusText = (user) => {
  if (!user) return 'Offline';
  
  if (isUserOnline(user)) {
    return 'Online';
  }
  
  if (user.lastActive) {
    return `Last seen ${getTimeAgo(user.lastActive)}`;
  }
  
  return 'Offline';
};

// URL Helpers
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// Search Helpers
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

export const fuzzySearch = (items, searchTerm, keys) => {
  if (!searchTerm) return items;
  
  const searchLower = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return keys.some(key => {
      const value = getNestedValue(item, key);
      return value && value.toLowerCase().includes(searchLower);
    });
  });
};

// Object Helpers
export const getNestedValue = (obj, path) => {
  if (typeof path === 'function') return path(obj);
  if (typeof path !== 'string') return undefined;
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Array Helpers
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const groupKey = getNestedValue(item, key);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return array.sort((a, b) => {
    const aVal = getNestedValue(a, key);
    const bVal = getNestedValue(b, key);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Utility Helpers
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

// Theme Helpers
export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Error Helpers
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

// Platform Detection
export const isMobile = () => {
  return window.innerWidth < 768;
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export default {
  // Local Storage
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  getStoredTheme,
  setStoredTheme,
  
  // Date/Time
  formatMessageTime,
  formatChatTime,
  formatRelativeTime,
  getTimeAgo,
  
  // String
  truncateText,
  capitalizeFirst,
  getInitials,
  generateAvatarUrl,
  
  // Validation
  validateEmail,
  validatePassword,
  validateRequired,
  
  // File
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  getFileIcon,
  
  // Chat
  getChatDisplayName,
  getChatDisplayAvatar,
  getLastMessagePreview,
  
  // User
  isUserOnline,
  getUserStatusText,
  
  // Utility
  debounce,
  throttle,
  generateRandomId,
  copyToClipboard,
  deepClone,
  isEmpty,
  groupBy,
  sortBy,
  
  // Theme
  applyTheme,
  getSystemTheme,
  
  // Error
  getErrorMessage,
  
  // Platform
  isMobile,
  isIOS,
  isAndroid,
  isTouchDevice,
};