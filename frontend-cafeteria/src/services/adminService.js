import api from './api';

const adminService = {
  // ============================================
  // DASHBOARD
  // ============================================
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // ============================================
  // USER MANAGEMENT
  // ============================================
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/admin/users?${queryParams}`);
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId, reason) => {
    const response = await api.put(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // ============================================
  // WALLET MANAGEMENT
  // ============================================
  chargeUserWallet: async (userId, amount, description) => {
    const response = await api.post('/admin/wallet/charge', {
      userId,
      amount,
      description
    });
    return response.data;
  },

  getUserWallet: async (userId) => {
    const response = await api.get(`/admin/wallet/${userId}`);
    return response.data;
  },

  searchStudents: async (search) => {
    const response = await api.get(`/admin/users?search=${encodeURIComponent(search)}&role=student`);
    return response.data;
  },

  getWalletTransactions: async (userId) => {
    const response = await api.get(`/admin/wallet/${userId}`);
    return response.data;
  },

  // ============================================
  // STAFF MANAGEMENT
  // ============================================
  createStaffAccount: async (staffData) => {
    const response = await api.post('/admin/staff', staffData);
    return response.data;
  },

  getAllStaff: async () => {
    const response = await api.get('/admin/staff');
    return response.data;
  },

  updateStaff: async (staffId, staffData) => {
    const response = await api.put(`/admin/staff/${staffId}`, staffData);
    return response.data;
  },

  deleteStaff: async (staffId) => {
    const response = await api.delete(`/admin/staff/${staffId}`);
    return response.data;
  },

  // ============================================
  // MEAL MANAGEMENT
  // ============================================
  createMeal: async (formData) => {
    const response = await api.post('/admin/meals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateMeal: async (mealId, formData) => {
    const response = await api.put(`/admin/meals/${mealId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteMeal: async (mealId) => {
    const response = await api.delete(`/admin/meals/${mealId}`);
    return response.data;
  },

  getMealProfitStats: async () => {
    const response = await api.get('/admin/meals/profit-stats');
    return response.data;
  },

  // ============================================
  // ANALYTICS & REPORTS
  // ============================================
  getRevenueStats: async (period = 'week') => {
    const response = await api.get(`/admin/analytics/revenue?period=${period}`);
    return response.data;
  },

  getAllReports: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/admin/reports?${queryParams}`);
    return response.data;
  },

  resolveReport: async (reportId, adminNotes) => {
    const response = await api.put(`/admin/reports/${reportId}/resolve`, { adminNotes });
    return response.data;
  },
};

export default adminService;