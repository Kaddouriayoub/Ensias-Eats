import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/users/dashboard');
    return response.data;
  },

  // Get order history
  getOrderHistory: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/orders?${queryParams}`);
    return response.data;
  },

  // Add external meal
  addExternalMeal: async (mealData) => {
    const response = await api.post('/users/external-meals', mealData);
    return response.data;
  },

  // Get external meals
  getExternalMeals: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/users/external-meals?${queryParams}`);
    return response.data;
  },
};

export default userService;
