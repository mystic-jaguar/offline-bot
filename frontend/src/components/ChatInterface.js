import React, { useEffect, useRef } from 'react';
import { MessageCircle, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatInterface = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    isConnected,
    clearMessages 
  } = useChat();
  
  const { addQuestion } = useAnalytics();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    try {
      await sendMessage(message);
      // Add to analytics
      addQuestion(message, 'general');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        icon: AlertCircle,
        text: 'Disconnected',
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/20'
      };
    }
    return {
      icon: CheckCircle,
      text: 'Connected',
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-20">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full mb-4 sm:mb-6">
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400" />
              </div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4 px-4">
                  Welcome to ThinkNest Solutions!
                </h1>
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-6 sm:mb-8 px-4">
                I'm your AI-powered induction assistant. Ask me anything about our company, 
                policies, benefits, or procedures. I'm here to help you get started!
              </p>
              
              {/* Quick Question Suggestions */}
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl w-full px-4">
                <button 
                  onClick={() => handleSendMessage("What are the company policies?")}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 text-sm font-medium border border-blue-200 dark:border-blue-800"
                >
                  Company Policies
                </button>
                
                <button 
                  onClick={() => handleSendMessage("What benefits do employees get?")}
                  className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 text-sm font-medium border border-green-200 dark:border-green-800"
                >
                  Employee Benefits
                </button>
                
                <button 
                  onClick={() => handleSendMessage("How do I contact IT support?")}
                  className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 text-sm font-medium border border-purple-200 dark:border-purple-800"
                >
                  IT Support
                </button>
                
                <button 
                  onClick={() => handleSendMessage("What departments are there?")}
                  className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 text-sm font-medium border border-orange-200 dark:border-orange-800"
                >
                  Departments
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.content}
                  isUser={message.type === 'user'}
                  timestamp={message.timestamp}
                  isLoading={false}
                />
              ))}
              
              {isLoading && (
                <ChatMessage
                  message=""
                  isUser={false}
                  isLoading={true}
                />
              )}
              
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </span>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${status.bgColor}`}>
                <StatusIcon className={`w-3 h-3 ${status.color}`} />
                <span className={status.color}>{status.text}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {messages.length} messages
              </span>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Clear Chat
              </button>
            )}
          </div>
          
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;