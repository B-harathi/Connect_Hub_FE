import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';
import { getStoredToken } from '../utils/helpers';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(token = null) {
    const authToken = token || getStoredToken();
    
    if (!authToken) {
      console.error('No auth token available for socket connection');
      return false;
    }

    if (this.socket) {
      this.disconnect();
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
      return true;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      return false;
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Setup basic event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection', { connected: true });
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.emit('connectionError', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('reconnect', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
      this.emit('reconnectAttempt', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection failed:', error);
      this.emit('reconnectError', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket max reconnection attempts reached');
      this.emit('reconnectFailed');
    });

    // Error handling
    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  // Emit event to server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      return true;
    } else {
      console.warn('Cannot emit - socket not connected:', event, data);
      return false;
    }
  }

  // Listen to server events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // Listen to event once
  once(event, callback) {
    if (this.socket) {
      this.socket.once(event, callback);
    }
  }

  // Join chat room
  joinChat(chatId) {
    return this.emit(SOCKET_EVENTS.JOIN_CHAT, chatId);
  }

  // Leave chat room
  leaveChat(chatId) {
    return this.emit(SOCKET_EVENTS.LEAVE_CHAT, chatId);
  }

  // Send typing indicator
  sendTyping(chatId) {
    return this.emit(SOCKET_EVENTS.TYPING, { chatId });
  }

  // Stop typing indicator
  stopTyping(chatId) {
    return this.emit(SOCKET_EVENTS.STOP_TYPING, { chatId });
  }

  // Send message through socket
  sendMessage(messageData) {
    return this.emit('sendMessage', messageData);
  }

  // Mark message as delivered
  markMessageDelivered(messageId) {
    return this.emit('messageDelivered', { messageId });
  }

  // Mark message as read
  markMessageRead(messageId) {
    return this.emit('messageRead', { messageId });
  }

  // Add message reaction
  addReaction(messageId, emoji) {
    return this.emit('addReaction', { messageId, emoji });
  }

  // Edit message
  editMessage(messageId, newContent) {
    return this.emit('editMessage', { messageId, newContent });
  }

  // Delete message
  deleteMessage(messageId) {
    return this.emit('deleteMessage', { messageId });
  }

  // Update user status
  updateUserStatus(status) {
    return this.emit('updateStatus', { status });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Force reconnection
  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  // Clean up all listeners
  cleanup() {
    if (this.socket) {
      // Remove all custom listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      
      this.listeners.clear();
    }
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket;
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;