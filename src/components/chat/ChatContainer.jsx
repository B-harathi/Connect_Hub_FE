import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { getChatDisplayName, getChatDisplayAvatar, generateAvatarUrl } from '../../utils/helpers';
import { HiOutlineVideoCamera, HiOutlinePhone, HiOutlineDotsVertical } from 'react-icons/hi';

const EmptyState = () => (
  <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center max-w-md px-4">
      <div className="mx-auto h-24 w-24 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
        <svg className="h-12 w-12 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.82L3 21l1.179-6.226A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Select a conversation
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Choose a chat from the sidebar to start messaging, or create a new conversation.
      </p>
    </div>
  </div>
);

const ChatHeader = ({ chat, user }) => {
  const displayName = getChatDisplayName(chat, user);
  const displayAvatar = getChatDisplayAvatar(chat, user);
  
  const getStatusText = () => {
    if (chat.chatType === 'group') {
      return `${chat.participants?.length || 0} members`;
    } else {
      const otherUser = chat.participants?.find(p => p._id !== user._id);
      return otherUser?.isOnline ? 'Online' : 'Offline';
    }
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <img
          src={displayAvatar || generateAvatarUrl(displayName)}
          alt={displayName}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {displayName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getStatusText()}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          <HiOutlinePhone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          <HiOutlineVideoCamera className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          <HiOutlineDotsVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const { chatId } = useParams();
  const { currentChat, selectChat, chats } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (chatId && chats.length > 0 && (!currentChat || currentChat._id !== chatId)) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        selectChat(chat);
      }
    }
  }, [chatId, chats, currentChat, selectChat]);

  if (!currentChat) {
    return <EmptyState />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-white dark:bg-gray-800"
    >
      {/* Chat Header */}
      <ChatHeader chat={currentChat} user={user} />

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList />
        <MessageInput />
      </div>
    </motion.div>
  );
};

export default ChatContainer;