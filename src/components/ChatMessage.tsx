import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex gap-4 p-4 transition-colors duration-300 ${
      message.isUser 
        ? 'bg-white dark:bg-zinc-900' 
        : 'bg-zinc-50 dark:bg-zinc-800'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.isUser 
          ? 'bg-zinc-700 text-white' 
          : 'bg-zinc-500 text-white'
      }`}>
        {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {message.isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
