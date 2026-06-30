import { chatsAPI, messagesAPI, usersAPI } from './api';

class ChatService {
  constructor() {
    this.chats = [];
    this.currentChat = null;
    this.messages = {};
    this.onlineUsers = [];
  }

  // Get all user chats
  async getUserChats() {
    try {
      const response = await chatsAPI.getUserChats();
      
      if (response.success) {
        this.chats = response.data;
        return { success: true, chats: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load chats' 
      };
    }
  }

  // Get or create private chat
  async getOrCreatePrivateChat(userId) {
    try {
      const response = await chatsAPI.getOrCreatePrivateChat(userId);
      
      if (response.success) {
        const chat = response.data;
        
        // Add to chats if new
        const existingChatIndex = this.chats.findIndex(c => c._id === chat._id);
        if (existingChatIndex === -1) {
          this.chats.unshift(chat);
        }
        
        return { success: true, chat };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create chat' 
      };
    }
  }

  // Create group chat
  async createGroupChat(chatData) {
    try {
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
      
      const response = await chatsAPI.createGroupChat(formData);
      
      if (response.success) {
        const chat = response.data;
        this.chats.unshift(chat);
        
        return { success: true, chat };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create group chat' 
      };
    }
  }

  // Get chat messages
  async getChatMessages(chatId, page = 1, limit = 50) {
    try {
      const response = await messagesAPI.getChatMessages(chatId, page, limit);
      
      if (response.success) {
        const messages = response.data.messages;
        
        // Store messages in cache
        if (!this.messages[chatId]) {
          this.messages[chatId] = [];
        }
        
        if (page === 1) {
          this.messages[chatId] = messages;
        } else {
          this.messages[chatId] = [...messages, ...this.messages[chatId]];
        }
        
        return { 
          success: true, 
          messages,
          pagination: response.data.pagination
        };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load messages' 
      };
    }
  }

  // Send message
  async sendMessage(messageData) {
    try {
      const response = await messagesAPI.sendMessage(messageData);
      
      if (response.success) {
        const message = response.data;
        
        // Add to local messages cache
        if (this.messages[messageData.chatId]) {
          this.messages[messageData.chatId].push(message);
        }
        
        // Update chat's last message
        const chatIndex = this.chats.findIndex(c => c._id === messageData.chatId);
        if (chatIndex !== -1) {
          this.chats[chatIndex].lastMessage = message;
          this.chats[chatIndex].lastActivity = message.createdAt;
        }
        
        return { success: true, message };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send message' 
      };
    }
  }

  // Upload and send file
  async sendFile(file, chatId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);
      
      const response = await messagesAPI.uploadAndSendFile(formData);
      
      if (response.success) {
        const message = response.data;
        
        // Add to local messages cache
        if (this.messages[chatId]) {
          this.messages[chatId].push(message);
        }
        
        // Update chat's last message
        const chatIndex = this.chats.findIndex(c => c._id === chatId);
        if (chatIndex !== -1) {
          this.chats[chatIndex].lastMessage = message;
          this.chats[chatIndex].lastActivity = message.createdAt;
        }
        
        return { success: true, message };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send file' 
      };
    }
  }

  // Search users
  async searchUsers(query) {
    try {
      const response = await usersAPI.searchUsers(query);
      
      if (response.success) {
        return { success: true, users: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Search failed' 
      };
    }
  }

  // Search messages
  async searchMessages(chatId, query) {
    try {
      const response = await messagesAPI.searchMessages(chatId, query);
      
      if (response.success) {
        return { 
          success: true, 
          messages: response.data.messages,
          count: response.data.count
        };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Search failed' 
      };
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId, messageIds) {
    try {
      if (messageIds && messageIds.length > 0) {
        // Mark specific messages as read
        await Promise.all(
          messageIds.map(messageId => messagesAPI.markMessageAsRead(messageId))
        );
      } else {
        // Mark all messages as read
        await messagesAPI.markAllMessagesAsRead(chatId);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark messages as read' 
      };
    }
  }

  // Add message reaction
  async addReaction(messageId, emoji) {
    try {
      const response = await messagesAPI.addReaction(messageId, emoji);
      
      if (response.success) {
        return { success: true, reactions: response.data.reactions };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add reaction' 
      };
    }
  }

  // Remove message reaction
  async removeReaction(messageId) {
    try {
      const response = await messagesAPI.removeReaction(messageId);
      
      if (response.success) {
        return { success: true, reactions: response.data.reactions };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove reaction' 
      };
    }
  }

  // Edit message
  async editMessage(messageId, content) {
    try {
      const response = await messagesAPI.editMessage(messageId, content);
      
      if (response.success) {
        // Update message in local cache
        Object.keys(this.messages).forEach(chatId => {
          const messageIndex = this.messages[chatId].findIndex(m => m._id === messageId);
          if (messageIndex !== -1) {
            this.messages[chatId][messageIndex] = {
              ...this.messages[chatId][messageIndex],
              content,
              isEdited: true,
              editedAt: new Date()
            };
          }
        });
        
        return { success: true, message: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to edit message' 
      };
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await messagesAPI.deleteMessage(messageId);
      
      if (response.success) {
        // Remove message from local cache
        Object.keys(this.messages).forEach(chatId => {
          this.messages[chatId] = this.messages[chatId].filter(m => m._id !== messageId);
        });
        
        return { success: true };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete message' 
      };
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await messagesAPI.getUnreadCount();
      
      if (response.success) {
        return { 
          success: true, 
          totalCount: response.data.totalUnreadCount,
          chatCounts: response.data.chatUnreadCounts
        };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get unread count' 
      };
    }
  }

  // Update chat
  async updateChat(chatId, updateData) {
    try {
      const response = await chatsAPI.updateChat(chatId, updateData);
      
      if (response.success) {
        const updatedChat = response.data;
        
        // Update chat in local cache
        const chatIndex = this.chats.findIndex(c => c._id === chatId);
        if (chatIndex !== -1) {
          this.chats[chatIndex] = { ...this.chats[chatIndex], ...updatedChat };
        }
        
        if (this.currentChat && this.currentChat._id === chatId) {
          this.currentChat = { ...this.currentChat, ...updatedChat };
        }
        
        return { success: true, chat: updatedChat };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update chat' 
      };
    }
  }

  // Leave chat
  async leaveChat(chatId) {
    try {
      const response = await chatsAPI.leaveChat(chatId);
      
      if (response.success) {
        // Remove chat from local cache
        this.chats = this.chats.filter(c => c._id !== chatId);
        
        if (this.currentChat && this.currentChat._id === chatId) {
          this.currentChat = null;
        }
        
        // Clear messages cache for this chat
        delete this.messages[chatId];
        
        return { success: true };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to leave chat' 
      };
    }
  }

  // Get online users
  async getOnlineUsers() {
    try {
      const response = await usersAPI.getOnlineUsers();
      
      if (response.success) {
        this.onlineUsers = response.data;
        return { success: true, users: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get online users' 
      };
    }
  }

  // Get current chat
  getCurrentChat() {
    return this.currentChat;
  }

  // Set current chat
  setCurrentChat(chat) {
    this.currentChat = chat;
  }

  // Get messages for chat
  getMessagesForChat(chatId) {
    return this.messages[chatId] || [];
  }

  // Clear all data
  clearData() {
    this.chats = [];
    this.currentChat = null;
    this.messages = {};
    this.onlineUsers = [];
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;