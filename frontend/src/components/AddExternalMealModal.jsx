import { useState } from 'react';
import externalMealService from '../services/externalMealService';
import { format } from 'date-fns';

const AddExternalMealModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    calories: '',
    proteins: '',
    carbs: '',
    mealDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title || !formData.calories) {
        setError('Title and calories are required');
        setLoading(false);
        return;
      }

      await externalMealService.createExternalMeal({
        title: formData.title,
        price: parseFloat(formData.price) || 0,
        calories: parseFloat(formData.calories) || 0,
        proteins: parseFloat(formData.proteins) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        mealDate: new Date(formData.mealDate),
        notes: formData.notes
      });

      setFormData({
        title: '',
        price: '',
        calories: '',
        proteins: '',
        carbs: '',
        mealDate: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating external meal:', err);
      setError(err.response?.data?.message || 'Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add External Meal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Track meals eaten outside the cafeteria
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Breakfast at home"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="mealDate"
              value={formData.mealDate}
              onChange={handleChange}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calories <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                placeholder="kcal"
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                name="proteins"
                value={formData.proteins}
                onChange={handleChange}
                placeholder="g"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                placeholder="g"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (DH)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExternalMealModal;