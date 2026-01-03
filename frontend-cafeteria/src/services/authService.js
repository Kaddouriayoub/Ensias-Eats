import api from './api';

const authService = {
  // Login with email and password
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('cafeteria_token', response.data.token);
      localStorage.setItem('cafeteria_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('cafeteria_token');
    localStorage.removeItem('cafeteria_user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('cafeteria_user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('cafeteria_token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('cafeteria_token');
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: () => {
    return authService.hasRole('admin');
  },

  // Check if user is staff (includes admin)
  isStaff: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'cafeteria_staff' || user?.role === 'admin';
  },
};

export default authService;
