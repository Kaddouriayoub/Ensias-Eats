import { useState, useEffect } from 'react';
import walletService from '../../services/walletService';
import QRCode from 'qrcode.react';
import './theme.css'; 

// Professional SVG Icons
const Icons = {
  Wallet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path><path d="M12 7v5l4 2"></path></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  ArrowUpRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
  ),
  ArrowDownLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>
  ),
  QrCode: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  ),
  CreditCard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
  )
};

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRecharge, setShowRecharge] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);

      if (balanceRes.success) {
        setBalance(balanceRes.data.balance);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);

    if (amount < 10) {
      alert('Le montant minimum est de 10 DH');
      return;
    }

    if (amount > 1000) {
      alert('Le montant maximum est de 1000 DH');
      return;
    }

    setRecharging(true);

    try {
      const response = await walletService.recharge(amount, 'qr_code');

      if (response.success) {
        setQrCodeData(response.data.qrCode);
        fetchWalletData();
        setRechargeAmount('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Échec du rechargement');
    } finally {
      setRecharging(false);
    }
  };

  // Helper pour les textes de type
  const getTransactionLabel = (type) => {
    switch (type) {
      case 'recharge': return 'Rechargement';
      case 'payment': return 'Paiement Repas';
      case 'refund': return 'Remboursement';
      default: return 'Transaction';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'recharge': return 'text-green-500';
      case 'payment': return 'text-red-500';
      case 'refund': return 'text-blue-400';
      default: return 'text-gray-400';
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
                <Icons.Wallet /> Mon Portefeuille
             </h1>
             <p className="text-gray-400 text-sm mt-2 max-w-md">
                Gérez votre budget et consultez votre historique de transactions.
             </p>
          </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-8">
        
        {/* BALANCE CARD (Dark Premium Style) */}
        <div className="relative overflow-hidden bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl backdrop-blur-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold flex items-center gap-2"><Icons.CreditCard /> Solde Actuel</p>
                 <p className="text-5xl font-bold text-white tracking-tight">{balance.toFixed(2)} <span className="text-2xl text-red-500 font-normal">DH</span></p>
              </div>
              
              <button
                onClick={() => setShowRecharge(!showRecharge)}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg border border-white/10 flex items-center gap-2 ${
                    showRecharge 
                    ? 'bg-black/50 text-white hover:bg-black/70' 
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
                }`}
              >
                {showRecharge ? 'Fermer' : <><Icons.Plus /> Recharger</>}
              </button>
           </div>
        </div>

        {/* RECHARGE FORM SECTION */}
        {showRecharge && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 mb-8 animate-in slide-in-from-top-4 duration-300 shadow-xl">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Icons.QrCode /> Recharger mon compte
             </h2>
             
             {!qrCodeData ? (
                 <form onSubmit={handleRecharge} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Montant à créditer (DH)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={rechargeAmount}
                                onChange={(e) => setRechargeAmount(e.target.value)}
                                min="10"
                                max="1000"
                                step="10"
                                className="w-full bg-black/40 border border-white/10 text-white text-lg p-4 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
                                placeholder="Ex: 100"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">DH</span>
                        </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {[50, 100, 200, 500].map((amount) => (
                            <button
                                key={amount}
                                type="button"
                                onClick={() => setRechargeAmount(amount.toString())}
                                className="px-4 py-2 bg-black/40 border border-white/10 text-gray-300 rounded-lg hover:bg-red-600/20 hover:text-red-500 hover:border-red-600/50 transition-all font-medium text-sm"
                            >
                                {amount} DH
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={recharging}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/20 disabled:opacity-50 transition-all uppercase tracking-wide text-sm"
                    >
                        {recharging ? 'Génération...' : 'GÉNÉRER QR CODE DE PAIEMENT'}
                    </button>
                 </form>
             ) : (
                 // QR CODE DISPLAY
                 <div className="text-center bg-black/40 rounded-xl p-8 border border-white/10">
                    <div className="mb-6">
                        <div className="inline-block p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <QRCode value={qrCodeData} size={220} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Scannez pour payer</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                        Présentez ce code à la caisse de la cafétéria pour valider votre rechargement.
                    </p>
                    <button 
                        onClick={() => setQrCodeData('')}
                        className="text-gray-400 hover:text-white underline text-sm font-medium"
                    >
                        Générer un autre montant
                    </button>
                 </div>
             )}
          </div>
        )}

        {/* TRANSACTION HISTORY */}
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Icons.History /> Historique des Transactions</h2>
           
           {transactions.length === 0 ? (
               <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-white/10 border-dashed">
                   <p className="text-gray-500 text-sm">Aucune transaction pour le moment.</p>
               </div>
           ) : (
               <div className="space-y-3">
                   {transactions.map((transaction) => (
                       <div 
                           key={transaction._id}
                           className="flex justify-between items-center p-5 bg-[#1a1a1a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                       >
                           <div className="flex items-center gap-4">
                               {/* Icone simple basée sur le type */}
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border border-white/10 ${
                                   transaction.type === 'payment' ? 'bg-red-900/20 text-red-500' : 
                                   transaction.type === 'recharge' ? 'bg-green-900/20 text-green-500' : 'bg-blue-900/20 text-blue-400'
                               }`}>
                                   {transaction.type === 'payment' ? <Icons.ArrowUpRight /> : <Icons.ArrowDownLeft />}
                               </div>
                               <div>
                                   <p className="font-bold text-white capitalize">
                                       {getTransactionLabel(transaction.type)}
                                   </p>
                                   <div className="flex items-center gap-2 text-xs text-gray-400">
                                       <span>{new Date(transaction.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</span>
                                       {transaction.description && <span>• {transaction.description}</span>}
                                   </div>
                               </div>
                           </div>
                           
                           <div className="text-right">
                               <p className={`text-base font-bold ${getTransactionColor(transaction.type)}`}>
                                   {transaction.type === 'payment' ? '-' : '+'} {transaction.amount.toFixed(2)} DH
                               </p>
                               <p className="text-xs text-gray-500 font-mono">
                                   Solde: {transaction.balanceAfter.toFixed(2)} DH
                               </p>
                           </div>
                       </div>
                   ))}
               </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default Wallet;