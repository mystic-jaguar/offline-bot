// Frontend Configuration

const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Chat Configuration
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_LENGTH: 50,
  
  // UI Configuration
  THEME: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280'
  },
  
  // Animation Configuration
  ANIMATION_DURATION: 300,
  
  // Storage Configuration
  STORAGE_KEYS: {
    SESSION_ID: 'chatbot_session_id',
    USER_PREFERENCES: 'user_preferences'
  }
};

export default config;
