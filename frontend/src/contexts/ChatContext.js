// Chat Context for State Management

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/apiService';

// Initial state
const initialState = {
  messages: [],
  isLoading: false,
  error: null,
  sessionId: null,
  suggestions: [],
  categories: [],
  isConnected: false,
  userPreferences: {
    theme: 'light',
    fontSize: 'medium',
    soundEnabled: true,
  },
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  SET_SESSION_ID: 'SET_SESSION_ID',
  SET_SUGGESTIONS: 'SET_SUGGESTIONS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ActionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isLoading: false,
        error: null,
      };
    
    case ActionTypes.SET_MESSAGES:
      return { ...state, messages: action.payload };
    
    case ActionTypes.SET_SESSION_ID:
      return { ...state, sessionId: action.payload };
    
    case ActionTypes.SET_SUGGESTIONS:
      return { ...state, suggestions: action.payload };
    
    case ActionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case ActionTypes.SET_CONNECTED:
      return { ...state, isConnected: action.payload };
    
    case ActionTypes.SET_USER_PREFERENCES:
      return { ...state, userPreferences: { ...state.userPreferences, ...action.payload } };
    
    case ActionTypes.CLEAR_MESSAGES:
      return { ...state, messages: [] };
    
    default:
      return state;
  }
};

// Context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize session ID
  useEffect(() => {
    const sessionId = localStorage.getItem('chatbot_session_id') || 
                     `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    dispatch({ type: ActionTypes.SET_SESSION_ID, payload: sessionId });
    localStorage.setItem('chatbot_session_id', sessionId);
  }, []);

  // Check connection on mount (debounced to avoid duplicate calls in strict mode)
  useEffect(() => {
    let didRun = false;
    const run = async () => {
      if (didRun) return;
      didRun = true;
      await checkConnection();
    };
    run();
    return () => { didRun = true; };
  }, []);

  // Load user preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user_preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: ActionTypes.SET_USER_PREFERENCES, payload: preferences });
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }, []);

  // Save user preferences
  const saveUserPreferences = (preferences) => {
    const newPreferences = { ...state.userPreferences, ...preferences };
    dispatch({ type: ActionTypes.SET_USER_PREFERENCES, payload: newPreferences });
    localStorage.setItem('user_preferences', JSON.stringify(newPreferences));
  };

  // Check connection
  const checkConnection = async () => {
    try {
      await apiService.healthCheck();
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: true });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
    }
  };

  // Send message
  const sendMessage = async (question) => {
    if (!question.trim()) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: ActionTypes.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await apiService.sendMessage(question, state.sessionId);
      
      const assistantMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        type: 'assistant',
        content: response.answer,
        confidence: response.confidence,
        matchType: response.match_type,
        timestamp: response.timestamp,
      };

      dispatch({ type: ActionTypes.ADD_MESSAGE, payload: assistantMessage });
    } catch (error) {
      const errorMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact HR for assistance.',
        isError: true,
        timestamp: new Date().toISOString(),
      };

      dispatch({ type: ActionTypes.ADD_MESSAGE, payload: errorMessage });
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Load suggestions
  const loadSuggestions = async () => {
    try {
      const response = await apiService.getSuggestions();
      dispatch({ type: ActionTypes.SET_SUGGESTIONS, payload: response.suggestions });
    } catch (error) {
      console.error('Error loading suggestions:', error);
      // Set default suggestions if API fails
      dispatch({ type: ActionTypes.SET_SUGGESTIONS, payload: [
        "What is the leave policy?",
        "How do I contact HR?",
        "What are the company benefits?",
        "What time does work start?"
      ]});
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      dispatch({ type: ActionTypes.SET_CATEGORIES, payload: response.categories });
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set default categories if API fails
      dispatch({ type: ActionTypes.SET_CATEGORIES, payload: [
        "leave_policy", "hr_contacts", "it_support", "benefits", "company_timings"
      ]});
    }
  };

  // Clear messages
  const clearMessages = () => {
    dispatch({ type: ActionTypes.CLEAR_MESSAGES });
  };

  // Load conversation history
  const loadHistory = async () => {
    if (!state.sessionId) return;

    try {
      const response = await apiService.getHistory(state.sessionId);
      dispatch({ type: ActionTypes.SET_MESSAGES, payload: response.history });
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const value = {
    ...state,
    sendMessage,
    loadSuggestions,
    loadCategories,
    clearMessages,
    loadHistory,
    checkConnection,
    saveUserPreferences,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
