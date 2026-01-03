import api from './api';

const mealService = {
  // Get all meals
  getAllMeals: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/meals?${params}`);
    return response.data;
  },

  // Get meal by ID
  getMealById: async (id) => {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },

  // Get meal categories
  getCategories: async () => {
    const response = await api.get('/meals/categories');
    return response.data;
  },

  // Get personalized recommendations
  getRecommendations: async () => {
    const response = await api.get('/meals/recommendations/for-me');
    return response.data;
  },

  // Create meal (admin/staff only)
  createMeal: async (mealData) => {
    const response = await api.post('/meals', mealData);
    return response.data;
  },

  // Update meal (admin/staff only)
  updateMeal: async (id, mealData) => {
    const response = await api.put(`/meals/${id}`, mealData);
    return response.data;
  },

  // Toggle meal availability (admin/staff only)
  toggleAvailability: async (id) => {
    const response = await api.patch(`/meals/${id}/availability`);
    return response.data;
  },

  // Delete meal (admin only)
  deleteMeal: async (id) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },
};

export default mealService;
