import api from './api';

const staffService = {
  // ============================================
  // DASHBOARD
  // ============================================
  getDashboard: async () => {
    const response = await api.get('/staff/dashboard');
    return response.data;
  },

  getTodayStats: async () => {
    const response = await api.get('/staff/stats/today');
    return response.data;
  },

  // ============================================
  // ORDER MANAGEMENT
  // ============================================
  getAllOrders: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/staff/orders?${queryParams}`);
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/staff/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/staff/orders/${orderId}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    const response = await api.put(`/staff/orders/${orderId}/payment-status`, { paymentStatus });
    return response.data;
  },

  markOrderCollected: async (orderId) => {
    const response = await api.put(`/staff/orders/${orderId}/collect`);
    return response.data;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await api.put(`/staff/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // ============================================
  // WALLET CHARGING
  // ============================================
  chargeWallet: async (walletData) => {
    // Send the data with proper field names
    // Backend expects: { studentId: ObjectId, amount: number, notes?: string, paymentMethod?: string }
    const response = await api.post('/staff/wallet/charge', walletData);
    return response.data;
  },

  searchStudents: async (search) => {
    const response = await api.get(`/staff/students/search?search=${encodeURIComponent(search)}`);
    return response.data;
  },

  getWalletTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/staff/wallet/transactions?${queryParams}`);
    return response.data;
  },

  // ============================================
  // USER REPORTING
  // ============================================
  createReport: async (reportData) => {
    const response = await api.post('/staff/reports', reportData);
    return response.data;
  },

  getMyReports: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/staff/reports?${queryParams}`);
    return response.data;
  },
};

export default staffService;