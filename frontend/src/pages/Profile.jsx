import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    monthlyBudgetCap: 0,
  });
  const [dailyStats, setDailyStats] = useState({ calories: 0, proteins: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch User Profile
      const userResponse = await api.get('/users/profile');
      if (userResponse.data.success) {
        const user = userResponse.data.data;
        setFormData({
          name: user.name,
          email: user.email,
          monthlyBudgetCap: user.monthlyBudgetCap || 0,
        });
      }

      // Fetch Daily Stats
      const today = format(new Date(), 'yyyy-MM-dd');
      const statsResponse = await api.get('/wellness/daily', { params: { date: today } });
      
      if (statsResponse.data && statsResponse.data.success && statsResponse.data.data) {
        setDailyStats({
          calories: statsResponse.data.data.dailyCalories || 0,
          proteins: statsResponse.data.data.dailyProteins || 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const response = await api.put('/users/profile', {
        name: formData.name,
        monthlyBudgetCap: formData.monthlyBudgetCap
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <p className="text-xs text-gray-500 mb-1">Aujourd'hui</p>
          <p className="text-2xl font-bold text-orange-600">{dailyStats.calories}</p>
          <p className="text-xs font-medium text-orange-800">Calories</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Aujourd'hui</p>
          <p className="text-2xl font-bold text-blue-600">{dailyStats.proteins}g</p>
          <p className="text-xs font-medium text-blue-800">Protéines</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full rounded-xl border-gray-300 bg-gray-50 text-gray-500 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget Mensuel (DH)</label>
          <input
            type="number"
            value={formData.monthlyBudgetCap}
            onChange={(e) => setFormData({...formData, monthlyBudgetCap: parseFloat(e.target.value)})}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-3"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors mt-4"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default Profile;