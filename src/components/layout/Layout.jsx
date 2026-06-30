import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
// import NotificationPanel from './NotificationPanel';
// import SuggestionsPanel from './SuggestionsPanel';
import { useAuth } from '../../contexts/AuthContext';
import { isMobile } from '../../utils/helpers';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(!isMobile());

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);
  const toggleSuggestions = () => setSuggestionsOpen(!suggestionsOpen);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile()) && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-shrink-0 relative z-30"
          >
            <Sidebar 
              onClose={toggleSidebar}
              isOpen={sidebarOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar}
          onToggleNotifications={toggleNotifications}
          onToggleSuggestions={toggleSuggestions}
          sidebarOpen={sidebarOpen}
          notificationsOpen={notificationsOpen}
          suggestionsOpen={suggestionsOpen}
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat area */}
          <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800">
            {children}
          </main>

          {/* Notifications Panel */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-shrink-0 relative z-10"
              >
                {/* <NotificationPanel 
                  onClose={toggleNotifications}
                  isOpen={notificationsOpen}
                /> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions Panel */}
          <AnimatePresence>
            {(suggestionsOpen || !isMobile()) && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-shrink-0 relative z-10"
              >
                {/* <SuggestionsPanel 
                  onClose={toggleSuggestions}
                  isOpen={suggestionsOpen}
                /> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile panels overlay */}
      {(notificationsOpen || (suggestionsOpen && isMobile())) && isMobile() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-5 lg:hidden"
          onClick={() => {
            setNotificationsOpen(false);
            setSuggestionsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Layout;