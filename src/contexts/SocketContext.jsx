import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';
import { getStoredToken } from '../utils/helpers';
import toast from 'react-hot-toast';

// Create context
const SocketContext = createContext();

// Socket Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { user, isAuthenticated } = useAuth();
  
  // Use ref to track if socket is being initialized to prevent multiple connections
  const initializingRef = useRef(false);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!isAuthenticated || !user || initializingRef.current) {
      return;
    }

    const token = getStoredToken();
    if (!token) {
      return;
    }

    initializingRef.current = true;

    try {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        toast.success('Connected to chat server');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          toast.error('Disconnected from server');
        } else {
          // Client or network issue, will auto-reconnect
          toast.error('Connection lost. Reconnecting...');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        
        if (error.message.includes('Authentication')) {
          toast.error('Authentication failed. Please login again.');
          // Could trigger logout here
        } else {
          toast.error('Connection failed. Retrying...');
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        toast.success('Reconnected to chat server');
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt:', attemptNumber);
        setReconnectAttempts(attemptNumber);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection failed:', error);
        setConnectionError(error.message);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('💥 Max reconnection attempts reached');
        setConnectionError('Failed to reconnect to server');
        toast.error('Unable to reconnect. Please refresh the page.');
      });

      // Custom error handling
      newSocket.on('error', (error) => {
        console.error('⚠️  Socket error:', error);
        toast.error(error.message || 'Socket error occurred');
      });

      setSocket(newSocket);
      initializingRef.current = false;

      return newSocket;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError(error.message);
      initializingRef.current = false;
    }
  }, [isAuthenticated, user]); // Only depend on authentication state

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socket) {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
      setReconnectAttempts(0);
    }
    initializingRef.current = false;
  }, [socket]);

  // Initialize socket when authenticated - Fixed dependency array
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = initializeSocket();
      
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
        initializingRef.current = false;
      };
    } else {
      // Only disconnect if socket exists
      if (socket) {
        disconnectSocket();
      }
    }
  }, [isAuthenticated, user]); // Remove initializeSocket and disconnectSocket from dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      initializingRef.current = false;
    };
  }, []); // Empty dependency array for cleanup

  // Socket utility functions
  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Cannot emit - socket not connected:', event, data);
    }
  }, [socket, isConnected]);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      
      // Return cleanup function
      return () => {
        socket.off(event, callback);
      };
    }
  }, [socket]);

  const off = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  const once = useCallback((event, callback) => {
    if (socket) {
      socket.once(event, callback);
    }
  }, [socket]);

  // Join chat room
  const joinChat = useCallback((chatId) => {
    emit(SOCKET_EVENTS.JOIN_CHAT, chatId);
  }, [emit]);

  // Leave chat room
  const leaveChat = useCallback((chatId) => {
    emit(SOCKET_EVENTS.LEAVE_CHAT, chatId);
  }, [emit]);

  // Send typing indicator
  const sendTyping = useCallback((chatId) => {
    emit(SOCKET_EVENTS.TYPING, { chatId });
  }, [emit]);

  // Stop typing indicator
  const stopTyping = useCallback((chatId) => {
    emit(SOCKET_EVENTS.STOP_TYPING, { chatId });
  }, [emit]);

  // Send message through socket
  const sendMessage = useCallback((messageData) => {
    emit('sendMessage', messageData);
  }, [emit]);

  // Mark message as delivered
  const markMessageDelivered = useCallback((messageId) => {
    emit('messageDelivered', { messageId });
  }, [emit]);

  // Mark message as read
  const markMessageRead = useCallback((messageId) => {
    emit('messageRead', { messageId });
  }, [emit]);

  // Add message reaction
  const addReaction = useCallback((messageId, emoji) => {
    emit('addReaction', { messageId, emoji });
  }, [emit]);

  // Edit message
  const editMessage = useCallback((messageId, newContent) => {
    emit('editMessage', { messageId, newContent });
  }, [emit]);

  // Delete message
  const deleteMessage = useCallback((messageId) => {
    emit('deleteMessage', { messageId });
  }, [emit]);

  // Update user status
  const updateUserStatus = useCallback((status) => {
    emit('updateStatus', { status });
  }, [emit]);

  // Force reconnection
  const forceReconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    } else {
      initializeSocket();
    }
  }, [socket, initializeSocket]);

  // Get connection info
  const getConnectionInfo = useCallback(() => {
    return {
      isConnected,
      socketId: socket?.id,
      connectionError,
      reconnectAttempts,
      lastReconnectAt: socket?.lastReconnectAt,
    };
  }, [isConnected, socket, connectionError, reconnectAttempts]);

  // Context value
  const value = {
    // Socket instance
    socket,
    
    // Connection state
    isConnected,
    connectionError,
    reconnectAttempts,
    
    // Socket methods
    emit,
    on,
    off,
    once,
    
    // Chat-specific methods
    joinChat,
    leaveChat,
    sendTyping,
    stopTyping,
    sendMessage,
    markMessageDelivered,
    markMessageRead,
    addReaction,
    editMessage,
    deleteMessage,
    
    // User methods
    updateUserStatus,
    
    // Utility methods
    forceReconnect,
    getConnectionInfo,
    initializeSocket,
    disconnectSocket,
    
    // Computed values
    isReconnecting: reconnectAttempts > 0,
    hasConnectionError: !!connectionError,
    isOnline: isConnected && !connectionError,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

// Higher-order component for socket-dependent components
export const withSocket = (Component) => {
  return function SocketConnectedComponent(props) {
    const { isConnected, isReconnecting } = useSocket();
    
    if (isReconnecting) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            <span>Reconnecting...</span>
          </div>
        </div>
      );
    }
    
    if (!isConnected) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-sm text-red-500 mb-2">Connection lost</div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-purple-600 hover:text-purple-700"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default SocketContext;