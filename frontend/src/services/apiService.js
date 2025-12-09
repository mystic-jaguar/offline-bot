// API Service for Backend Communication

import axios from 'axios';
import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // default timeout; some calls may override
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Admin auth storage
    this.adminToken = localStorage.getItem('admin_token') || null;

    // Add request interceptor to prevent duplicate requests
    this.requestQueue = new Map();
    this.client.interceptors.request.use((config) => {
      const method = (config.method || 'get').toLowerCase();
      const url = config.url || '';
      // Only apply duplicate prevention to chat POSTs; allow GETs like health checks
      if (method === 'post' && url === '/api/chat') {
        const requestKey = `${method}-${url}`;
        if (this.requestQueue.has(requestKey)) {
          // Silently allow the request by returning config; do not reject to avoid UX errors
          return config;
        }
        this.requestQueue.set(requestKey, true);
      }
      return config;
    });
    
    // Add response interceptor to clean up request queue
    this.client.interceptors.response.use(
      (response) => {
        try {
          const method = (response.config?.method || 'get').toLowerCase();
          const url = response.config?.url || '';
          if (method === 'post' && url === '/api/chat') {
            const requestKey = `${method}-${url}`;
            this.requestQueue.delete(requestKey);
          }
        } catch (_) {}
        return response;
      },
      (error) => {
        try {
          const method = (error.config?.method || 'get').toLowerCase();
          const url = error.config?.url || '';
          if (method === 'post' && url === '/api/chat') {
            const requestKey = `${method}-${url}`;
            this.requestQueue.delete(requestKey);
          }
        } catch (_) {}
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Send chat message
  async sendMessage(question, sessionId = 'default') {
    try {
      const response = await this.client.post(
        '/api/chat',
        {
          question,
          session_id: sessionId,
        },
        { timeout: 60000 } // allow longer for model response
      );
      return response.data;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }

  // Get conversation history
  async getHistory(sessionId) {
    try {
      const response = await this.client.get(`/api/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get history failed:', error);
      throw error;
    }
  }

  // Get available categories
  async getCategories() {
    try {
      const response = await this.client.get('/api/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories failed:', error);
      throw error;
    }
  }

  // Get category information
  async getCategoryInfo(categoryName) {
    try {
      const response = await this.client.get(`/api/category/${categoryName}`);
      return response.data;
    } catch (error) {
      console.error('Get category info failed:', error);
      throw error;
    }
  }

  // Get suggested questions
  async getSuggestions() {
    try {
      const response = await this.client.get('/api/suggestions');
      return response.data;
    } catch (error) {
      console.error('Get suggestions failed:', error);
      throw error;
    }
  }

  // Test LLM integration
  async testLLM(question = 'Hello, are you working?') {
    try {
      const response = await this.client.post('/api/test', {
        question,
      });
      return response.data;
    } catch (error) {
      console.error('Test LLM failed:', error);
      throw error;
    }
  }

  // ---------------- Admin Methods ----------------
  setAdminToken(token) {
    this.adminToken = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  getAuthHeaders() {
    return this.adminToken ? { Authorization: `Bearer ${this.adminToken}` } : {};
  }

  async adminLogin(username, password) {
    const response = await this.client.post('/api/admin/login', { username, password });
    const { token } = response.data;
    this.setAdminToken(token);
    return response.data;
  }

  async adminLogout() {
    try {
      await this.client.post('/api/admin/logout', {}, { headers: this.getAuthHeaders() });
    } finally {
      this.setAdminToken(null);
    }
  }

  async adminAnalytics() {
    const response = await this.client.get('/api/admin/analytics', { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminGetChats() {
    const response = await this.client.get('/api/admin/chats', { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminResetChats() {
    const response = await this.client.post('/api/admin/chats/reset', {}, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminDeleteChat(sessionId) {
    const response = await this.client.delete(`/api/admin/chats/${sessionId}`, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminGetPolicies() {
    const response = await this.client.get('/api/admin/policies', { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminSavePolicies(policies) {
    const response = await this.client.put('/api/admin/policies', policies, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminGetCompany() {
    const response = await this.client.get('/api/admin/company', { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminSaveCompany(payload) {
    const response = await this.client.put('/api/admin/company', payload, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminListCategories() {
    const response = await this.client.get('/api/admin/kb/categories', { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminAddCategory(category, items = []) {
    const response = await this.client.post('/api/admin/kb/categories', { category, items }, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminAddKbItem(category, item) {
    const response = await this.client.post('/api/admin/kb/items', { category, item }, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminGetDisabledCategories() {
    const response = await this.client.get('/api/admin/kb/categories/disabled', { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminSetDisabledCategories(disabled) {
    const response = await this.client.put('/api/admin/kb/categories/disabled', { disabled }, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminGetCategorySettings() {
    const response = await this.client.get('/api/admin/kb/categories/settings', { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminSaveCategorySettings(settingsByCategory) {
    const response = await this.client.put('/api/admin/kb/categories/settings', settingsByCategory, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminGetCategoryItems(category) {
    const response = await this.client.get(`/api/admin/kb/category/${category}`, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminSaveCategoryItems(category, items) {
    const response = await this.client.put(`/api/admin/kb/category/${category}`, items, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async adminDeleteCategoryItem(category, index) {
    const response = await this.client.delete(`/api/admin/kb/category/${category}/${index}`, { headers: this.getAuthHeaders() });
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
