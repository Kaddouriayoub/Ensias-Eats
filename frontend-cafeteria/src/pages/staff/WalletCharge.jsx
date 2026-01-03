import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import staffService from '../../services/staffService';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const WalletCharge = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Common amounts for quick selection
  const quickAmounts = [50, 100, 200, 500];

  // Select appropriate service based on role
  const service = isAdmin() ? adminService : staffService;

  useEffect(() => {
    if (selectedStudent) {
      fetchTransactionHistory();
    }
  }, [selectedStudent]);

  // Auto-search as user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    const delaySearch = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce 300ms

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await service.searchStudents(searchTerm);
      setSearchResults(response.data || []);

      if (response.data.length === 0) {
        setError('No students found matching your search');
      }
    } catch (err) {
      console.error('Error searching students:', err);
      setError('Failed to search students: ' + (err.response?.data?.message || err.message));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    if (!selectedStudent) return;

    try {
      setLoadingTransactions(true);
      let response;
      if (isAdmin()) {
        response = await adminService.getUserWallet(selectedStudent._id);
        setTransactions(response.data?.recentTransactions || []);
      } else {
        response = await staffService.getWalletTransactions({
          userId: selectedStudent._id,
          limit: 10
        });
        setTransactions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSelectStudent = (student) => {
    // Ensure walletBalance is available at top level for consistency
    const studentWithBalance = {
      ...student,
      walletBalance: student.wallet?.balance || 0
    };
    setSelectedStudent(studentWithBalance);
    setSearchResults([]);
    setSearchTerm('');
    setAmount('');
    setPaymentMethod('cash');
    setNote('');
    setError(null);
    setSuccess(null);
  };

  const handleChargeWallet = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      setError('Please select a student first');
      return;
    }

    const chargeAmount = parseFloat(amount);
    if (isNaN(chargeAmount) || chargeAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      let response;
      if (isAdmin()) {
        // Admin uses different API
        response = await adminService.chargeUserWallet(
          selectedStudent._id,
          chargeAmount,
          note.trim() || `Wallet top-up (${paymentMethod})`
        );
      } else {
        // Staff uses original API
        const walletData = {
          studentId: selectedStudent._id,
          amount: chargeAmount,
          paymentMethod,
          notes: note.trim()
        };
        response = await staffService.chargeWallet(walletData);
      }

      // Update student balance in UI
      const newBalance = isAdmin()
        ? response.data?.wallet?.balance
        : response.data?.newBalance;

      setSelectedStudent({
        ...selectedStudent,
        walletBalance: newBalance || (selectedStudent.walletBalance + chargeAmount)
      });

      setSuccess(response.message || `Successfully charged ${chargeAmount.toFixed(2)} MAD to ${selectedStudent.name}'s wallet`);
      setAmount('');
      setPaymentMethod('cash');
      setNote('');

      // Refresh transaction history
      fetchTransactionHistory();
    } catch (err) {
      console.error('Error charging wallet:', err);
      setError('Failed to charge wallet: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Wallet Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">Search students, manage balances, and view transaction history.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column - Search & Charge */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Search */}
          {!selectedStudent && (
            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Find Student</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Step 1
                </span>
              </div>
              <div className="p-6">

              <div className="max-w-xl">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Criteria</label>
                <div className="flex gap-3">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="search"
                      placeholder="Enter name, email, or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                      className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm py-2.5 border"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {searchResults.length} student{searchResults.length !== 1 ? 's' : ''} found:
                  </p>
                  {searchResults.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => handleSelectStudent(student)}
                      className="p-4 bg-white rounded-lg hover:bg-red-50 cursor-pointer transition-all border border-gray-200 hover:border-red-300 shadow-sm group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          {student.studentId && (
                            <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            {student.wallet?.balance?.toFixed(2) || '0.00'} MAD
                          </p>
                          <p className="text-xs text-gray-500">Current Balance</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}

          {/* Selected Student & Charge Form */}
          {selectedStudent && (
            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Charge Wallet
                </h3>
              </div>

              <div className="p-6">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl font-bold border border-white/30">
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{selectedStudent.name}</p>
                      <p className="text-red-100 text-sm">{selectedStudent.email}</p>
                      {selectedStudent.studentId && (
                        <p className="text-red-200 text-xs mt-0.5 font-mono">ID: {selectedStudent.studentId}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-100 text-sm font-medium mb-1">Current Balance</p>
                    <p className="text-3xl font-bold tracking-tight">
                      {selectedStudent.walletBalance?.toFixed(2) || '0.00'} <span className="text-lg font-normal opacity-80">MAD</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Charge Form */}
              <form onSubmit={handleChargeWallet}>
                <div className="space-y-6">
                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quick Select Amount
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {quickAmounts.map((quickAmount) => (
                        <button
                          key={quickAmount}
                          type="button"
                          onClick={() => handleQuickAmount(quickAmount)}
                          className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            amount === quickAmount.toString()
                              ? 'bg-red-600 text-white shadow-md transform scale-105'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {quickAmount} MAD
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (MAD) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">MAD</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="block w-full pl-12 rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 py-3"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 py-3"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Note Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="block w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 py-3"
                      placeholder="e.g., Cash payment received"
                    />
                  </div>

                  {/* New Balance Preview */}
                  {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <span className="text-sm font-medium text-green-800">New Balance Preview</span>
                      </div>
                      <span className="text-xl font-bold text-green-700">
                        {((selectedStudent.walletBalance || 0) + parseFloat(amount)).toFixed(2)} MAD
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !amount}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                  >
                    {loading ? 'Processing...' : `Charge ${amount ? parseFloat(amount).toFixed(2) : '0.00'} MAD`}
                  </button>
                </div>
              </form>
            </div>
            </div>
          )}
        </div>

        {/* Side Column - Instructions or History */}
        <div className="lg:col-span-1">
          {selectedStudent ? (
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 h-fit">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Transaction History</h3>
            </div>
            <div className="p-6">

            {loadingTransactions ? (
              <div className="text-center py-8 text-gray-500">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transaction history found
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="p-4 bg-white rounded-xl border border-gray-100 hover:border-red-200 transition-all shadow-sm hover:shadow-md group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'charge' || transaction.type === 'credit' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'refund' ? 'bg-red-100 text-red-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'charge' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          ) : transaction.type === 'refund' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {transaction.type === 'charge' || transaction.type === 'credit' ? 'Wallet Top-up' :
                             transaction.type === 'order' || transaction.type === 'debit' ? 'Order Payment' :
                             transaction.type === 'refund' ? 'Refund Processed' :
                             transaction.type}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          transaction.type === 'charge' || transaction.type === 'credit' || transaction.type === 'refund'
                            ? 'text-green-600'
                            : 'text-gray-900'
                        }`}>
                          {transaction.type === 'charge' || transaction.type === 'credit' || transaction.type === 'refund' ? '+' : '-'}
                          {transaction.amount?.toFixed(2)} MAD
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          Bal: {transaction.balanceAfter?.toFixed(2)} MAD
                        </p>
                      </div>
                    </div>
                    {transaction.note && (
                      <p className="text-sm text-gray-600 mt-1">
                        Note: {transaction.note}
                      </p>
                    )}
                    {transaction.performedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        By: {transaction.performedBy.name || transaction.performedBy.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
          ) : (
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-red-50/50">
              <h3 className="text-lg font-medium leading-6 text-red-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Instructions
              </h3>
            </div>
            <div className="p-6">
            <nav aria-label="Progress">
              <ol role="list" className="overflow-hidden">
                {[
                  'Search for the student using their name, email, or student ID',
                  'Select the student from the search results',
                  'Enter the cash amount received from the student',
                  'Add an optional note for record-keeping',
                  'Click "Charge" to add the amount to their wallet'
                ].map((step, stepIdx, steps) => (
                  <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pb-8' : ''}`}>
                    {stepIdx !== steps.length - 1 ? (
                      <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex items-start group">
                      <span className="h-9 flex items-center">
                        <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-red-100 rounded-full group-hover:bg-red-200 transition-colors border-2 border-white shadow-sm">
                          <span className="text-red-600 font-bold text-sm">{stepIdx + 1}</span>
                        </span>
                      </span>
                      <span className="ml-4 min-w-0 flex flex-col">
                        <span className="text-sm font-medium text-gray-700 mt-2">{step}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-6 rounded-lg bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Important</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      Always verify the cash amount before charging the wallet. All transactions are logged and cannot be undone without admin approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletCharge;