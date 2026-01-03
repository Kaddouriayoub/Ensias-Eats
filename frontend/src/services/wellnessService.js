import api from './api';

const getWellnessData = async (date = null) => {
  try {
    let url = '/wellness/me';
    if (date) {
      url += `?date=${date}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching wellness data:', error);
    throw error;
  }
};

const getMonthlyWellnessData = async (year, month) => {
  try {
    const response = await api.get(
      `/wellness/monthly?year=${year}&month=${month}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly wellness data:', error);
    throw error;
  }
};

const updateDailyGoals = async (goals) => {
  try {
    const response = await api.put(
      '/wellness/goals',
      goals
    );
    return response.data;
  } catch (error) {
    console.error('Error updating daily goals:', error);
    throw error;
  }
};

export default {
  getWellnessData,
  getMonthlyWellnessData,
  updateDailyGoals
};