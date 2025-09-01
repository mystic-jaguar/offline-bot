import React, { useState, KeyboardEvent } from 'react';
import { Send, Zap, AlignLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  answerMode: 'short' | 'detailed';
  onAnswerModeChange: (mode: 'short' | 'detailed') => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false, answerMode, onAnswerModeChange }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const baseButtonClasses = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900";

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 transition-colors duration-300">
      <div className="flex items-center justify-end gap-2 mb-3">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mr-1">Answer Style:</span>
        <button
          onClick={() => onAnswerModeChange('short')}
          className={`${baseButtonClasses} ${
            answerMode === 'short'
              ? 'bg-zinc-800 dark:bg-zinc-600 text-white shadow-md ring-2 ring-zinc-500'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:ring-zinc-400'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Short
        </button>
        <button
          onClick={() => onAnswerModeChange('detailed')}
          className={`${baseButtonClasses} ${
            answerMode === 'detailed'
              ? 'bg-zinc-800 dark:bg-zinc-600 text-white shadow-md ring-2 ring-zinc-500'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:ring-zinc-400'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          Detailed
        </button>
      </div>
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Upload a text file to start chatting..." : "Ask me anything..."}
          disabled={disabled}
          className="flex-1 resize-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors duration-300"
          rows={1}
          style={{
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
            height: Math.min(120, Math.max(40, message.split('\n').length * 20 + 20))
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
