import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'EN ATTENTE',
      confirmed: 'CONFIRMÉ',
      preparing: 'EN PRÉPARATION',
      ready: 'PRÊT',
      completed: 'TERMINÉ',
      cancelled: 'ANNULÉ',
    };
    return texts[status] || status;
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
      const response = await api.put(`/orders/${selectedOrder._id}/cancel`);
      if (response.data.success) {
        setOrders(orders.map(o => o._id === selectedOrder._id ? { ...o, status: 'cancelled' } : o));
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Impossible d\'annuler la commande');
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Commandes</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Order #{order.orderNumber}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(order.createdAt), 'd MMM, HH:mm', { locale: fr })}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            {/* Items Preview (First Item) */}
            <div className="flex items-center gap-3 mb-4">
              <div className="font-bold text-gray-900">{order.items[0]?.quantity}x</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{order.items[0]?.meal?.name}</p>
                <p className="text-xs text-gray-500">{order.items[0]?.meal?.category}</p>
              </div>
              <div className="font-medium text-gray-900">
                {(order.items[0]?.price * order.items[0]?.quantity).toFixed(2)} DH
              </div>
            </div>
            
            {order.items.length > 1 && (
              <p className="text-xs text-gray-400 mb-4">+{order.items.length - 1} autres articles</p>
            )}

            {/* Details Grid */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">{order.totalPrice.toFixed(2)} DH</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Heure Retrait</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.pickupTimeSlot ? format(new Date(order.pickupTimeSlot), 'HH:mm') : '--:--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Paiement</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedOrder(order)}
                className="w-full py-3 border border-red-600 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors uppercase tracking-wide"
              >
                VOIR DÉTAILS
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Détails de la commande</h2>
                <p className="text-sm text-gray-500">#{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Statut</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full uppercase ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(selectedOrder.createdAt), 'd MMM, HH:mm', { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Heure Retrait</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedOrder.pickupTimeSlot ? format(new Date(selectedOrder.pickupTimeSlot), 'HH:mm') : '--:--'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Paiement</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            {/* QR Code Section */}
            {selectedOrder.qrCode && ['pending', 'confirmed', 'preparing', 'ready'].includes(selectedOrder.status) && (
              <div className="flex flex-col items-center justify-center mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <img src={selectedOrder.qrCode} alt="Order QR Code" className="w-48 h-48 object-contain mix-blend-multiply" />
                <p className="text-xs text-gray-500 mt-3 text-center font-medium">Scannez ce code pour récupérer votre commande</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Articles</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold text-sm">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.meal?.name}</p>
                          <p className="text-xs text-gray-500">{item.meal?.category}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} DH</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{selectedOrder.totalPrice.toFixed(2)} DH</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                >
                  Annuler la commande
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;