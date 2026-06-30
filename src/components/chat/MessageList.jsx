import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageItem from './MessageItem';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { groupBy } from '../../utils/helpers';
import { format, isToday, isYesterday } from 'date-fns';

const TypingIndicator = ({ typingUsers }) => {
  const typingUserNames = Object.values(typingUsers).map(user => user.name);
  
  if (typingUserNames.length === 0) return null;

  const getTypingText = () => {
    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
    } else {
      return `${typingUserNames.length} people are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2 px-6 py-2"
    >
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {getTypingText()}
      </span>
    </motion.div>
  );
};

const DateSeparator = ({ date }) => {
  const getDateText = () => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM dd, yyyy');
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {getDateText()}
        </span>
      </div>
    </div>
  );
};

const LoadingMessages = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
  </div>
);

const MessageList = () => {
  const { 
    messages, 
    isMessagesLoading, 
    hasMoreMessages, 
    loadMessages, 
    currentChat,
    currentChatTypingUsers 
  } = useChat();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Check scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      setIsAtBottom(distanceFromBottom < 100);
      setShowScrollButton(distanceFromBottom > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadMore = async () => {
    if (!hasMoreMessages || isMessagesLoading || !currentChat) return;

    const container = messagesContainerRef.current;
    const scrollHeight = container.scrollHeight;
    
    await loadMessages(currentChat._id, Math.ceil(messages.length / 50) + 1);
    
    // Maintain scroll position after loading more messages
    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - scrollHeight;
    });
  };

  // Group messages by date
  const groupedMessages = groupBy(messages, message => {
    const date = new Date(message.createdAt);
    return format(date, 'yyyy-MM-dd');
  });

  const sortedDates = Object.keys(groupedMessages).sort();

  if (isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingMessages />
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-1 relative"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Load more button */}
      {hasMoreMessages && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={isMessagesLoading}
            className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isMessagesLoading ? 'Loading...' : 'Load more messages'}
          </button>
        </div>
      )}

      {/* Messages grouped by date */}
      {sortedDates.map(dateStr => (
        <div key={dateStr}>
          <DateSeparator date={new Date(dateStr)} />
          <div className="space-y-1">
            {groupedMessages[dateStr].map((message, index) => {
              const prevMessage = index > 0 ? groupedMessages[dateStr][index - 1] : null;
              const nextMessage = index < groupedMessages[dateStr].length - 1 ? groupedMessages[dateStr][index + 1] : null;
              
              const isFirstInGroup = !prevMessage || prevMessage.sender._id !== message.sender._id;
              const isLastInGroup = !nextMessage || nextMessage.sender._id !== message.sender._id;
              
              return (
                <MessageItem
                  key={message._id}
                  message={message}
                  isOwn={message.sender._id === user._id}
                  showAvatar={isLastInGroup}
                  showSender={isFirstInGroup && currentChat.chatType === 'group'}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      <AnimatePresence>
        {Object.keys(currentChatTypingUsers).length > 0 && (
          <TypingIndicator typingUsers={currentChatTypingUsers} />
        )}
      </AnimatePresence>

      {/* Connection status */}
      {!isConnected && (
        <div className="flex items-center justify-center py-2">
          <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
            Reconnecting...
          </div>
        </div>
      )}

      {/* Scroll to bottom anchor */}
      <div ref={messagesEndRef} />

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;