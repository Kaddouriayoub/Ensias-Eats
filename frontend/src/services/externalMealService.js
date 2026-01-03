import api from './api';

const createExternalMeal = async (mealData) => {
  try {
    const response = await api.post('/external-meals', mealData);
    return response.data;
  } catch (error) {
    console.error('Error creating external meal:', error);
    throw error;
  }
};

const getMyExternalMeals = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/external-meals/my-meals${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching external meals:', error);
    throw error;
  }
};

const getExternalMeal = async (id) => {
  try {
    const response = await api.get(`/external-meals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching external meal:', error);
    throw error;
  }
};

const updateExternalMeal = async (id, mealData) => {
  try {
    const response = await api.put(`/external-meals/${id}`, mealData);
    return response.data;
  } catch (error) {
    console.error('Error updating external meal:', error);
    throw error;
  }
};

const deleteExternalMeal = async (id) => {
  try {
    const response = await api.delete(`/external-meals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting external meal:', error);
    throw error;
  }
};

export default {
  createExternalMeal,
  getMyExternalMeals,
  getExternalMeal,
  updateExternalMeal,
  deleteExternalMeal
};
