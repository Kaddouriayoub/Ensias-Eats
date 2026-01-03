import api from './api';

const walletService = {
  // Get wallet details
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  // Get balance info
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  // Get wallet statistics
  getStats: async () => {
    const response = await api.get('/wallet/stats');
    return response.data;
  },

  // Recharge wallet
  rechargeWallet: async (amount) => {
    const response = await api.post('/wallet/recharge', { amount });
    return response.data;
  },

  // Get transactions
  getTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/wallet/transactions?${queryParams}`);
    return response.data;
  },

  // Update monthly budget
  updateBudget: async (monthlyBudgetCap) => {
    const response = await api.patch('/wallet/budget', { monthlyBudgetCap });
    return response.data;
  },
};

export default walletService;
