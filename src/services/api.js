import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      // For now, we just let the app handle it
    }
    return Promise.reject(error);
  }
);

export const todoService = {
  getAll: () => api.get('/todos'),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
};

export const noteService = {
  getAll: () => api.get('/notes'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const passwordService = {
  getAll: () => api.get('/passwords'),
  create: (data) => api.post('/passwords', data),
  update: (id, data) => api.put(`/passwords/${id}`, data),
  delete: (id) => api.delete(`/passwords/${id}`),
};

export const birthdayService = {
  getAll: () => api.get('/birthdays'),
  create: (data) => api.post('/birthdays', data),
  update: (id, data) => api.put(`/birthdays/${id}`, data),
  delete: (id) => api.delete(`/birthdays/${id}`),
};

export const linkService = {
  getAll: () => api.get('/links'),
  create: (data) => api.post('/links', data),
  update: (id, data) => api.put(`/links/${id}`, data),
  delete: (id) => api.delete(`/links/${id}`),
};

export const expenseService = {
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const habitService = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

export const watchlistService = {
  getAll: () => api.get('/watchlist'),
  create: (data) => api.post('/watchlist', data),
  update: (id, data) => api.put(`/watchlist/${id}`, data),
  delete: (id) => api.delete(`/watchlist/${id}`),
};

export const migrationService = {
  migrateData: () => api.post('/migration/migrate'),
};

export const batchService = {
  sync: (operations) => api.post('/batch/sync', { operations }),
};

export default api;
