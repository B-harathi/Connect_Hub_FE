import React, { useState, useEffect } from 'react';
import { 
  HiOutlineX, 
  HiOutlinePlus, 
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineUsers,
  HiOutlineChat,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  formatChatTime, 
  getChatDisplayName, 
  getChatDisplayAvatar, 
  getLastMessagePreview,
  generateAvatarUrl,
  truncateText
} from '../../utils/helpers';
import { isMobile } from '../../utils/helpers';
import { usersAPI } from '../../services/api';
import UserList from '../UserList';

const ChatItem = ({ chat, isActive, onClick, unreadCount }) => {
  const { user } = useAuth();
  
  const displayName = getChatDisplayName(chat, user);
  const displayAvatar = getChatDisplayAvatar(chat, user);
  const lastMessagePreview = getLastMessagePreview(chat.lastMessage);
  const lastMessageTime = formatChatTime(chat.lastActivity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer transition-all duration-200 border-l-3 ${
        isActive
          ? 'bg-purple-50 dark:bg-purple-900/20 border-l-purple-500 shadow-sm'
          : 'border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={displayAvatar || generateAvatarUrl(displayName)}
          alt={displayName}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
        />
        {/* Online indicator for private chats */}
        {chat.chatType === 'private' && (
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full ring-2 ring-white dark:ring-gray-800"></div>
        )}
        {/* Group chat indicator */}
        {chat.chatType === 'group' && (
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center">
            <HiOutlineUserGroup className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Chat info */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-semibold truncate ${
            isActive ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'
          }`}>
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
            {lastMessageTime}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {lastMessagePreview}
          </p>
          
          {/* Unread count */}
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Sidebar = ({ onClose, isOpen }) => {
  const { chats, loadChats, selectChat, currentChat, isLoading, unreadCounts } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, private, groups
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  // Add state for direct chat user picker
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  // Add state for group chat creation
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupResults, setGroupResults] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState('');
  const { user } = useAuth();
  const { createChat, setCreateChat } = useChat();

  useEffect(() => {
    loadChats();
  }, []);

  // Fetch users when userSearch changes and user picker is open
  useEffect(() => {
    let active = true;
    if (showUserPicker && userSearch.length > 0) {
      setUserLoading(true);
      setUserError('');
      usersAPI.searchUsers(userSearch)
        .then(res => {
          if (active) {
            // Support both res.data.data (wrapped) and res.data (array)
            let users = Array.isArray(res.data) ? res.data : res.data?.data;
            if (!Array.isArray(users)) users = [];
            // Exclude current user
            setUserResults(users.filter(u => u._id !== user._id));
          }
        })
        .catch(err => {
          if (active) {
            // Try to show the actual error message from the backend if available
            let message = 'Failed to fetch users';
            if (err.response && err.response.data && err.response.data.message) {
              message = err.response.data.message;
            } else if (err.message) {
              message = err.message;
            }
            setUserError(message);
          }
        })
        .finally(() => {
          if (active) setUserLoading(false);
        });
    } else {
      setUserResults([]);
    }
    return () => { active = false; };
  }, [userSearch, showUserPicker, user]);

  // Fetch users for group search
  useEffect(() => {
    let active = true;
    if (showGroupModal && groupSearch.length > 0) {
      setGroupLoading(true);
      setGroupError('');
      usersAPI.searchUsers(groupSearch)
        .then(res => {
          let users = Array.isArray(res.data) ? res.data : res.data?.data;
          if (!Array.isArray(users)) users = [];
          setGroupResults(users.filter(u => u._id !== user._id));
        })
        .catch(err => {
          let message = 'Failed to fetch users';
          if (err.response && err.response.data && err.response.data.message) {
            message = err.response.data.message;
          } else if (err.message) {
            message = err.message;
          }
          setGroupError(message);
        })
        .finally(() => {
          if (active) setGroupLoading(false);
        });
    } else {
      setGroupResults([]);
    }
    return () => { active = false; };
  }, [groupSearch, showGroupModal, user]);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = getChatDisplayName(chat, {}).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'private' && chat.chatType === 'private') ||
      (filter === 'groups' && chat.chatType === 'group');
    
    return matchesSearch && matchesFilter;
  });

  const handleChatSelect = (chat) => {
    selectChat(chat);
    if (isMobile()) {
      onClose();
    }
  };

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gradient">Chat ONN</h1>
            {totalUnreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </div>
          
          {isMobile() && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              filter === 'private'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setFilter('groups')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              filter === 'groups'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <HiOutlineChat className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
              {searchQuery ? 'Try a different search term' : 'Start a conversation to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={currentChat?._id === chat._id}
                onClick={() => handleChatSelect(chat)}
                unreadCount={unreadCounts[chat._id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* New chat button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowNewChatModal(true)}
          className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <HiOutlinePlus className="h-5 w-5 mr-2" />
          New Chat
        </button>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Start New Chat
                </h2>
                <button
                  onClick={() => { setShowNewChatModal(false); setShowUserPicker(false); }}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <button
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowUserPicker(true)}
                >
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                    <HiOutlineUsers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Start Direct Chat</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chat with a specific person</p>
                  </div>
                </button>
                <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowGroupModal(true)}
                >
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <HiOutlineUserGroup className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Create Group</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start a group conversation</p>
                  </div>
                </button>
              </div>
              {/* User Picker Modal */}
              {showUserPicker && (
                <div className="mt-6">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="block w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  {userLoading && <div className="text-center py-2">Loading...</div>}
                  {/* Only show error if there are no results */}
                  {!userLoading && userError && userResults.length === 0 && (
                    <div className="text-center text-red-500 py-2">{userError}</div>
                  )}
                  {!userLoading && userResults.length > 0 && (
                    <UserList
                      users={userResults}
                      createChat={createChat}
                      selectChat={selectChat}
                      onUserClick={async (user) => {
                        // Start direct chat
                        setUserLoading(true);
                        try {
                          const result = await createChat({ chatType: 'private', participants: [user._id] });
                          if (result.success) {
                            selectChat(result.chat);
                            setShowNewChatModal(false);
                            setShowUserPicker(false);
                          } else {
                            alert(result.error || 'Could not start chat');
                          }
                        } finally {
                          setUserLoading(false);
                        }
                      }}
                    />
                  )}
                  {!userLoading && userResults.length === 0 && userSearch.length > 0 && !userError && (
                    <div className="text-center text-gray-500 py-2">No users found.</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* Group Chat Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Group</h2>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Group Name"
                className="block w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <textarea
                value={groupDesc}
                onChange={e => setGroupDesc(e.target.value)}
                placeholder="Description (optional)"
                className="block w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                rows={2}
              />
              <input
                type="text"
                value={groupSearch}
                onChange={e => setGroupSearch(e.target.value)}
                placeholder="Add users..."
                className="block w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              {groupLoading && <div className="text-center py-2">Loading...</div>}
              {!groupLoading && groupError && groupResults.length === 0 && (
                <div className="text-center text-red-500 py-2">{groupError}</div>
              )}
              {!groupLoading && groupResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {groupResults.map(u => (
                    <div key={u._id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <span>{u.name}</span>
                      <button
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                        onClick={() => setGroupUsers(prev => prev.some(user => user._id === u._id) ? prev : [...prev, u])}
                        disabled={groupUsers.some(user => user._id === u._id)}
                      >
                        {groupUsers.some(user => user._id === u._id) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {groupUsers.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Selected Users:</div>
                  <div className="flex flex-wrap gap-2">
                    {groupUsers.map(u => (
                      <div key={u._id} className="flex items-center bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                        <span>{u.name}</span>
                        <button
                          className="ml-1 text-xs text-red-500 hover:text-red-700"
                          onClick={() => setGroupUsers(prev => prev.filter(user => user._id !== u._id))}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                disabled={!groupName.trim() || groupUsers.length === 0 || groupLoading}
                onClick={async () => {
                  setGroupLoading(true);
                  setGroupError('');
                  try {
                    const result = await createChat({
                      chatType: 'group',
                      chatName: groupName.trim(),
                      description: groupDesc.trim(),
                      participants: groupUsers.map(u => u._id),
                    });
                    if (result.success) {
                      selectChat(result.chat);
                      setShowGroupModal(false);
                      setGroupName('');
                      setGroupDesc('');
                      setGroupUsers([]);
                      setGroupSearch('');
                      setGroupResults([]);
                    } else {
                      setGroupError(result.error || 'Could not create group');
                    }
                  } catch (err) {
                    setGroupError(err.message || 'Could not create group');
                  } finally {
                    setGroupLoading(false);
                  }
                }}
              >
                Create Group
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;