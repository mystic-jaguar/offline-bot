import React from 'react';
import { User, Bot, Clock, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const ChatMessage = ({ message, isUser, timestamp, isLoading = false }) => {
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`group flex items-start space-x-2 sm:space-x-4 mb-4 sm:mb-6 animate-slide-up ${
      isUser ? 'flex-row-reverse space-x-reverse' : ''
    }`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
          : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 shadow-sm'
      }`}>
        {isUser ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[90%] sm:max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`relative inline-block ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          <div className={`inline-block px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700'
          }`}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm opacity-70">Thinking...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {message}
              </div>
            )}
          </div>
          
          {/* Copy button for AI messages */}
          {!isUser && !isLoading && message && (
            <button
              onClick={handleCopy}
              className="absolute -right-6 sm:-right-8 top-1 sm:top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>
        
        {/* Timestamp */}
        {timestamp && (
          <div className={`flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;