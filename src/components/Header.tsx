import React from 'react';
import { MessageSquare, Download, Trash2, Sun, Moon, LogOut, Shield, User } from 'lucide-react';
import { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  messages: Message[];
  onClearChat: () => void;
  onExportChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ messages, onClearChat, onExportChat }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Offline ChatGPT</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Chat with your own data, completely offline</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg mr-2">
              {user.role === 'admin' ? (
                <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
              ) : (
                <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              )}
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {user.username} ({user.role})
              </span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
          
          {messages.length > 0 && (
            <>
              <button
                onClick={onExportChat}
                className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="Export chat history"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={onClearChat}
                className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
