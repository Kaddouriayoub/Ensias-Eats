import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SidebarStyled = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Admin menu items
  const adminMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👥', label: 'User Management' },
    { path: '/meals', icon: '🍽️', label: 'Meal Management' },
    { path: '/staff', icon: '👨‍💼', label: 'Staff Management' },
    { path: '/reports', icon: '📋', label: 'Reports' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
  ];

  // Staff menu items
  const staffMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/orders', icon: '📦', label: 'Orders' },
    { path: '/wallet-charge', icon: '💰', label: 'Charge Wallet' },
    { path: '/my-reports', icon: '📝', label: 'My Reports' },
  ];

  const menuItems = isAdmin() ? adminMenuItems : staffMenuItems;

  return (
    <div style={{
      height: '100vh',
      width: '256px',
      background: 'linear-gradient(180deg, #2563eb 0%, #1e40af 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
    }}>
      {/* Logo/Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>ENSIAS Eats</h1>
        <p style={{ color: '#bfdbfe', fontSize: '14px', marginTop: '4px', margin: 0 }}>
          {isAdmin() ? 'Admin Panel' : 'Staff Panel'}
        </p>
      </div>

      {/* User Info */}
      <div style={{
        padding: '16px',
        background: 'rgba(30, 64, 175, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            marginRight: '12px'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '12px', color: '#bfdbfe', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
      }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive(item.path) ? 'white' : '#bfdbfe',
              background: isActive(item.path) ? '#1d4ed8' : 'transparent',
              marginBottom: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = '#1e40af';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#bfdbfe';
              }
            }}
          >
            <span style={{ fontSize: '20px', marginRight: '12px' }}>{item.icon}</span>
            <span style={{ fontWeight: '500' }}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            color: '#bfdbfe',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1e40af';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#bfdbfe';
          }}
        >
          <span style={{ fontSize: '20px', marginRight: '12px' }}>🚪</span>
          <span style={{ fontWeight: '500' }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarStyled;
