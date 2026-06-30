import React, { useState } from 'react';
import { 
  HiOutlineMenu, 
  HiOutlineBell, 
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineCog,
  HiOutlineLogout
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { generateAvatarUrl, getChatDisplayName, getChatDisplayAvatar } from '../../utils/helpers';

const Header = ({ 
  onToggleSidebar, 
  onToggleNotifications, 
  onToggleSuggestions,
  sidebarOpen,
  notificationsOpen,
  suggestionsOpen 
}) => {
  const { user, logout } = useAuth();
  const { currentChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 relative z-40">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {/* Menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <HiOutlineMenu className="h-6 w-6" />
        </button>

        {/* Logo for mobile */}
        <div className="flex items-center lg:hidden">
          <div className="text-xl font-bold text-gradient">
            Chat ONN
          </div>
        </div>

        {/* Current chat info */}
        {currentChat && (
          <div className="hidden lg:flex items-center space-x-3">
            <img
              src={getChatDisplayAvatar(currentChat, user) || generateAvatarUrl(getChatDisplayName(currentChat, user))}
              alt={getChatDisplayName(currentChat, user)}
              className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getChatDisplayName(currentChat, user)}
              </h2>
              {currentChat.chatType === 'private' && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentChat.participants?.find(p => p._id !== user._id)?.isOnline ? 'Online' : 'Offline'}
                </p>
              )}
              {currentChat.chatType === 'group' && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentChat.participants?.length} members
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages, chats, or users..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </form>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        {/* Mobile search button */}
        <button className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          <HiOutlineSearch className="h-6 w-6" />
        </button>

        {/* Notifications button */}
        <button
          onClick={onToggleNotifications}
          className={`relative p-2 rounded-lg transition-colors ${
            notificationsOpen
              ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
          }`}
          aria-label="Toggle notifications"
        >
          <HiOutlineBell className="h-6 w-6" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Suggestions button */}
        <button
          onClick={onToggleSuggestions}
          className={`hidden lg:flex relative p-2 rounded-lg transition-colors ${
            suggestionsOpen
              ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
          }`}
          aria-label="Toggle suggestions"
        >
          <HiOutlineUsers className="h-6 w-6" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="User menu"
          >
            <img
              src={user.avatar || generateAvatarUrl(user.name)}
              alt={user.name}
              className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
            />
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.name}
            </span>
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigate to profile
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HiOutlineCog className="mr-3 h-4 w-4" />
                Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HiOutlineLogout className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile search overlay */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;