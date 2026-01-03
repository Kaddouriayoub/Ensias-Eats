import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import timeSlotService from '../../services/timeSlotService';
import walletService from '../../services/walletService';

const MainLayout = () => {
  // On récupère 'user' pour éviter le bug de l'écran noir lors de la commande
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  // --- GESTION DU PANIER (GLOBAL) ---
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [walletBalance, setWalletBalance] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);

  // Charger les créneaux horaires
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await timeSlotService.getTimeSlots(today);
        if (response.success) setTimeSlots(response.data);
      } catch (error) {
        console.error('Erreur time slots:', error);
      }
    };
    fetchTimeSlots();
  }, []);

  // Charger le solde du wallet
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await walletService.getBalance();
        if (response.success) {
          setWalletBalance(response.data.balance);
        }
      } catch (error) {
        console.error('Erreur wallet balance:', error);
        setWalletBalance(0);
      }
    };
    if (user) {
      fetchWalletBalance();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- LOGIQUE DU PANIER ---
  const addToCart = (meal) => {
    const existing = cart.find((item) => item._id === meal._id);
    if (existing) {
      setCart(cart.map((item) => (item._id === meal._id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...meal, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const removeFromCart = (mealId) => {
    setCart(cart.filter((item) => item._id !== mealId));
  };

  const updateQuantity = (mealId, change) => {
    setCart(
      cart.map((item) => {
          if (item._id === mealId) {
            return { ...item, quantity: item.quantity + change };
          }
          return item;
        }).filter((item) => item.quantity > 0)
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const totalPrice = getTotalPrice();

    // Vérifier si le solde du wallet est suffisant pour le paiement wallet
    if (paymentMethod === 'wallet' && walletBalance < totalPrice) {
      alert(`Solde insuffisant. Votre solde actuel est de ${walletBalance.toFixed(2)} DH, mais le total de la commande est de ${totalPrice.toFixed(2)} DH.`);
      return;
    }

    setOrderLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          mealId: item._id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
      };
      if (selectedTimeSlot) orderData.timeSlotId = selectedTimeSlot;

      const response = await orderService.createOrder(orderData);
      if (response.success) {
        // Si paiement wallet, mettre à jour le solde local
        if (paymentMethod === 'wallet') {
          setWalletBalance(walletBalance - totalPrice);
        }
        setCart([]);
        setShowCart(false);
        setPaymentMethod('cash_on_delivery'); // Reset to default
        navigate('/student/orders');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur commande');
    } finally {
      setOrderLoading(false);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/meals', label: 'Menu' },
    { path: '/food-diary', label: 'Journal' },
    { path: '/orders', label: 'Commandes' },
    { path: '/wallet', label: 'Wallet' },
    { path: '/profile', label: 'Profil' },
  ];

  // Style des liens
  const navLinkStyle = "px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 text-gray-300 hover:text-white hover:bg-[#252525] no-underline";
  const activeNavLinkStyle = "px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 bg-red-600 text-white shadow-lg shadow-red-900/20 no-underline";
  
  // Style spécifique pour le bouton panier (similaire aux liens)
  const cartButtonStyle = "px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer no-underline";

  return (
    <div className="min-h-screen flex flex-col relative">
      
      {/* --- IMAGE DE FOND --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('/background.jpeg')" 
        }}
      ></div>

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-[#0f0f0f]/90 to-[#0f0f0f] z-0"></div>

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Navigation */}
        <nav className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              
              {/* 1. GAUCHE : Logo */}
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/logo.png" 
                  alt="ENSIAS Eats" 
                  className="h-16 w-auto object-contain" 
                />
              </div>

              {/* 2. CENTRE : Menu de Navigation */}
              <div className="hidden md:flex items-center justify-center space-x-1 flex-1 px-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              {/* 3. DROITE : Panier | Déconnexion */}
              <div className="hidden md:flex items-center space-x-3">
                
                {/* Bouton Panier */}
                <button
                    onClick={() => setShowCart(true)}
                    className={`${cartButtonStyle} ${showCart ? 'text-white bg-[#252525]' : 'text-gray-300 hover:text-white hover:bg-[#252525]'}`}
                >
                    Panier
                    {cart.length > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-1">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    )}
                </button>

                {/* Séparateur Vertical (placé entre Panier et Déconnexion) */}
                <div className="h-6 w-px bg-white/20 mx-1"></div>

                {/* Bouton Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-900/10 transition-all duration-200"
                >
                  Déconnexion
                </button>
              </div>

            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mb-20 md:mb-0">
          <Outlet context={{ addToCart }} />
        </main>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/90 backdrop-blur-md border-t border-[#333] z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center w-full h-full text-xs font-bold transition-colors no-underline ${
                  isActive ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {/* Panier Mobile */}
          <button onClick={() => setShowCart(true)} className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500 hover:text-gray-300">
             Panier ({cart.length})
          </button>
        </div>
      </div>

      {/* --- CART SIDEBAR (Inchangé) --- */}
      {showCart && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full md:w-[450px] h-full shadow-2xl flex flex-col transform transition-transform duration-300 bg-[#1a1a1a] border-l border-[#333]">
            <div className="p-6 border-b border-[#333] flex justify-between items-center">
              <h2 className="text-2xl text-white font-bold">Mon Panier</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white text-sm uppercase font-bold">Fermer</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center mt-20 text-gray-500"><p>Votre panier est vide.</p></div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center bg-[#252525] p-4 rounded-lg border border-[#333]">
                    <div><h4 className="font-bold text-white">{item.name}</h4><div className="text-sm text-gray-400 mt-1">{item.price} DH x {item.quantity}</div></div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 rounded-full bg-[#333] text-white hover:bg-red-600 flex items-center justify-center">-</button>
                        <span className="text-white font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 rounded-full bg-[#333] text-white hover:bg-green-600 flex items-center justify-center">+</button>
                        <button onClick={() => removeFromCart(item._id)} className="ml-2 text-gray-500 hover:text-red-500 text-sm font-bold">Retirer</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
                <div className="p-6 border-t border-[#333] bg-[#151515]">
                    {/* Payment Method Selector */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-400 mb-2 block">Mode de Paiement</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full p-3 rounded bg-[#2a2a2a] text-white border border-[#333] outline-none"
                        >
                            <option value="cash_on_delivery">Cash à la livraison</option>
                            <option value="wallet">Payer avec Wallet</option>
                        </select>
                        {paymentMethod === 'wallet' && (
                          <div className="mt-2 p-3 rounded bg-[#2a2a2a] border border-[#333]">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Solde Wallet:</span>
                              <span className={`font-bold ${walletBalance >= getTotalPrice() ? 'text-green-500' : 'text-red-500'}`}>
                                {walletBalance.toFixed(2)} DH
                              </span>
                            </div>
                            {walletBalance < getTotalPrice() && (
                              <p className="text-xs text-red-400 mt-2">⚠️ Solde insuffisant pour cette commande</p>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Time Slot Selector */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-400 mb-2 block">Créneau (Optionnel)</label>
                        <select value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)} className="w-full p-3 rounded bg-[#2a2a2a] text-white border border-[#333] outline-none">
                            <option value="">Dès que possible</option>
                            {timeSlots.map(slot => (<option key={slot._id} value={slot._id}>{new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</option>))}
                        </select>
                    </div>

                    {/* Total and Checkout Button */}
                    <div className="flex justify-between items-center mb-6 text-xl font-bold text-white"><span>Total</span><span className="text-red-500">{getTotalPrice().toFixed(2)} DH</span></div>
                    <button onClick={handlePlaceOrder} disabled={orderLoading} className="btn-primary w-full py-4 text-lg shadow-lg shadow-red-900/20">{orderLoading ? 'Validation...' : 'COMMANDER'}</button>
                </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MainLayout;