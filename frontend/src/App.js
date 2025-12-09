import React, { useState } from 'react';
import { MessageSquare, BarChart3, Menu, X, Plus, Settings, User } from 'lucide-react';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import ChatInterface from './components/ChatInterface';
// Removed Analytics panel for users
// import ChatHistoryPanel from './components/ChatHistoryPanel';
import ThemeToggle from './components/ThemeToggle';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import SettingsModal from './components/SettingsModal';

function App() {
  const [activePanel, setActivePanel] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
  const [showSettings, setShowSettings] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    // Clear chat messages and reset to welcome screen
    window.location.reload(); // Simple way to reset the chat
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  return (
    <ThemeProvider>
      <AnalyticsProvider>
        <ChatProvider>
          <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
            {/* ChatGPT-style Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-0'} lg:${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gray-900 dark:bg-gray-800 border-r border-gray-700 dark:border-gray-600 flex flex-col min-h-0`}>
              <div className="p-4 border-b border-gray-700 dark:border-gray-600">
                <button 
                  onClick={handleNewChat}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-white"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">New Chat</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    No previous conversations
                  </div>
                  <div className="text-gray-600 dark:text-gray-500 text-xs mt-1">
                    Start a new chat to begin
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700 dark:border-gray-600">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
            <div className="text-sm font-medium text-white">Employee</div>
            <div className="text-xs text-gray-400">ThinkNest Solutions</div>
                  </div>
                </div>
                <button 
                  onClick={handleSettings}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
              {/* Top Navigation */}
              <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0">
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                    {/* Mobile menu button */}
                    <button
                      onClick={toggleSidebar}
                      className="lg:hidden p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    >
                      {sidebarOpen ? (
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <div className="p-1 sm:p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex-shrink-0">
                        <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  ThinkNest Solutions
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  Employee Induction Assistant
                </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
                    <nav className="flex space-x-1">
                      <button
                        onClick={() => setActivePanel('chat')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activePanel === 'chat'
                            ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Chat</span>
                        </div>
                      </button>
                      
                      {false && (
                        <button
                          onClick={() => setActivePanel('analytics')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activePanel === 'analytics'
                              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Analytics</span>
                          </div>
                        </button>
                      )}
                      <button
                        onClick={() => setIsAdminMode(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        Admin
                      </button>
                    </nav>
                    
                    <ThemeToggle />
                  </div>

                  {/* Mobile Theme Toggle */}
                  <div className="lg:hidden flex-shrink-0">
                    <ThemeToggle />
                  </div>
                </div>
              </header>

              {/* Content Area */}
              <main className="flex-1 flex flex-col overflow-hidden">
                {isAdminMode ? (
                  isAuthenticated ? (
                    <AdminDashboard />
                  ) : (
                    <AdminLogin onSuccess={() => { setIsAuthenticated(true); }} />
                  )
                ) : (
                  <ChatInterface />
                )}
              </main>
            </div>
          </div>

          {/* Settings Modal */}
          <SettingsModal 
            isOpen={showSettings} 
            onClose={closeSettings} 
          />
        </ChatProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}

export default App;