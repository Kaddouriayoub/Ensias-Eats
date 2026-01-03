import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import orderService from '../../services/orderService';
import externalMealService from '../../services/externalMealService';
import AddExternalMealModal from '../../components/AddExternalMealModal';
import './theme.css'; 

const FoodDiary = () => {
  const [cafeteriaOrders, setCafeteriaOrders] = useState([]);
  const [externalMeals, setExternalMeals] = useState([]);
  const [combinedMeals, setCombinedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    fetchAllMeals();
  }, []);

  useEffect(() => {
    const combined = [...cafeteriaOrders, ...externalMeals].sort((a, b) => {
      const dateA = new Date(a.mealDate || a.pickupTimeSlot || a.createdAt);
      const dateB = new Date(b.mealDate || b.pickupTimeSlot || b.createdAt);
      return dateB - dateA; 
    });
    setCombinedMeals(combined);
  }, [cafeteriaOrders, externalMeals]);

  const fetchAllMeals = async () => {
    setLoading(true);
    try {
      const [ordersResponse, externalResponse] = await Promise.all([
        orderService.getMyOrders(),
        externalMealService.getMyExternalMeals({ limit: 100 })
      ]);

      const transformedOrders = (ordersResponse.data || [])
        .filter(order => order.status === 'completed' || order.status === 'paid' || order.status === 'ready')
        .map(order => ({
          ...order,
          isCafeteria: true,
          mealDate: order.pickupTimeSlot || order.createdAt,
          title: `Commande #${order.orderNumber || order._id.slice(-6).toUpperCase()}`,
          calories: order.totalCalories || 0,
          proteins: order.totalProteins || 0,
          carbs: order.totalCarbs || 0,
          price: order.totalPrice || 0
        }));

      setCafeteriaOrders(transformedOrders);
      setExternalMeals(externalResponse.data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealAdded = () => {
    fetchAllMeals();
  };

  const filteredMeals = combinedMeals.filter(meal => {
    if (filter === 'all') return true;
    if (filter === 'cafeteria') return meal.isCafeteria;
    if (filter === 'external') return meal.isExternal;
    return true;
  });

  // --- COMPOSANT INTERNE : CARTE REPAS (Sans Émojis) ---
  const MealCard = ({ meal }) => {
    const isExternal = meal.isExternal;
    const mealDate = new Date(meal.mealDate || meal.pickupTimeSlot || meal.createdAt);
    
    const accentColor = isExternal ? 'border-blue-500' : 'border-red-500';
    const badgeStyle = isExternal 
        ? 'bg-blue-900/20 text-blue-400 border border-blue-800' 
        : 'bg-red-900/20 text-red-400 border border-red-800';

    return (
      <div className={`bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:shadow-lg transition-all border-l-4 ${accentColor}`}>
        
        {/* Header Carte */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="font-bold text-lg text-white">{meal.title}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${badgeStyle}`}>
                {isExternal ? 'Externe' : 'Cafét'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              {format(mealDate, "dd MMM yyyy 'à' HH:mm")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{meal.price} <span className="text-xs text-gray-500 font-normal">DH</span></p>
          </div>
        </div>

        {/* Notes & Location */}
        {(meal.notes || meal.location) && (
            <div className="mb-4 bg-[#252525] p-3 rounded text-sm text-gray-400 border border-[#333]">
                {meal.location && <p className="mb-1 text-gray-300 font-medium">{meal.location}</p>}
                {meal.notes && <p className="italic text-gray-500">{meal.notes}</p>}
            </div>
        )}

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-px bg-[#333] border border-[#333] rounded-lg overflow-hidden mb-4">
          <div className="text-center p-3 bg-[#1e1e1e]">
            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1 tracking-widest">CALORIES</div>
            <div className="font-bold text-red-500">{meal.calories}</div>
          </div>
          <div className="text-center p-3 bg-[#1e1e1e]">
            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1 tracking-widest">PROTÉINES</div>
            <div className="font-bold text-blue-500">{meal.proteins}g</div>
          </div>
          <div className="text-center p-3 bg-[#1e1e1e]">
            <div className="text-[9px] text-gray-500 uppercase font-bold mb-1 tracking-widest">GLUCIDES</div>
            <div className="font-bold text-yellow-500">{meal.carbs}g</div>
          </div>
        </div>

        {/* Liste des items (Si Cafétéria) */}
        {!isExternal && meal.items && meal.items.length > 0 && (
          <div className="pt-3 border-t border-[#333]">
            <div className="space-y-1">
              {meal.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-400">
                  <span>{item.meal?.name || 'Inconnu'}</span>
                  <span className="text-gray-600 font-mono">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    // ICI : Fond transparent
    <div className="pb-20 fade-in">
      
      {/* HEADER */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333] mb-8 mt-4 rounded-xl mx-4">
         <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2 shadow-black drop-shadow-md">Journal Alimentaire</h1>
            <p className="text-gray-300">Suivez votre nutrition, qu'elle vienne de l'école ou d'ailleurs.</p>
         </div>
      </div>

      <div className="container mx-auto px-4">
        
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            
            {/* Filter Group */}
            <div className="flex bg-[#1a1a1a]/80 backdrop-blur-md p-1 rounded-lg border border-white/10">
                {[
                    { key: 'all', label: 'Tout' },
                    { key: 'cafeteria', label: 'Cafétéria' },
                    { key: 'external', label: 'Externe' }
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            filter === f.key 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                            : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                        }`}
                    >
                        {f.label}
                        <span className="ml-2 text-xs opacity-50 font-normal">
                            {f.key === 'all' ? combinedMeals.length : f.key === 'cafeteria' ? cafeteriaOrders.length : externalMeals.length}
                        </span>
                    </button>
                ))}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary px-6 py-3 font-bold text-sm"
            >
                AJOUTER REPAS EXTERNE
            </button>
        </div>

        {/* CONTENT */}
        {loading ? (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
            </div>
        ) : filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeals.map((meal, index) => (
                    <MealCard key={`${meal.isCafeteria ? 'caf' : 'ext'}-${meal._id}-${index}`} meal={meal} />
                ))}
            </div>
        ) : (
            <div className="text-center py-24 bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-white/10 border-dashed">
                <h3 className="text-xl font-bold text-white mb-2">Aucun repas trouvé</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                    {filter === 'all'
                    ? "Votre journal est vide. Commencez par ajouter des repas."
                    : filter === 'cafeteria'
                    ? "Aucune commande validée à la cafétéria."
                    : "Aucun repas externe ajouté."}
                </p>
                {filter === 'external' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-red-500 hover:text-red-400 font-bold text-sm border-b border-red-500/30 pb-1"
                    >
                        Ajouter manuellement
                    </button>
                )}
            </div>
        )}

      </div>

      <AddExternalMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMealAdded}
      />
    </div>
  );
};

export default FoodDiary;