import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import staffService from '../../services/staffService';

// Icons
const Icons = {
  Users: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Staff: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Orders: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Revenue: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Meals: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Pending: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Suspended: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Ready: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Reports: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Wallet: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Profit: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, [dateFilter]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      if (isAdmin()) {
        const params = dateFilter ? { startDate: dateFilter } : {};
        const response = await adminService.getDashboardStats(params);
        setStats(response.data);
      } else {
        const response = await staffService.getDashboard();
        setStats(response.data);
      }
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin() ? "Here's an overview of your cafeteria system" : "Here's your daily overview"}
          </p>
        </div>
        {isAdmin() && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Stats */}
      {isAdmin() && stats && (
        <>
          {/* User Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={stats.users?.total || 0}
              icon={Icons.Users}
              color="blue"
              subtitle={`${stats.users?.suspended || 0} suspended`}
            />
            <StatCard
              title="Total Staff"
              value={stats.staff?.total || 0}
              icon={Icons.Staff}
              color="green"
            />
            <StatCard
              title="Total Orders"
              value={stats.orders?.total || 0}
              icon={Icons.Orders}
              color="purple"
              subtitle={`${stats.orders?.pending || 0} pending`}
            />
            <StatCard
              title={dateFilter ? "Revenue" : "Monthly Revenue"}
              value={`${(dateFilter ? stats.revenue?.total : stats.revenue?.monthRevenue)?.toFixed(2) || 0} DH`}
              icon={Icons.Revenue}
              color="yellow"
              subtitle={!dateFilter ? `Today: ${stats.revenue?.todayRevenue?.toFixed(2) || 0} DH` : null}
            />
          </div>

          {/* Meals Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={dateFilter ? "Profit" : "Monthly Profit"}
              value={`${(dateFilter ? stats.revenue?.profit : stats.revenue?.monthProfit)?.toFixed(2) || 0} DH`}
              icon={Icons.Profit}
              color="green"
              subtitle={!dateFilter ? `Today: ${stats.revenue?.todayProfit?.toFixed(2) || 0} DH` : null}
            />
            <StatCard
              title="Total Meals"
              value={stats.meals?.total || 0}
              icon={Icons.Meals}
              color="orange"
              subtitle={`${stats.meals?.active || 0} active`}
            />
            <StatCard
              title="Pending Orders"
              value={stats.orders?.pending || 0}
              icon={Icons.Pending}
              color="red"
            />
            <StatCard
              title="Suspended Users"
              value={stats.users?.suspended || 0}
              icon={Icons.Suspended}
              color="gray"
            />
          </div>
        </>
      )}

      {/* Staff Stats */}
      {!isAdmin() && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Orders Today"
              value={stats.ordersToday}
              icon={Icons.Orders}
              color="blue"
            />
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={Icons.Pending}
              color="orange"
            />
            <StatCard
              title="Ready for Pickup"
              value={stats.readyOrders}
              icon={Icons.Ready}
              color="green"
            />
            <StatCard
              title="My Reports"
              value={stats.pendingReports}
              icon={Icons.Reports}
              color="purple"
            />
          </div>

          {/* Order Status Breakdown */}
          {stats.ordersByStatus && stats.ordersByStatus.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Today's Orders by Status
              </h3>
              <div className="flex flex-wrap gap-4">
                {stats.ordersByStatus.map((item) => {
                  const statusStyles = {
                    completed: 'bg-green-50 text-green-700 border-green-200',
                    cancelled: 'bg-red-50 text-red-700 border-red-200',
                    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    ready: 'bg-blue-50 text-blue-700 border-blue-200',
                    preparing: 'bg-orange-50 text-orange-700 border-orange-200',
                  };
                  const style = statusStyles[item._id] || 'bg-gray-50 text-gray-700 border-gray-200';
                  return (
                    <div key={item._id} className={`text-center p-4 rounded-xl border flex-1 min-w-[140px] ${style}`}>
                      <p className="text-3xl font-bold mb-1">{item.count}</p>
                      <p className="text-sm font-medium capitalize">{item._id}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin() ? (
            <>
              <QuickActionButton
                icon={Icons.Users}
                title="Manage Users"
                href="/users"
              />
              <QuickActionButton
                icon={Icons.Meals}
                title="Manage Meals"
                href="/meals"
              />
              <QuickActionButton
                icon={Icons.Staff}
                title="Manage Staff"
                href="/staff"
              />
            </>
          ) : (
            <>
              <QuickActionButton
                icon={Icons.Orders}
                title="View Orders"
                href="/orders"
              />
              <QuickActionButton
                icon={Icons.Wallet}
                title="Charge Wallet"
                href="/wallet-charge"
              />
              <QuickActionButton
                icon={Icons.Reports}
                title="Create Report"
                href="/my-reports"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Action Button
const QuickActionButton = ({ icon, title, href }) => {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
    >
      <span className="text-gray-400 group-hover:text-blue-600 transition-colors">{icon}</span>
      <span className="font-bold text-gray-700 group-hover:text-gray-900">{title}</span>
    </a>
  );
};

export default Dashboard;
