import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; // IMPORTANT : Pour parler au Layout
import mealService from '../../services/mealService';
import './theme.css'; 

const Meals = () => {
  // 1. On récupère la fonction du panier global
  const { addToCart } = useOutletContext(); 
  
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealsAndCategories();
  }, []);

  useEffect(() => {
    filterMeals();
  }, [meals, selectedCategory, searchQuery]);

  const fetchMealsAndCategories = async () => {
    try {
      const [mealsRes, categoriesRes] = await Promise.all([
        mealService.getAllMeals(),
        mealService.getCategories(),
      ]);

      if (mealsRes.success) setMeals(mealsRes.data);
      if (categoriesRes.success) setCategories(['All', ...categoriesRes.data]);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMeals = () => {
    let filtered = meals;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((meal) => meal.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (meal) =>
          meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredMeals(filtered);
  };

  const getMealImage = (category) => {
    const images = {
        'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        'Plats & Tradition': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        'Petit-Déj & Snacks': 'https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&w=800&q=80',
        'Boissons': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80'
    };
    return images[category] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 fade-in">
      
      {/* HEADER & SEARCH */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 style={{ color: 'var(--text-white)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Menu</h1>
            <p className="text-gray-300 font-medium">Stop les files d'attente. Mangez mieux.</p>
          </div>
          {/* Le bouton panier a été supprimé d'ici car il est maintenant dans la barre du haut */}
        </div>

        {/* SEARCH BAR */}
        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="Rechercher un plat (Tacos, Pizza...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
            }}
          />
        </div>

        {/* CATEGORY FILTERS */}
        <div className="category-filters no-scrollbar flex gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all ${
                selectedCategory === category 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                : 'bg-black/50 text-gray-300 border border-white/10 hover:bg-black/70'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* MEALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredMeals.map((meal) => (
            <div key={meal._id} className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              
              {/* Image Section */}
              <div className="h-48 relative overflow-hidden">
                <img 
                    src={meal.image || getMealImage(meal.category)} 
                    alt={meal.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
                {!meal.isAvailable && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white font-bold uppercase tracking-wider border-2 border-white px-4 py-2">Épuisé</span>
                    </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white mb-0">{meal.name}</h3>
                    <span className="text-xl font-bold text-red-500">{meal.price} DH</span>
                </div>
                
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">
                    {meal.description || "Un délice préparé par nos chefs pour vous donner de l'énergie."}
                </p>

                {/* Tags (Nutri Info) */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded bg-[#333] text-gray-300 border border-[#444]">
                        {meal.nutritionalInfo?.calories || '450'} kcal
                    </span>
                    {meal.dietary?.isVegetarian && (
                        <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-900">
                            Végé
                        </span>
                    )}
                </div>

                {/* 2. BOUTON D'AJOUT : Utilise maintenant la fonction globale */}
                <button
                  onClick={() => addToCart(meal)}
                  disabled={!meal.isAvailable}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {meal.isAvailable ? 'AJOUTER AU PANIER' : 'INDISPONIBLE'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMeals.length === 0 && (
          <div className="text-center py-20 bg-[#1a1a1a]/80 backdrop-blur-md rounded-xl mt-8">
            <p className="text-white text-lg font-medium">Aucun repas trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meals;