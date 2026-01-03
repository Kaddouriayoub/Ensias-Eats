import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import './theme.css'; 

// --- JEU D'ICÔNES SVG PRO ---
const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  Flame: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3-1.1 1-2.2 1.5-3.2z"></path></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  ),
  CreditCard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
  ),
  Cash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  )
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nutritionalGoal: 'None',
    monthlyBudgetCap: 0,
    preferredPaymentMethod: 'cash_on_delivery',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        nutritionalGoal: user.nutritionalGoal || 'None',
        monthlyBudgetCap: user.monthlyBudgetCap || 0,
        preferredPaymentMethod: user.preferredPaymentMethod || 'cash_on_delivery',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monthlyBudgetCap' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updateProfile(formData);

      if (response.success) {
        updateUser(response.data);
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Échec de la mise à jour',
      });
    } finally {
      setLoading(false);
    }
  };

  // Styles communs
  const inputStyle = "w-full bg-black/50 border border-white/10 text-white rounded-lg p-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all placeholder-gray-600 text-sm backdrop-blur-sm";
  const labelStyle = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2";
  const sectionTitleStyle = "text-lg font-bold text-white mb-6 flex items-center gap-3 pb-3 border-b border-white/10";

  return (
    <div className="pb-20 fade-in min-h-full">
       
       {/* COVER BANNER CORRIGÉ */}
       {/* Hauteur ajustée et suppression du chevauchement */}
       <div className="relative h-64 rounded-b-3xl mx-4 mt-4 overflow-hidden shadow-2xl border-b border-white/5">
          <div className="absolute inset-0 bg-[#111]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-transparent"></div>
          
          {/* Texte aligné en haut */}
          <div className="absolute inset-0 flex flex-col justify-start pt-20 px-8 md:px-12">
             <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-2xl">
               Mon Profil
             </h1>
             <p className="text-gray-300 text-base mt-2 max-w-md drop-shadow-md">
               Gérez vos informations personnelles et préférences de compte.
             </p>
          </div>
       </div>

       {/* CONTENT GRID */}
       {/* Marge positive pour éviter la superposition */}
       <div className="container mx-auto px-4 mt-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* LEFT SIDEBAR */}
             <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl flex flex-col items-center text-center">
                   <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-red-600 to-black mb-4 shadow-2xl">
                      <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                         {user?.name?.charAt(0).toUpperCase() || <Icons.User />}
                      </div>
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                   <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                   <div className="inline-flex items-center px-4 py-1.5 bg-red-600/10 text-red-500 text-xs font-bold rounded-full border border-red-600/20 uppercase tracking-wide">
                      {user?.role || 'Étudiant'}
                   </div>

                   <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                      <div className="text-center">
                         <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-center gap-1"><Icons.Calendar /> Membre depuis</p>
                         <p className="text-white font-mono text-sm">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-'}
                         </p>
                      </div>
                      <div className="text-center border-l border-white/5">
                         <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                            <Icons.Activity /> Mise à jour
                         </p>
                         <p className="text-white font-mono text-sm">
                            {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                         </p>
                      </div>
                   </div>
                </div>

                {/* Daily Stats */}
                <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Aujourd'hui</h3>
                   <div className="space-y-4">
                      <div className="group relative overflow-hidden rounded-lg bg-black/40 border border-white/5 p-4 hover:border-red-600/30 transition-all">
                         <div className="flex justify-between items-end relative z-10">
                            <div>
                               <p className="text-2xl font-bold text-white">{user?.dailyCalorieIntake || 0}</p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Calories</p>
                            </div>
                            <div className="text-red-500"><Icons.Flame /></div>
                         </div>
                         <div className="absolute bottom-0 left-0 h-1 bg-red-600 w-1/3"></div>
                      </div>

                      <div className="group relative overflow-hidden rounded-lg bg-black/40 border border-white/5 p-4 hover:border-blue-600/30 transition-all">
                         <div className="flex justify-between items-end relative z-10">
                            <div>
                               <p className="text-2xl font-bold text-white">{user?.dailyProteinIntake || 0}<span className="text-sm text-gray-500 ml-1">g</span></p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Protéines</p>
                            </div>
                            <div className="text-blue-500"><Icons.Activity /></div>
                         </div>
                         <div className="absolute bottom-0 left-0 h-1 bg-blue-600 w-1/2"></div>
                      </div>
                   </div>
                </div>

             </div>

             {/* RIGHT CONTENT */}
             <div className="lg:col-span-8">
                <form onSubmit={handleSubmit} className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl h-full">
                   
                   {message.text && (
                      <div className={`mb-8 p-4 rounded-lg border flex items-center gap-3 ${
                         message.type === 'success' ? 'bg-green-900/20 border-green-900/50 text-green-400' : 'bg-red-900/20 border-red-900/50 text-red-400'
                      }`}>
                         <span className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}>
                            {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.AlertCircle />}
                         </span>
                         <p className="font-medium text-sm">{message.text}</p>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="md:col-span-2">
                         <h3 className={sectionTitleStyle}>
                            <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white text-xs font-bold">1</span>
                            Informations Personnelles
                         </h3>
                      </div>
                      
                      <div>
                         <label className={labelStyle}>Nom Complet</label>
                         <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} required />
                      </div>
                      <div>
                         <label className={labelStyle}>Email Universitaire</label>
                         <div className="relative">
                            <input type="email" name="email" value={formData.email} className={`${inputStyle} opacity-60 cursor-not-allowed pl-10`} disabled />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Lock /></div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="md:col-span-2">
                         <h3 className={sectionTitleStyle}>
                            <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white text-xs font-bold">2</span>
                            Objectifs & Budget
                         </h3>
                      </div>

                      <div>
                         <label className={labelStyle}>Objectif Nutritionnel</label>
                         <div className="relative">
                            <select name="nutritionalGoal" value={formData.nutritionalGoal} onChange={handleChange} className={`${inputStyle} appearance-none`}>
                               <option value="None">Aucun objectif</option>
                               <option value="High Energy">Haute Énergie (2500 kcal)</option>
                               <option value="Balanced">Équilibré (2000 kcal)</option>
                               <option value="Light Focused">Perte de poids (1500 kcal)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><Icons.ChevronDown /></div>
                         </div>
                      </div>

                      <div>
                         <label className={labelStyle}>Plafond Budget Mensuel</label>
                         <div className="relative">
                            <input type="number" name="monthlyBudgetCap" value={formData.monthlyBudgetCap} onChange={handleChange} min="0" step="50" className={inputStyle} />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">DH</span>
                         </div>
                         <p className="text-xs text-gray-500 mt-2 ml-1">* Mettez 0 pour un budget illimité.</p>
                      </div>
                   </div>

                   <div className="mb-10">
                      <h3 className={sectionTitleStyle}>
                         <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white text-xs font-bold">3</span>
                         Préférences de Paiement
                      </h3>
                      <div>
                         <label className={labelStyle}>Méthode par défaut</label>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${formData.preferredPaymentMethod === 'wallet' ? 'bg-red-600/10 border-red-600 text-white' : 'bg-black/20 border-[#333] text-gray-400 hover:bg-black/40'}`}>
                               <input type="radio" name="preferredPaymentMethod" value="wallet" checked={formData.preferredPaymentMethod === 'wallet'} onChange={handleChange} className="hidden" />
                               <span className="text-gray-400"><Icons.CreditCard /></span>
                               <div>
                                  <p className="font-bold text-sm">Portefeuille Virtuel</p>
                                  <p className="text-xs opacity-70">Paiement rapide & sécurisé</p>
                               </div>
                            </label>

                            <label className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${formData.preferredPaymentMethod === 'cash_on_delivery' ? 'bg-red-600/10 border-red-600 text-white' : 'bg-black/20 border-[#333] text-gray-400 hover:bg-black/40'}`}>
                               <input type="radio" name="preferredPaymentMethod" value="cash_on_delivery" checked={formData.preferredPaymentMethod === 'cash_on_delivery'} onChange={handleChange} className="hidden" />
                               <span className="text-gray-400"><Icons.Cash /></span>
                               <div>
                                  <p className="font-bold text-sm">Espèces</p>
                                  <p className="text-xs opacity-70">Paiement à la livraison</p>
                               </div>
                            </label>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide">
                         {loading ? 'ENREGISTREMENT...' : 'SAUVEGARDER LES MODIFICATIONS'}
                      </button>
                   </div>

                </form>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Profile;