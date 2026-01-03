import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import staffService from '../../services/staffService';

const DashboardStyled = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      if (isAdmin()) {
        const response = await adminService.getDashboardStats();
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', borderRadius: '8px' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: '#6b7280' }}>
          {isAdmin() ? "Here's an overview of your cafeteria system" : "Here's your daily overview"}
        </p>
      </div>

      {/* Admin Stats */}
      {isAdmin() && stats && (
        <>
          {/* User Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <StatCard
              title="Total Students"
              value={stats.users?.total || 0}
              icon="👥"
              color="#3b82f6"
              subtitle={`${stats.users?.suspended || 0} suspended`}
            />
            <StatCard
              title="Total Staff"
              value={stats.staff?.total || 0}
              icon="👨‍💼"
              color="#10b981"
            />
            <StatCard
              title="Total Orders"
              value={stats.orders?.total || 0}
              icon="📦"
              color="#8b5cf6"
              subtitle={`${stats.orders?.pending || 0} pending`}
            />
            <StatCard
              title="Total Revenue"
              value={`${stats.revenue?.total || 0} DH`}
              icon="💰"
              color="#f59e0b"
            />
          </div>

          {/* Meals Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <StatCard
              title="Total Meals"
              value={stats.meals?.total || 0}
              icon="🍽️"
              color="#f97316"
              subtitle={`${stats.meals?.active || 0} active`}
            />
            <StatCard
              title="Pending Orders"
              value={stats.orders?.pending || 0}
              icon="⏳"
              color="#ef4444"
            />
            <StatCard
              title="Suspended Users"
              value={stats.users?.suspended || 0}
              icon="🚫"
              color="#6b7280"
            />
          </div>
        </>
      )}

      {/* Staff Stats */}
      {!isAdmin() && stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <StatCard
              title="Orders Today"
              value={stats.ordersToday || 0}
              icon="📦"
              color="#3b82f6"
            />
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders || 0}
              icon="⏳"
              color="#f97316"
            />
            <StatCard
              title="Ready for Pickup"
              value={stats.readyOrders || 0}
              icon="✅"
              color="#10b981"
            />
            <StatCard
              title="My Reports"
              value={stats.pendingReports || 0}
              icon="📝"
              color="#8b5cf6"
            />
          </div>

          {/* Order Status Breakdown */}
          {stats.ordersByStatus && stats.ordersByStatus.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Today's Orders by Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                {stats.ordersByStatus.map((item) => (
                  <div key={item._id} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{item.count}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>{item._id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {isAdmin() ? (
            <>
              <QuickActionButton icon="👥" title="Manage Users" href="/users" />
              <QuickActionButton icon="🍽️" title="Manage Meals" href="/meals" />
              <QuickActionButton icon="👨‍💼" title="Manage Staff" href="/staff" />
            </>
          ) : (
            <>
              <QuickActionButton icon="📦" title="View Orders" href="/orders" />
              <QuickActionButton icon="💰" title="Charge Wallet" href="/wallet-charge" />
              <QuickActionButton icon="📝" title="Create Report" href="/my-reports" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{title}</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{value}</p>
          {subtitle && (
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>{subtitle}</p>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
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
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span style={{ fontSize: '32px', marginRight: '12px' }}>{icon}</span>
      <span style={{ fontWeight: '500', color: '#374151' }}>{title}</span>
    </a>
  );
};

// Helper function to adjust color brightness
const adjustColor = (color, amount) => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

export default DashboardStyled;
