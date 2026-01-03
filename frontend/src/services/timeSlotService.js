import api from './api';

const timeSlotService = {
  // Get available time slots
  getTimeSlots: async (date) => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/timeslots${params}`);
    return response.data;
  },

  // Get time slot by ID
  getTimeSlotById: async (id) => {
    const response = await api.get(`/timeslots/${id}`);
    return response.data;
  },

  // Create time slot (staff/admin only)
  createTimeSlot: async (slotData) => {
    const response = await api.post('/timeslots', slotData);
    return response.data;
  },

  // Update time slot (staff/admin only)
  updateTimeSlot: async (id, slotData) => {
    const response = await api.put(`/timeslots/${id}`, slotData);
    return response.data;
  },

  // Toggle time slot availability (staff/admin only)
  toggleAvailability: async (id) => {
    const response = await api.patch(`/timeslots/${id}/availability`);
    return response.data;
  },

  // Delete time slot (admin only)
  deleteTimeSlot: async (id) => {
    const response = await api.delete(`/timeslots/${id}`);
    return response.data;
  },
};

export default timeSlotService;
