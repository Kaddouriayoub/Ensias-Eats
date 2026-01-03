import { useState, useEffect, useRef } from 'react';
import adminService from '../../services/adminService';
import api from '../../services/api';

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  // Modals
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Form state
  const [mealForm, setMealForm] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    category: 'Main Course',
    image: '',
    imageFile: null,
    nutritionalInfo: {
      calories: '',
      proteins: '',
      carbohydrates: '',
      fats: '',
      fiber: ''
    },
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isHealthy: true
    },
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5]
  });

  const categories = ['Main Course', 'Side Dish', 'Dessert', 'Beverage', 'Snack', 'Salad', 'Other'];
  const weekDays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/meals');
      setMeals(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMealForm({
      name: '',
      description: '',
      price: '',
      cost: '',
      category: 'Main Course',
      image: '',
      imageFile: null,
      nutritionalInfo: {
        calories: '',
        proteins: '',
        carbohydrates: '',
        fats: '',
        fiber: ''
      },
      dietary: {
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isHealthy: true
      },
      isAvailable: true,
      availableDays: [1, 2, 3, 4, 5]
    });
    setEditingMeal(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenModal = (meal = null) => {
    if (meal) {
      setEditingMeal(meal);
      setMealForm({
        name: meal.name || '',
        description: meal.description || '',
        price: meal.price || '',
        cost: meal.cost || '',
        category: meal.category || 'Main Course',
        image: meal.image || '',
        imageFile: null,
        nutritionalInfo: {
          calories: meal.nutritionalInfo?.calories || '',
          proteins: meal.nutritionalInfo?.proteins || '',
          carbohydrates: meal.nutritionalInfo?.carbohydrates || '',
          fats: meal.nutritionalInfo?.fats || '',
          fiber: meal.nutritionalInfo?.fiber || ''
        },
        dietary: {
          isVegetarian: meal.dietary?.isVegetarian || false,
          isVegan: meal.dietary?.isVegan || false,
          isGlutenFree: meal.dietary?.isGlutenFree || false,
          isHealthy: meal.dietary?.isHealthy !== undefined ? meal.dietary.isHealthy : true
        },
        isAvailable: meal.isAvailable !== undefined ? meal.isAvailable : true,
        availableDays: meal.availableDays || [1, 2, 3, 4, 5]
      });
    } else {
      resetForm();
    }
    setShowMealModal(true);
  };

  const handleSaveMeal = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!mealForm.name || !mealForm.price || !mealForm.nutritionalInfo.calories) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', mealForm.name);
      formData.append('description', mealForm.description);
      formData.append('price', parseFloat(mealForm.price));
      formData.append('cost', parseFloat(mealForm.cost) || 0);
      formData.append('category', mealForm.category);
      formData.append('isAvailable', mealForm.isAvailable);
      
      // Handle Image: File takes precedence over URL string
      if (mealForm.imageFile) {
        formData.append('image', mealForm.imageFile);
      } else if (mealForm.image && typeof mealForm.image === 'string') {
        // Only append if it's a valid string URL (not empty)
        formData.append('image', mealForm.image);
      }

      formData.append('nutritionalInfo', JSON.stringify(mealForm.nutritionalInfo));
      formData.append('dietary', JSON.stringify(mealForm.dietary));
      formData.append('availableDays', JSON.stringify(mealForm.availableDays));

      // Debug: Log FormData entries
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      if (editingMeal) {
        await adminService.updateMeal(editingMeal._id, formData);
      } else {
        await adminService.createMeal(formData);
      }

      setShowMealModal(false);
      resetForm();
      fetchMeals();
    } catch (err) {
      console.error('Error saving meal:', err);
      alert('Failed to save meal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteMeal = async (mealId, mealName) => {
    if (!confirm(`Are you sure you want to delete "${mealName}"?`)) return;

    try {
      await adminService.deleteMeal(mealId);
      fetchMeals();
    } catch (err) {
      console.error('Error deleting meal:', err);
      alert('Failed to delete meal: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleDayAvailability = (dayValue) => {
    setMealForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(dayValue)
        ? prev.availableDays.filter(d => d !== dayValue)
        : [...prev.availableDays, dayValue]
    }));
  };

  const calculateProfit = () => {
    const price = parseFloat(mealForm.price) || 0;
    const cost = parseFloat(mealForm.cost) || 0;
    return price - cost;
  };

  const filteredMeals = meals.filter(meal => {
    const matchesCategory = !categoryFilter || meal.category === categoryFilter;
    const matchesAvailability = availabilityFilter === '' ||
      (availabilityFilter === 'available' && meal.isAvailable) ||
      (availabilityFilter === 'unavailable' && !meal.isAvailable);

    return matchesCategory && matchesAvailability;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading meals...</div>
      </div>
    );
  }

  const getImageSrc = (meal) => {
    if (!meal.image) return null;
    if (meal.image.startsWith('http') || meal.image.startsWith('blob:')) {
      return meal.image;
    }
    // Handle relative paths stored in DB
    // Use environment variable for API URL or default to localhost
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const assetBaseUrl = baseUrl.replace(/\/api\/?$/, '');
    return `${assetBaseUrl}/${meal.image.replace(/^\/+/, '')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Meal Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">Manage cafeteria menu items, pricing, and availability</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add New Meal
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-8 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 border"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="block w-full rounded-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 border"
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No meals found
          </div>
        ) : (
          filteredMeals.map((meal) => (
            <div key={meal._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
              {/* Meal Image */}
              <div className="relative h-48 w-full bg-gray-100">
                {meal.image ? (
                  <img
                    src={getImageSrc(meal)}
                    alt={meal.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex'; // Show placeholder if image fails
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${meal.image ? 'hidden' : ''}`}>
                  <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                    meal.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {meal.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{meal.name}</h3>
                    <p className="text-sm text-gray-500">{meal.category}</p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{meal.price.toFixed(2)} <span className="text-xs font-normal text-gray-500">MAD</span></p>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{meal.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100 mb-4 bg-gray-50/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Calories</p>
                    <p className="font-semibold text-gray-900">{meal.nutritionalInfo?.calories || 0}</p>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Protein</p>
                    <p className="font-semibold text-gray-900">{meal.nutritionalInfo?.proteins || 0}g</p>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Profit</p>
                    <p className="font-semibold text-green-600">{((meal.price - (meal.cost || 0)).toFixed(2))} MAD</p>
                  </div>
                </div>

                {/* Dietary Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {meal.dietary?.isVegetarian && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Vegetarian
                    </span>
                  )}
                  {meal.dietary?.isVegan && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Vegan
                    </span>
                  )}
                  {meal.dietary?.isGlutenFree && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Gluten-Free
                    </span>
                  )}
                  {meal.dietary?.isHealthy && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Healthy
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => handleOpenModal(meal)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMeal(meal._id, meal.name)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMeal ? 'Edit Meal' : 'Add New Meal'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the details below to {editingMeal ? 'update the' : 'create a new'} meal item.</p>
              </div>
              <button 
                onClick={() => { setShowMealModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="mealForm" onSubmit={handleSaveMeal} className="space-y-8">
                
                {/* Section: Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={mealForm.name}
                          onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                          className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="e.g. Chicken Salad"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <select
                          value={mealForm.category}
                          onChange={(e) => setMealForm({ ...mealForm, category: e.target.value })}
                          className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Description</label>
                      <textarea
                        value={mealForm.description}
                        onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                        rows="3"
                        placeholder="Describe the meal ingredients and preparation..."
                      />
                    </div>
                  </div>

                  {/* Image Upload/Preview Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Meal Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors min-h-[200px]">
                        {mealForm.image || mealForm.imageFile ? (
                        <div className="relative w-full h-40 mb-3 group">
                          <img
                              src={mealForm.imageFile ? URL.createObjectURL(mealForm.imageFile) : getImageSrc(mealForm)}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-xl shadow-sm"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl"></div>
                        </div>
                      ) : (
                        <div className="text-gray-400 mb-3">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                            <p className="text-xs mt-1">No image selected</p>
                        </div>
                      )}
                      <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setMealForm({ ...mealForm, imageFile: e.target.files[0] })}
                        className="block w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section: Pricing */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    Pricing & Cost
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Price (MAD) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={mealForm.price}
                          onChange={(e) => setMealForm({ ...mealForm, price: e.target.value })}
                          className="block w-full rounded-xl border-gray-300 pl-4 pr-12 py-3 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                          placeholder="0.00"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">MAD</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Cost (MAD)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={mealForm.cost}
                          onChange={(e) => setMealForm({ ...mealForm, cost: e.target.value })}
                          className="block w-full rounded-xl border-gray-300 pl-4 pr-12 py-3 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">MAD</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Estimated Profit</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={calculateProfit().toFixed(2)}
                          readOnly
                          className={`block w-full rounded-xl border-gray-300 pl-4 pr-12 py-3 font-bold bg-gray-50 ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'} focus:ring-blue-500 focus:border-blue-500`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">MAD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section: Nutrition */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </span>
                    Nutritional Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Calories', key: 'calories', unit: 'kcal', required: true },
                      { label: 'Protein', key: 'proteins', unit: 'g', required: true },
                      { label: 'Carbs', key: 'carbohydrates', unit: 'g', required: true },
                      { label: 'Fats', key: 'fats', unit: 'g' },
                      { label: 'Fiber', key: 'fiber', unit: 'g' }
                    ].map((item) => (
                      <div key={item.key} className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          {item.label} {item.required && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={mealForm.nutritionalInfo[item.key]}
                            onChange={(e) => setMealForm({
                              ...mealForm,
                              nutritionalInfo: { ...mealForm.nutritionalInfo, [item.key]: e.target.value }
                            })}
                            className="block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 pr-8"
                            placeholder="0"
                            required={item.required}
                          />
                          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-xs">{item.unit}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section: Dietary & Availability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Dietary */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </span>
                      Dietary Tags
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(mealForm.dietary).map((key) => (
                        <label key={key} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                          mealForm.dietary[key] 
                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={mealForm.dietary[key]}
                            onChange={(e) => setMealForm({
                              ...mealForm,
                              dietary: { ...mealForm.dietary, [key]: e.target.checked }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </span>
                      Availability
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                        <span className="text-sm font-medium text-gray-900">Available for ordering</span>
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${mealForm.isAvailable ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mealForm.isAvailable ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                          <input 
                              type="checkbox" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              checked={mealForm.isAvailable}
                              onChange={(e) => setMealForm({ ...mealForm, isAvailable: e.target.checked })}
                          />
                        </div>
                      </label>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Available Days</label>
                        <div className="flex flex-wrap gap-2">
                          {weekDays.map(day => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleDayAvailability(day.value)}
                              className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                mealForm.availableDays.includes(day.value)
                                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {day.label.charAt(0)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => {
                  setShowMealModal(false);
                  resetForm();
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="mealForm"
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
              >
                {editingMeal ? 'Save Changes' : 'Create Meal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meals;
