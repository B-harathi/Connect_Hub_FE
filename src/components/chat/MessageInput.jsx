import React, { useState, useRef, useCallback } from 'react';
import { HiOutlinePaperClip, HiOutlineEmojiHappy, HiOutlinePaperAirplane, HiOutlineMicrophone } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../../contexts/ChatContext';
import { useSocket } from '../../contexts/SocketContext';
import { debounce } from '../../utils/helpers';
import FileUpload from './FileUpload';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { sendMessage, currentChat, sendTypingIndicator } = useChat();
  const { isConnected } = useSocket();
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Debounced typing indicator
  const debouncedStopTyping = useCallback(
    debounce(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 3000),
    [sendTypingIndicator]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }

    if (value.trim()) {
      debouncedStopTyping();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !currentChat || !isConnected) return;

    const messageData = {
      content: message.trim(),
      messageType: 'text',
    };

    // Clear input immediately for better UX
    setMessage('');
    setIsTyping(false);
    sendTypingIndicator(false);

    try {
      await sendMessage(messageData);
      textareaRef.current?.focus();
    } catch (error) {
      // If message fails, restore the message
      setMessage(message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newMessage);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setShowFileUpload(true);
      // Reset input
      e.target.value = '';
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // TODO: Implement voice recording
    console.log('Start voice recording');
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // TODO: Implement voice recording
    console.log('Stop voice recording');
  };

  const canSend = message.trim() && currentChat && isConnected;

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* File Upload Modal */}
      <AnimatePresence>
        {showFileUpload && (
          <FileUpload
            onClose={() => setShowFileUpload(false)}
            onUpload={(files) => {
              // TODO: Handle file upload
              console.log('Upload files:', files);
              setShowFileUpload(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 relative">
            {/* File Attachment */}
            <button
              type="button"
              onClick={handleFileSelect}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              disabled={!currentChat}
            >
              <HiOutlinePaperClip className="h-5 w-5" />
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Emoji Picker Button and Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-lg transition-colors ${
                  showEmojiPicker
                    ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                }`}
                disabled={!currentChat}
              >
                <HiOutlineEmojiHappy className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 bottom-full mb-2 z-50"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                        height={400}
                        width={350}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                !currentChat 
                  ? "Select a chat to start messaging"
                  : !isConnected 
                  ? "Connecting..." 
                  : "Type your message..."
              }
              disabled={!currentChat || !isConnected}
              minRows={1}
              maxRows={6}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Character count */}
            {message.length > 800 && (
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {message.length}/1000
              </div>
            )}
          </div>

          {/* Send/Voice Button */}
          <div className="flex items-center">
            {canSend ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
              >
                <HiOutlinePaperAirplane className="h-5 w-5" />
              </motion.button>
            ) : (
              <button
                type="button"
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onMouseLeave={stopVoiceRecording}
                onTouchStart={startVoiceRecording}
                onTouchEnd={stopVoiceRecording}
                className={`p-3 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}
                disabled={!currentChat || !isConnected}
              >
                <HiOutlineMicrophone className="h-5 w-5" />
              </button>
            )}
          </div>
        </form>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-2 text-center">
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              Reconnecting...
            </span>
          </div>
        )}

        {/* Voice Recording Indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 flex items-center justify-center space-x-2 text-red-500"
            >
              <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Recording... Release to send</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;