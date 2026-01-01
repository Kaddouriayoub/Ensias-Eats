import { TimeSlot } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Get available time slots for a specific date
// @route   GET /api/timeslots
// @access  Public
export const getTimeSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  let query = { isAvailable: true };

  if (date) {
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    // Get day of week
    const dayOfWeek = requestedDate.getDay();

    // Find slots for this specific date or recurring slots for this day
    query.$or = [
      { date: requestedDate },
      { dayOfWeek: dayOfWeek, date: null }
    ];
  }

  const timeSlots = await TimeSlot.find(query).sort({ startTime: 1 });

  // Filter only available slots
  const availableSlots = timeSlots.filter(slot => slot.isAvailableForBooking());

  res.json({
    success: true,
    count: availableSlots.length,
    data: availableSlots
  });
});

// @desc    Get single time slot
// @route   GET /api/timeslots/:id
// @access  Public
export const getTimeSlotById = asyncHandler(async (req, res) => {
  const timeSlot = await TimeSlot.findById(req.params.id);

  if (!timeSlot) {
    throw new ErrorResponse('Time slot not found', 404);
  }

  res.json({
    success: true,
    data: timeSlot
  });
});

// @desc    Create time slot (Admin/Cafeteria staff only)
// @route   POST /api/timeslots
// @access  Private (cafeteria_staff, admin)
export const createTimeSlot = asyncHandler(async (req, res) => {
  const { startTime, endTime, date, dayOfWeek, maxOrders, description } = req.body;

  const timeSlot = await TimeSlot.create({
    startTime,
    endTime,
    date,
    dayOfWeek,
    maxOrders,
    description
  });

  res.status(201).json({
    success: true,
    message: 'Time slot created successfully',
    data: timeSlot
  });
});

// @desc    Update time slot (Admin/Cafeteria staff only)
// @route   PUT /api/timeslots/:id
// @access  Private (cafeteria_staff, admin)
export const updateTimeSlot = asyncHandler(async (req, res) => {
  let timeSlot = await TimeSlot.findById(req.params.id);

  if (!timeSlot) {
    throw new ErrorResponse('Time slot not found', 404);
  }

  const { startTime, endTime, date, dayOfWeek, maxOrders, isAvailable, description } = req.body;

  timeSlot = await TimeSlot.findByIdAndUpdate(
    req.params.id,
    { startTime, endTime, date, dayOfWeek, maxOrders, isAvailable, description },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Time slot updated successfully',
    data: timeSlot
  });
});

// @desc    Delete time slot (Admin only)
// @route   DELETE /api/timeslots/:id
// @access  Private (admin)
export const deleteTimeSlot = asyncHandler(async (req, res) => {
  const timeSlot = await TimeSlot.findById(req.params.id);

  if (!timeSlot) {
    throw new ErrorResponse('Time slot not found', 404);
  }

  // Check if slot has orders
  if (timeSlot.currentOrders > 0) {
    throw new ErrorResponse('Cannot delete time slot with existing orders', 400);
  }

  await timeSlot.deleteOne();

  res.json({
    success: true,
    message: 'Time slot deleted successfully'
  });
});

// @desc    Toggle time slot availability (Cafeteria staff/admin only)
// @route   PATCH /api/timeslots/:id/availability
// @access  Private (cafeteria_staff, admin)
export const toggleTimeSlotAvailability = asyncHandler(async (req, res) => {
  const timeSlot = await TimeSlot.findById(req.params.id);

  if (!timeSlot) {
    throw new ErrorResponse('Time slot not found', 404);
  }

  timeSlot.isAvailable = !timeSlot.isAvailable;
  await timeSlot.save();

  res.json({
    success: true,
    message: `Time slot ${timeSlot.isAvailable ? 'enabled' : 'disabled'}`,
    data: timeSlot
  });
});
