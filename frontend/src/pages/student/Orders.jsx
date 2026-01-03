import { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import QRCode from 'qrcode.react';
import './theme.css'; 

// Professional SVG Icons
const Icons = {
  ShoppingBag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  ),
  CreditCard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
  ),
  QrCode: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  ),
  XCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  DollarSign: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  )
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cycle de vie du composant pour charger les commandes
  // 
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        fetchOrders(); 
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Impossible d\'annuler la commande');
    }
  };

  // Gestion des états de commande pour le style
  // 
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'ready':
        return 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]';
      case 'completed':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 fade-in min-h-full">
      
      {/* Cover Banner */}
      <div className="relative h-48 rounded-b-3xl mx-4 mt-4 overflow-hidden shadow-2xl border-b border-white/5">
          <div className="absolute inset-0 bg-[#111]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent"></div>
          
          <div className="absolute bottom-8 left-8 md:left-12 z-10">
             <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                <Icons.ShoppingBag /> Mes Commandes
             </h1>
             <p className="text-gray-400 text-sm mt-2 max-w-md">
                Suivez le statut de vos repas en temps réel.
             </p>
          </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-5xl">

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-white/10 border-dashed">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                <Icons.ShoppingBag />
            </div>
            <p className="text-xl font-bold text-white mb-2">Aucune commande</p>
            <p className="text-gray-400 mb-8 text-sm">Vous n'avez pas encore commandé de repas.</p>
            <a href="/student/meals" className="inline-flex items-center justify-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 text-sm uppercase tracking-wide">
              COMMANDER MAINTENANT
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 transition-all hover:border-red-600/30 hover:shadow-xl"
              >
                {/* Header Carte */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-6 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-3">
                        <span className="text-white font-mono font-bold text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Icons.Calendar />
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Liste des items */}
                <div className="space-y-4 mb-8">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="bg-[#252525] text-white w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold border border-white/5">
                            {item.quantity}x
                        </span>
                        <div>
                            <p className="font-bold text-gray-200">{item.meal?.name || 'Repas inconnu'}</p>
                            <p className="text-xs text-gray-500">{item.meal?.category || 'Plat'}</p>
                        </div>
                      </div>
                      <p className="font-bold text-white">
                        {(item.price * item.quantity).toFixed(2)} DH
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer Carte (Détails & Actions) */}
                <div className="bg-black/20 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 border border-white/5">
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Icons.DollarSign /> Total</p>
                      <p className="text-xl font-bold text-red-500">{order.totalPrice?.toFixed(2) || '0.00'} DH</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Icons.Clock /> Heure Retrait</p>
                      <p className="text-sm text-white font-mono font-bold">
                        {order.pickupTimeSlot
                          ? new Date(order.pickupTimeSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </p>
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Icons.CreditCard /> Paiement</p>
                      <p className="text-sm text-white capitalize font-medium">{order.paymentMethod?.replace('_', ' ')}</p>
                   </div>
                   <div className="flex items-center">
                        <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase ${
                            order.paymentStatus === 'completed' ? 'border-green-900/50 text-green-500 bg-green-900/10' : 'border-yellow-900/50 text-yellow-500 bg-yellow-900/10'
                        }`}>
                            {order.paymentStatus === 'completed' ? 'PAYÉ' : 'EN ATTENTE'}
                        </span>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                  >
                    <Icons.QrCode /> AFFICHER QR CODE
                  </button>
                  
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-6 py-3 border border-red-900/50 text-red-500 rounded-xl hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
                    >
                      <Icons.XCircle /> Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- QR CODE MODAL (Dark Mode) --- */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
            
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Retrait Commande</h2>
                <p className="text-sm text-gray-400">Montrez ce QR Code au personnel pour récupérer votre repas.</p>
              </div>

              <div className="flex justify-center mb-8">
                <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <QRCode value={selectedOrder.qrCode || selectedOrder._id} size={220} />
                </div>
              </div>

              <div className="text-center space-y-2 mb-8 bg-black/30 p-4 rounded-xl border border-white/5">
                 <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">COMMANDE #{selectedOrder._id.slice(-6).toUpperCase()}</p>
                 <p className="text-3xl font-bold text-white">{selectedOrder.totalPrice?.toFixed(2)} <span className="text-red-500 text-lg">DH</span></p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all uppercase tracking-wide text-sm"
              >
                FERMER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;