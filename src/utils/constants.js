// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'connecthub_token',
  USER_DATA: 'connecthub_user',
  THEME: 'connecthub_theme',
  CHAT_DRAFTS: 'connecthub_drafts',
  NOTIFICATIONS: 'connecthub_notifications',
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  VOICE: 'voice',
  SYSTEM: 'system',
};

// Chat Types
export const CHAT_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group',
};

// User Status
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // User events
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  USER_TYPING: 'userTyping',
  USER_STOPPED_TYPING: 'userStoppedTyping',
  
  // Message events
  NEW_MESSAGE: 'newMessage',
  MESSAGE_SENT: 'messageSent',
  MESSAGE_DELIVERED: 'messageDelivered',
  MESSAGE_READ: 'messageRead',
  MESSAGE_EDITED: 'messageEdited',
  MESSAGE_DELETED: 'messageDeleted',
  
  // Chat events
  JOIN_CHAT: 'joinChat',
  LEAVE_CHAT: 'leaveChat',
  CHAT_CREATED: 'chatCreated',
  
  // Typing events
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
  
  // Reaction events
  REACTION_ADDED: 'reactionAdded',
  REACTION_REMOVED: 'reactionRemoved',
};

// Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'text/plain'],
  },
  MAX_FILES: 5,
};

// Pagination
export const PAGINATION = {
  MESSAGES_PER_PAGE: 50,
  CHATS_PER_PAGE: 20,
  USERS_PER_PAGE: 20,
  SEARCH_RESULTS_PER_PAGE: 10,
};

// UI Constants
export const UI = {
  HEADER_HEIGHT: '64px',
  SIDEBAR_WIDTH: '280px',
  CHAT_SIDEBAR_WIDTH: '320px',
  MESSAGE_INPUT_HEIGHT: '60px',
  MOBILE_BREAKPOINT: 768,
  TYPING_TIMEOUT: 3000,
  MESSAGE_RETRY_TIMEOUT: 5000,
};

// Routes
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

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size is too large. Maximum size is 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a valid file.',
  CHAT_NOT_FOUND: 'Chat not found.',
  MESSAGE_SEND_FAILED: 'Failed to send message. Please try again.',
  LOGIN_REQUIRED: 'Please log in to continue.',
  CONNECTION_LOST: 'Connection lost. Attempting to reconnect...',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  CHAT_CREATED: 'Chat created successfully',
  FRIEND_ADDED: 'Friend added successfully',
  USER_BLOCKED: 'User blocked successfully',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  MENTION: 'mention',
  REACTION: 'reaction',
  FRIEND_REQUEST: 'friend_request',
  GROUP_INVITE: 'group_invite',
  SYSTEM: 'system',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  MENTION: /@(\w+)/g,
  HASHTAG: /#(\w+)/g,
};

// Date Formats
export const DATE_FORMATS = {
  MESSAGE_TIME: 'HH:mm',
  MESSAGE_DATE: 'MMM dd',
  FULL_DATE: 'MMM dd, yyyy',
  RELATIVE: 'relative',
};

// Animation Durations (in ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// Emoji Categories
export const EMOJI_CATEGORIES = {
  RECENT: 'recent',
  SMILEYS: 'smileys_people',
  ANIMALS: 'animals_nature',
  FOOD: 'food_drink',
  ACTIVITIES: 'activities',
  TRAVEL: 'travel_places',
  OBJECTS: 'objects',
  SYMBOLS: 'symbols',
  FLAGS: 'flags',
};

// Chat Settings
export const CHAT_SETTINGS = {
  MESSAGE_LIMIT: 100,
  TYPING_INDICATOR_TIMEOUT: 3000,
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
  HEARTBEAT_INTERVAL: 30000,
};

// Feature Flags
export const FEATURES = {
  VOICE_MESSAGES: true,
  VIDEO_CALLS: false,
  SCREEN_SHARING: false,
  FILE_SHARING: true,
  REACTIONS: true,
  MESSAGE_EDITING: true,
  MESSAGE_DELETION: true,
  READ_RECEIPTS: true,
  TYPING_INDICATORS: true,
  PUSH_NOTIFICATIONS: true,
};

// Default Values
export const DEFAULTS = {
  AVATAR: '/images/default-avatar.png',
  CHAT_IMAGE: '/images/default-group.png',
  PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  STORAGE_KEYS,
  MESSAGE_TYPES,
  CHAT_TYPES,
  USER_STATUS,
  SOCKET_EVENTS,
  THEMES,
  FILE_UPLOAD,
  PAGINATION,
  UI,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NOTIFICATION_TYPES,
  LOADING_STATES,
  REGEX_PATTERNS,
  DATE_FORMATS,
  ANIMATION_DURATION,
  EMOJI_CATEGORIES,
  CHAT_SETTINGS,
  FEATURES,
  DEFAULTS,
};