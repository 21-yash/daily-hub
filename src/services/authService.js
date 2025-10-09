const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const authService = {
  async register(email, password, username) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
    }
    return data;
  },

  async syncData(data) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/user/sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getData() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/user/data`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};