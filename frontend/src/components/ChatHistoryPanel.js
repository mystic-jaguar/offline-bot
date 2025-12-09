import React, { useState } from 'react';
import { History, BarChart3, Trash2, Download, Calendar, MessageSquare } from 'lucide-react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import AnalyticsCharts from './AnalyticsCharts';

const ChatHistoryPanel = () => {
  const { 
    questions, 
    clearAnalytics, 
    getCategoryStats,
    totalQuestions 
  } = useAnalytics();
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAnalytics = () => {
    clearAnalytics();
    setShowClearConfirm(false);
  };

  const exportData = () => {
    const data = {
      questions,
      totalQuestions,
      categoryStats: getCategoryStats(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupQuestionsByDate = () => {
    const groups = {};
    questions.forEach(q => {
      const date = new Date(q.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(q);
    });
    return groups;
  };

  const groupedQuestions = groupQuestionsByDate();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <History className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Chat History & Analytics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalQuestions} questions analyzed
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportData}
            className="btn-secondary flex items-center space-x-2"
            disabled={questions.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-secondary flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            disabled={questions.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
        
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'analytics' ? (
          <div className="p-6">
            <AnalyticsCharts />
          </div>
        ) : (
          <div className="p-6">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No chat history yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start asking questions to see your chat history here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedQuestions)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .map(([date, dayQuestions]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({dayQuestions.length} questions)
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {dayQuestions
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                          .map((question, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {question.question}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(question.timestamp)}
                                    </span>
                                    {question.category && (
                                      <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full">
                                        {question.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Clear Analytics Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to clear all analytics data? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAnalytics}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryPanel;
