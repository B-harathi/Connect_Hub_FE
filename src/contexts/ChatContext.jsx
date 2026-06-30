import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { chatsAPI, messagesAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { LOADING_STATES, MESSAGE_TYPES } from '../utils/constants';
import { sortBy } from '../utils/helpers';
import toast from 'react-hot-toast';
import { generateRandomId } from '../utils/helpers';

// Initial state
const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  typingUsers: {},
  unreadCounts: {},
  loading: LOADING_STATES.IDLE,
  messagesLoading: LOADING_STATES.IDLE,
  error: null,
  hasMoreMessages: true,
  searchResults: [],
  searchLoading: false,
  onlineUsers: [],
};

// Action types
const CHAT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_MESSAGES_LOADING: 'SET_MESSAGES_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CHATS: 'SET_CHATS',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  ADD_CHAT: 'ADD_CHAT',
  UPDATE_CHAT: 'UPDATE_CHAT',
  SET_TYPING_USER: 'SET_TYPING_USER',
  REMOVE_TYPING_USER: 'REMOVE_TYPING_USER',
  SET_UNREAD_COUNTS: 'SET_UNREAD_COUNTS',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  SET_HAS_MORE_MESSAGES: 'SET_HAS_MORE_MESSAGES',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case CHAT_ACTIONS.SET_MESSAGES_LOADING:
      return {
        ...state,
        messagesLoading: action.payload,
      };

    case CHAT_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: LOADING_STATES.ERROR,
        error: action.payload,
      };

    case CHAT_ACTIONS.SET_CHATS:
      return {
        ...state,
        chats: action.payload,
        loading: LOADING_STATES.SUCCESS,
      };

    case CHAT_ACTIONS.SET_CURRENT_CHAT:
      return {
        ...state,
        currentChat: action.payload,
        messages: [],
        hasMoreMessages: true,
      };

    case CHAT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload,
        messagesLoading: LOADING_STATES.SUCCESS,
      };

    case CHAT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        chats: state.chats.map(chat => 
          chat._id === action.payload.chat
            ? { ...chat, lastMessage: action.payload, lastActivity: action.payload.createdAt }
            : chat
        ),
      };

    case CHAT_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg._id === action.payload._id ? { ...msg, ...action.payload } : msg
        ),
      };

    case CHAT_ACTIONS.DELETE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(msg => msg._id !== action.payload),
      };

    case CHAT_ACTIONS.ADD_CHAT:
      return {
        ...state,
        chats: [action.payload, ...state.chats],
      };

    case CHAT_ACTIONS.UPDATE_CHAT:
      return {
        ...state,
        chats: state.chats.map(chat => 
          chat._id === action.payload._id ? { ...chat, ...action.payload } : chat
        ),
        currentChat: state.currentChat?._id === action.payload._id 
          ? { ...state.currentChat, ...action.payload } 
          : state.currentChat,
      };

    case CHAT_ACTIONS.SET_TYPING_USER:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.chatId]: {
            ...state.typingUsers[action.payload.chatId],
            [action.payload.userId]: action.payload.user,
          },
        },
      };

    case CHAT_ACTIONS.REMOVE_TYPING_USER:
      const updatedTypingUsers = { ...state.typingUsers };
      if (updatedTypingUsers[action.payload.chatId]) {
        delete updatedTypingUsers[action.payload.chatId][action.payload.userId];
        if (Object.keys(updatedTypingUsers[action.payload.chatId]).length === 0) {
          delete updatedTypingUsers[action.payload.chatId];
        }
      }
      return {
        ...state,
        typingUsers: updatedTypingUsers,
      };

    case CHAT_ACTIONS.SET_UNREAD_COUNTS:
      return {
        ...state,
        unreadCounts: action.payload,
      };

    case CHAT_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.chatId]: action.payload.count,
        },
      };

    case CHAT_ACTIONS.SET_HAS_MORE_MESSAGES:
      return {
        ...state,
        hasMoreMessages: action.payload,
      };

    case CHAT_ACTIONS.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
      };

    case CHAT_ACTIONS.SET_SEARCH_LOADING:
      return {
        ...state,
        searchLoading: action.payload,
      };

    case CHAT_ACTIONS.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: action.payload,
      };

    case CHAT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Chat Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new messages
    const handleNewMessage = (data) => {
      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: data.message });
      
      // Show notification if not in current chat
      if (state.currentChat?._id !== data.message.chat) {
        toast.success(`New message from ${data.message.sender.name}`);
      }
    };

    // Handle message updates
    const handleMessageEdited = (data) => {
      dispatch({ 
        type: CHAT_ACTIONS.UPDATE_MESSAGE, 
        payload: {
          _id: data.messageId,
          content: data.newContent,
          isEdited: true,
          editedAt: data.editedAt,
        }
      });
    };

    // Handle message deletion
    const handleMessageDeleted = (data) => {
      dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: data.messageId });
    };

    // Handle typing indicators
    const handleUserTyping = (data) => {
      if (data.userId !== user?._id) {
        dispatch({
          type: CHAT_ACTIONS.SET_TYPING_USER,
          payload: {
            chatId: data.chatId,
            userId: data.userId,
            user: { name: data.name },
          },
        });

        // Remove typing indicator after timeout
        setTimeout(() => {
          dispatch({
            type: CHAT_ACTIONS.REMOVE_TYPING_USER,
            payload: { chatId: data.chatId, userId: data.userId },
          });
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      dispatch({
        type: CHAT_ACTIONS.REMOVE_TYPING_USER,
        payload: { chatId: data.chatId, userId: data.userId },
      });
    };

    // Handle user online/offline status
    const handleUserOnline = (data) => {
      dispatch({
        type: CHAT_ACTIONS.SET_ONLINE_USERS,
        payload: [...state.onlineUsers.filter(u => u.userId !== data.userId), data],
      });
    };

    const handleUserOffline = (data) => {
      dispatch({
        type: CHAT_ACTIONS.SET_ONLINE_USERS,
        payload: state.onlineUsers.filter(u => u.userId !== data.userId),
      });
    };

    // Register socket listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);

    // Cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
    };
  }, [socket, isConnected, state.currentChat, state.onlineUsers, user]);

  // Load chats
  const loadChats = async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      const response = await chatsAPI.getUserChats();
      
      if (response.success) {
        const sortedChats = sortBy(response.data, 'lastActivity', 'desc');
        dispatch({ type: CHAT_ACTIONS.SET_CHATS, payload: sortedChats });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load chats';
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: message });
    }
  };

  // Select chat
  const selectChat = (chat) => {
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: chat });
    // Show last known messages immediately (if any)
    if (chat.messages) {
      dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: chat.messages });
    } else {
      dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
    }
    if (socket) {
      socket.emit('joinChat', chat._id);
    }
    // Load latest messages in the background
    loadMessages(chat._id).then(() => markAllMessagesAsRead(chat._id));
  };

  // Load messages
  const loadMessages = async (chatId, page = 1) => {
    try {
      if (page === 1) {
        dispatch({ type: CHAT_ACTIONS.SET_MESSAGES_LOADING, payload: LOADING_STATES.LOADING });
      }
      
      const response = await messagesAPI.getChatMessages(chatId, page);
      
      if (response.success) {
        const messages = response.data.messages;
        
        if (page === 1) {
          dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: messages });
        } else {
          dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [...messages, ...state.messages] });
        }
        
        dispatch({ 
          type: CHAT_ACTIONS.SET_HAS_MORE_MESSAGES, 
          payload: response.data.pagination.hasMore 
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load messages';
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: message });
    }
  };

  // Send message
  const sendMessage = async (messageData) => {
    // Optimistic UI: add a temporary message
    const tempId = generateRandomId();
    const optimisticMessage = {
      _id: tempId,
      chat: state.currentChat._id,
      sender: user, // from useAuth
      content: messageData.content,
      messageType: messageData.messageType || 'text',
      createdAt: new Date().toISOString(),
      pending: true,
    };
    dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: optimisticMessage });

    try {
      const response = await messagesAPI.sendMessage({
        ...messageData,
        chatId: state.currentChat._id,
      });
      if (response.success) {
        // Replace the optimistic message with the real one
        dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: tempId });
        // Message will be added via socket event
        return { success: true, message: response.data };
      } else {
        dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: tempId });
        toast.error('Failed to send message');
        return { success: false, error: 'Failed to send message' };
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: tempId });
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (isTyping) => {
    if (socket && state.currentChat) {
      if (isTyping) {
        socket.emit('typing', { chatId: state.currentChat._id });
      } else {
        socket.emit('stopTyping', { chatId: state.currentChat._id });
      }
    }
  };

  // Mark all messages as read
  const markAllMessagesAsRead = async (chatId) => {
    try {
      await messagesAPI.markAllMessagesAsRead(chatId);
      dispatch({ 
        type: CHAT_ACTIONS.UPDATE_UNREAD_COUNT, 
        payload: { chatId, count: 0 } 
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Create new chat
  const createChat = async (chatData) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: LOADING_STATES.LOADING });
      
      let response;
      
      if (chatData.chatType === 'group') {
        const formData = new FormData();
        Object.keys(chatData).forEach(key => {
          if (key === 'participants') {
            chatData[key].forEach(participant => {
              formData.append('participants[]', participant);
            });
          } else {
            formData.append(key, chatData[key]);
          }
        });
        
        response = await chatsAPI.createGroupChat(formData);
      } else {
        response = await chatsAPI.getOrCreatePrivateChat(chatData.participants[0]);
      }
      
      if (response.success) {
        dispatch({ type: CHAT_ACTIONS.ADD_CHAT, payload: response.data });
        toast.success('Chat created successfully!');
        return { success: true, chat: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create chat';
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Search messages
  const searchMessages = async (query) => {
    if (!state.currentChat || !query.trim()) {
      dispatch({ type: CHAT_ACTIONS.SET_SEARCH_RESULTS, payload: [] });
      return;
    }

    try {
      dispatch({ type: CHAT_ACTIONS.SET_SEARCH_LOADING, payload: true });
      
      const response = await messagesAPI.searchMessages(state.currentChat._id, query);
      
      if (response.success) {
        dispatch({ type: CHAT_ACTIONS.SET_SEARCH_RESULTS, payload: response.data.messages });
      }
    } catch (error) {
      console.error('Search failed:', error);
      dispatch({ type: CHAT_ACTIONS.SET_SEARCH_RESULTS, payload: [] });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_SEARCH_LOADING, payload: false });
    }
  };

  // Upload and send file
  const sendFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', state.currentChat._id);
      
      const response = await messagesAPI.uploadAndSendFile(formData);
      
      if (response.success) {
        // Message will be added via socket event
        return { success: true, message: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send file';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    chats: state.chats,
    currentChat: state.currentChat,
    messages: state.messages,
    typingUsers: state.typingUsers,
    unreadCounts: state.unreadCounts,
    loading: state.loading,
    messagesLoading: state.messagesLoading,
    error: state.error,
    hasMoreMessages: state.hasMoreMessages,
    searchResults: state.searchResults,
    searchLoading: state.searchLoading,
    onlineUsers: state.onlineUsers,
    
    // Actions
    loadChats,
    selectChat,
    loadMessages,
    sendMessage,
    sendTypingIndicator,
    markAllMessagesAsRead,
    createChat,
    searchMessages,
    sendFile,
    clearError,
    
    // Computed values
    isLoading: state.loading === LOADING_STATES.LOADING,
    isMessagesLoading: state.messagesLoading === LOADING_STATES.LOADING,
    hasError: !!state.error,
    currentChatTypingUsers: state.currentChat ? state.typingUsers[state.currentChat._id] || {} : {},
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};

export default ChatContext;