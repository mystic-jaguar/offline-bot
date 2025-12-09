import React, { useState, useEffect } from 'react';
import { X, User, Bell, Shield, Palette, Database, Info, MessageSquare, Search, Filter, Calendar, Building } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [settings, setSettings] = useState({
    soundNotifications: false,
    desktopNotifications: false,
    saveChatHistory: true,
    analyticsTracking: true,
  });

  // Real questions data from knowledge base
  const [questionsHistory, setQuestionsHistory] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Fetch questions from knowledge base
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const response = await fetch('http://localhost:5000/api/knowledge-base');
        const data = await response.json();
        if (data.success) {
          setQuestionsHistory(data.questions);
        } else {
          console.error('Failed to fetch questions:', data.error);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    if (activeTab === 'questions') {
      fetchQuestions();
    }
  }, [activeTab]);

  const departments = [
    { id: 'all', name: 'All Departments', icon: Building },
    { id: 'HR', name: 'Human Resources', icon: User },
    { id: 'IT', name: 'Information Technology', icon: Database },
    { id: 'General', name: 'General', icon: MessageSquare }
  ];

  const filteredQuestions = questionsHistory.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || q.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const groupedQuestions = filteredQuestions.reduce((acc, question) => {
    if (!acc[question.department]) {
      acc[question.department] = [];
    }
    acc[question.department].push(question);
    return acc;
  }, {});

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleExportData = () => {
    // Create a simple export functionality
    const data = {
      settings,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'techNest-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'questions'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Knowledge Base
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
            {activeTab === 'general' ? (
              <div className="space-y-6">
                {/* Appearance */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Appearance</span>
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Sound Notifications</span>
                      <button 
                        onClick={() => handleToggle('soundNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.soundNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Desktop Notifications</span>
                      <button 
                        onClick={() => handleToggle('desktopNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.desktopNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.desktopNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                  </div>
                </div>

                {/* Privacy */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Privacy</span>
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Save Chat History</span>
                      <button 
                        onClick={() => handleToggle('saveChatHistory')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.saveChatHistory ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.saveChatHistory ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Analytics Tracking</span>
                      <button 
                        onClick={() => handleToggle('analyticsTracking')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.analyticsTracking ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.analyticsTracking ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                  </div>
                </div>

                {/* Data */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Data Management</span>
                  </h3>
                  <div className="space-y-2">
                    <button 
                      onClick={handleExportData}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">Export Chat History</span>
                    </button>
                    <button 
                      onClick={handleClearData}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">Clear All Data</span>
                    </button>
                  </div>
                </div>

                {/* About */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Info className="w-4 h-4" />
                    <span>About</span>
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ThinkNest Solutions Employee Induction Assistant
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Version 1.0.0 • Powered by AI
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search knowledge base..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {departments.map((dept) => {
                      const IconComponent = dept.icon;
                      return (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedDepartment(dept.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedDepartment === dept.id
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="hidden sm:inline">{dept.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {isLoadingQuestions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading knowledge base...</p>
                    </div>
                  ) : Object.keys(groupedQuestions).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No questions found matching your search.' : 'No questions found for this department.'}
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupedQuestions).map(([department, questions]) => (
                      <div key={department} className="space-y-3">
                        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          {(() => {
                            const dept = departments.find(d => d.id === department);
                            const IconComponent = dept?.icon || Building;
                            return <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
                          })()}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {department} ({questions.length})
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {questions.map((question) => (
                            <div
                              key={question.id}
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {question.question}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
