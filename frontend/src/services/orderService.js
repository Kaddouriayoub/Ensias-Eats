import api from './api';

const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get my orders
  getMyOrders: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/orders/my-orders?${queryParams}`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Get all orders (staff/admin only)
  getAllOrders: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/orders?${queryParams}`);
    return response.data;
  },

  // Update order status (staff/admin only)
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Collect order (staff only)
  collectOrder: async (id, qrData) => {
    const response = await api.patch(`/orders/${id}/collect`, { qrData });
    return response.data;
  },
};

export default orderService;
