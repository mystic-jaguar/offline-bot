import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Action types
const ActionTypes = {
  ADD_QUESTION: 'ADD_QUESTION',
  ADD_CATEGORY: 'ADD_CATEGORY',
  CLEAR_ANALYTICS: 'CLEAR_ANALYTICS',
  LOAD_ANALYTICS: 'LOAD_ANALYTICS'
};

// Initial state
const initialState = {
  questions: [],
  categories: {},
  totalQuestions: 0,
  dailyStats: {},
  weeklyStats: {}
};

// Reducer
const analyticsReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_QUESTION:
      const { question, category, timestamp } = action.payload;
      const newQuestion = {
        id: Date.now(),
        question,
        category: category || 'general',
        timestamp: timestamp || new Date().toISOString()
      };
      
      const updatedQuestions = [...state.questions, newQuestion];
      const updatedCategories = {
        ...state.categories,
        [newQuestion.category]: (state.categories[newQuestion.category] || 0) + 1
      };
      
      // Update daily stats
      const date = new Date(newQuestion.timestamp).toDateString();
      const updatedDailyStats = {
        ...state.dailyStats,
        [date]: (state.dailyStats[date] || 0) + 1
      };
      
      return {
        ...state,
        questions: updatedQuestions,
        categories: updatedCategories,
        totalQuestions: updatedQuestions.length,
        dailyStats: updatedDailyStats
      };
      
    case ActionTypes.ADD_CATEGORY:
      const { categoryName } = action.payload;
      return {
        ...state,
        categories: {
          ...state.categories,
          [categoryName]: state.categories[categoryName] || 0
        }
      };
      
    case ActionTypes.CLEAR_ANALYTICS:
      return initialState;
      
    case ActionTypes.LOAD_ANALYTICS:
      return {
        ...state,
        ...action.payload
      };
      
    default:
      return state;
  }
};

export const AnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  // Load analytics from localStorage on mount
  useEffect(() => {
    const savedAnalytics = localStorage.getItem('chatbot_analytics');
    if (savedAnalytics) {
      try {
        const parsed = JSON.parse(savedAnalytics);
        dispatch({ type: ActionTypes.LOAD_ANALYTICS, payload: parsed });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }
  }, []);

  // Save analytics to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('chatbot_analytics', JSON.stringify(state));
  }, [state]);

  // Actions
  const addQuestion = (question, category) => {
    dispatch({
      type: ActionTypes.ADD_QUESTION,
      payload: { question, category, timestamp: new Date().toISOString() }
    });
  };

  const addCategory = (categoryName) => {
    dispatch({
      type: ActionTypes.ADD_CATEGORY,
      payload: { categoryName }
    });
  };

  const clearAnalytics = () => {
    dispatch({ type: ActionTypes.CLEAR_ANALYTICS });
  };

  // Computed values
  const getCategoryChartData = () => {
    return Object.entries(state.categories).map(([name, value]) => ({
      name,
      value,
      fill: getCategoryColor(name)
    }));
  };

  const getDailyChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        questions: state.dailyStats[dateString] || 0,
        date: dateString
      });
    }
    return last7Days;
  };

  const getTopQuestions = (limit = 5) => {
    const questionCounts = {};
    state.questions.forEach(q => {
      questionCounts[q.question] = (questionCounts[q.question] || 0) + 1;
    });
    
    return Object.entries(questionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([question, count]) => ({ question, count }));
  };

  const getCategoryStats = () => {
    const total = Object.values(state.categories).reduce((sum, count) => sum + count, 0);
    return Object.entries(state.categories).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  };

  const value = {
    ...state,
    addQuestion,
    addCategory,
    clearAnalytics,
    getCategoryChartData,
    getDailyChartData,
    getTopQuestions,
    getCategoryStats
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Helper function to get colors for categories
const getCategoryColor = (category) => {
  const colors = {
    'leave_policy': '#3b82f6',
    'hr_contacts': '#10b981',
    'benefits': '#f59e0b',
    'company_timings': '#8b5cf6',
    'code_of_conduct': '#ef4444',
    'departments': '#06b6d4',
    'it_tools': '#84cc16',
    'company_overview': '#f97316',
    'general': '#6b7280'
  };
  return colors[category] || '#6b7280';
};
